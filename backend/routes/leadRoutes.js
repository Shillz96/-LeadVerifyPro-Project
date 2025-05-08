const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const { authenticate } = require('../middleware/auth');
const { needsSplitting, splitExcelFile, cleanupSplitFiles } = require('../utils/fileSplitter');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function(req, file, cb) {
    // Add timestamp to filename to prevent duplicates
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// Accept CSV and Excel files
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  const allowedExtensions = ['.csv', '.xls', '.xlsx'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV and Excel files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit file size to 10MB
  }
});

// GET /api/leads - Get all leads for the authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    // Fetch leads specifically associated with the authenticated user's ID
    const leads = await Lead.findByUserId(req.userId);
    res.status(200).json({
      success: true,
      message: 'Leads retrieved successfully.',
      data: leads
    });
  } catch (error) {
    // Log the detailed error for server-side diagnostics
    console.error('Error fetching leads:', error);
    // Send a standardized error message to the client
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An unexpected error occurred while retrieving leads.'
      }
    });
  }
});

/**
 * Standardizes lead data from various potential input column names.
 * It looks for common variations of field names (e.g., 'Full Name', 'Owner Full Name')
 * and maps them to a consistent internal structure.
 * Also collects multiple phone numbers into an array.
 * @param {object} row - A row object from the parsed CSV or Excel file.
 * @returns {object} - A standardized lead data object.
 */
function mapColumnNames(row) {
  // Preserve the original row data for reference or future use.
  const rawData = { ...row };
  
  // Initialize the standardized lead data structure.
  const leadData = {
    fullName: '',
    firstName: '',
    lastName: '',
    address: '',
    phoneNumbers: [],
    primaryPhone: '',
    email: '',
    county: '',
    state: '',
    rawData: rawData
  };
  
  // Name mapping
  leadData.fullName = row['Owner Full Name'] || row['Full Name'] || row['Name'] || row['name'] || '';
  leadData.firstName = row['Owner First Name'] || row['First Name'] || row['firstName'] || '';
  leadData.lastName = row['Owner Last Name'] || row['Last Name'] || row['lastName'] || '';
  
  // If we have first and last but no full name, create it
  if (!leadData.fullName && (leadData.firstName || leadData.lastName)) {
    leadData.fullName = `${leadData.firstName} ${leadData.lastName}`.trim();
  }
  
  // Address mapping
  leadData.address = row['Property Address'] || row['Address'] || row['address'] || '';
  
  // County and State mapping
  leadData.county = row['County Name'] || row['County'] || row['county'] || '';
  leadData.state = row['State'] || row['state'] || '';
  
  // Email mapping - ensure it's never undefined
  leadData.email = row['Email'] || row['email'] || row['Email Address'] || 'no-email@example.com';
  
  // Phone number mapping - collect all possible phone numbers
  const phoneFields = [
    'Phone', 'phone', 'Phone Number', 'phoneNumber',
    'Wireless 1', 'Wireless 2', 'Wireless 3', 'Wireless 4', 'Wireless 5',
    'Landline 1', 'Landline 2', 'Landline 3', 'Landline 4', 'Landline 5'
  ];
  
  phoneFields.forEach(field => {
    if (row[field] && row[field].trim() !== '') {
      leadData.phoneNumbers.push(row[field].trim());
    }
  });
  
  // Set primary phone (first available phone number)
  if (leadData.phoneNumbers.length > 0) {
    leadData.primaryPhone = leadData.phoneNumbers[0];
  }
  
  return leadData;
}

/**
 * Parses a CSV file stream and standardizes lead data.
 * Uses the 'csv-parser' library to handle streaming and parsing.
 * @param {string} filePath - Path to the CSV file.
 * @returns {Promise<Array<object>>} - A promise that resolves with an array of standardized lead objects.
 */
function parseCsvFile(filePath) {
  return new Promise((resolve, reject) => {
    // Array to accumulate the processed lead data.
    const leadsToInsert = [];

    fs.createReadStream(filePath)
      // Pipe the stream through csv-parser to convert CSV rows to objects.
      .pipe(csv())
      .on('data', (row) => {
        // For each row (data event), standardize the column names.
        const leadData = mapColumnNames(row);
        leadsToInsert.push(leadData);
      })
      // When the stream ends, resolve the promise with the collected leads.
      .on('end', () => {
        resolve(leadsToInsert);
      })
      // If an error occurs during streaming or parsing, reject the promise.
      .on('error', (error) => {
        reject(error);
      });
  });
}

/**
 * Parses an Excel file and standardizes lead data.
 * Uses the 'xlsx' library to handle file reading and conversion.
 * @param {string} filePath - Path to the Excel file.
 * @returns {Promise<Array<object>>} - A promise that resolves with an array of standardized lead objects.
 */
function parseExcelFile(filePath) {
  return new Promise((resolve, reject) => {
    try {
      // Use xlsx library to read the file content.
      const workbook = xlsx.readFile(filePath);
      // Assume data is in the first sheet.
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert the sheet to an array of JavaScript objects. 'defval: ''' handles empty cells.
      const jsonData = xlsx.utils.sheet_to_json(worksheet, { defval: '' });

      // Apply the column name standardization to each row.
      const leadsToInsert = jsonData.map(row => mapColumnNames(row));

      // Resolve the promise with the array of processed lead data.
      resolve(leadsToInsert);
    } catch (error) {
      // If any error occurs during file reading or parsing, reject the promise.
      reject(error);
    }
  });
}

// POST /api/leads/upload - Handles uploading, parsing, (optional) splitting, and saving leads.
router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  // Check if multer middleware successfully processed a file.
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'NO_FILE_UPLOADED',
        message: 'No file uploaded.'
      }
    });
  }

  // Store file path and original name for processing and cleanup.
  const filePath = req.file.path;
  const originalFilename = req.file.originalname;
  // Initially, assume we process the single uploaded file.
  let filesToProcess = [filePath];
  // Flag to track if splitting occurred, for cleanup purposes.
  let splitFiles = false;

  try {
    // Determine file type for parsing logic.
    const fileExt = path.extname(originalFilename).toLowerCase();

    // Check if the file (Excel only) needs splitting based on size or row count.
    if ((fileExt === '.xlsx' || fileExt === '.xls') && await needsSplitting(filePath)) {
      console.log(`File ${originalFilename} is large. Splitting into smaller chunks.`);
      // If splitting is needed, replace filesToProcess with the paths to the chunks.
      filesToProcess = await splitExcelFile(filePath);
      // Set the flag if multiple chunk files were created.
      splitFiles = filesToProcess.length > 1;
    }

    // Counter for the total number of leads successfully inserted.
    let totalLeadsInserted = 0;

    // Loop through the files (original file or multiple chunks).
    for (const currentFile of filesToProcess) {
      let leadsToInsert = [];

      // Select the appropriate parser based on the file extension.
      if (fileExt === '.csv') {
        leadsToInsert = await parseCsvFile(currentFile);
      } else if (fileExt === '.xlsx' || fileExt === '.xls') {
        leadsToInsert = await parseExcelFile(currentFile);
      } else {
        // This should theoretically not be reached due to multer fileFilter, but handle defensively.
        throw new Error('Unsupported file format');
      }

      // Enrich each lead object with the user ID, default status, and score.
      leadsToInsert = leadsToInsert.map(lead => ({
        ...lead,
        user: req.userId, // Associate lead with the logged-in user
        status: 'pending', // Initial status
        score: 0, // Initial score
        phone: lead.primaryPhone || '' // Map primaryPhone to the phone field required by schema
      }));

      // Insert leads into the database.
      if (leadsToInsert.length > 0) {
        // Use insertMany for efficiency, but break into smaller batches
        // to avoid potential MongoDB BSON size limits or performance issues.
        const batchSize = 1000;
        for (let i = 0; i < leadsToInsert.length; i += batchSize) {
          const batch = leadsToInsert.slice(i, i + batchSize);
          const insertedLeads = await Lead.insertMany(batch);
          totalLeadsInserted += batch.length;
          console.log(`Inserted batch of ${batch.length} leads from ${path.basename(currentFile)}`);
        }
      }
    }

    // If the file was split, clean up the temporary chunk files.
    if (splitFiles) {
      await cleanupSplitFiles(filesToProcess);
    }

    // Get the IDs of all leads for the current user to return
    const userLeads = await Lead.find({ user: req.userId }).select('_id');
    const leadIds = userLeads.map(lead => lead._id);

    // Send response with lead IDs for further verification
    res.status(201).json({
      success: true,
      message: 'Leads uploaded successfully.',
      data: {
        count: totalLeadsInserted,
        leadIds: leadIds
      }
    });
  } catch (error) {
    // Catch any errors during splitting, parsing, or database insertion.
    console.error('Error processing file upload:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FILE_PROCESSING_ERROR',
        message: 'Error processing file upload.',
        details: error.message
      }
    });
  } finally {
    // Always attempt to clean up the originally uploaded file,
    // regardless of whether splitting occurred or if there was an error.
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up original uploaded file: ${filePath}`);
      }
    } catch (err) {
      // Log cleanup errors but don't let them crash the response.
      console.error('Error deleting original uploaded file:', err);
    }
  }
});

// POST /api/leads/verify - Verifies leads using integrated verification service
router.post('/verify', authenticate, async (req, res) => {
  try {
    // Import the verification service
    const verificationService = require('../utils/verificationService');
    
    // Determine which leads to verify: either specific IDs from the request body
    // or all leads belonging to the user that are currently 'pending'.
    const leadIds = req.body.leadIds || [];
    let leadsToVerify;

    if (leadIds.length > 0) {
      // Find specific leads by ID, ensuring they belong to the authenticated user.
      leadsToVerify = await Lead.find({
        _id: { $in: leadIds },
        user: req.userId
      });
    } else {
      // Find all leads for the user with 'pending' status.
      leadsToVerify = await Lead.find({
        status: 'pending',
        user: req.userId
      });
    }

    // If no leads match the criteria, return a 404.
    if (leadsToVerify.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'No leads found to verify based on the provided criteria.'
        }
      });
    }

    // Process verification in batches to avoid overwhelming resources
    const batchSize = 10;  // Process 10 leads at a time
    const results = [];
    
    // Process in batches
    for (let i = 0; i < leadsToVerify.length; i += batchSize) {
      const batch = leadsToVerify.slice(i, i + batchSize);
      console.log(`Processing verification batch ${i/batchSize + 1} of ${Math.ceil(leadsToVerify.length/batchSize)}`);
      
      // Use Promise.all to process batch concurrently
      const batchResults = await Promise.all(batch.map(async (lead) => {
        try {
          // Verify lead with comprehensive service
          const verificationResult = await verificationService.verifyLead(lead);
          
          // Update lead with verification results
          await lead.updateVerification(verificationResult);
          
          return {
            leadId: lead._id,
            status: lead.verificationStatus,
            details: {
              phone: verificationResult.phoneVerification ? verificationResult.phoneVerification.isValid : null,
              email: verificationResult.emailVerification ? verificationResult.emailVerification.isValid : null,
              address: verificationResult.addressVerification ? verificationResult.addressVerification.isValid : null
            }
          };
        } catch (error) {
          console.error(`Error verifying lead ${lead._id}:`, error.message);
          
          // Mark as failed if verification encounters error
          await lead.updateVerification({ 
            isValid: false, 
            reason: `Verification error: ${error.message}` 
          });
          
          return {
            leadId: lead._id,
            status: 'failed',
            error: error.message
          };
        }
      }));
      
      results.push(...batchResults);
      
      // Add a small delay between batches to avoid overwhelming the server
      if (i + batchSize < leadsToVerify.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Summarize verification results by status
    const summary = {
      verified: results.filter(r => r.status === 'verified').length,
      partially_verified: results.filter(r => r.status === 'partially_verified').length,
      failed: results.filter(r => r.status === 'failed').length,
      total: results.length
    };

    // Respond with a summary of the verification process.
    res.status(200).json({
      success: true,
      message: 'Lead verification process completed.',
      data: {
        verifiedCount: results.length,
        summary: summary,
        results: results
      }
    });

  } catch (error) {
    // Catch any errors during database lookup or update.
    console.error('Error verifying leads:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'VERIFICATION_ERROR',
        message: 'An error occurred during the lead verification process.',
        details: error.message
      }
    });
  }
});

// POST /api/leads/score - Scores leads using the scoring service
router.post('/score', authenticate, async (req, res) => {
  try {
    // Import the scoring service
    const scoringService = require('../utils/scoringService');
    
    // Determine which leads to score: either specific IDs from the request body
    // or all verified leads for the user that haven't been scored yet.
    const leadIds = req.body.leadIds || [];
    const customWeights = req.body.weights || null;
    let leadsToScore;

    if (leadIds.length > 0) {
      // Find specific leads by ID, ensuring they belong to the user.
      // No longer restrict to only verified leads - allow scoring any lead
      leadsToScore = await Lead.find({
        _id: { $in: leadIds },
        user: req.userId
      });
    } else {
      // Find all verified leads for the user that still have the default score (0).
      leadsToScore = await Lead.find({
        user: req.userId,
        $or: [
          { verificationStatus: 'verified', score: 0 },
          { verificationStatus: 'partially_verified', score: 0 }
        ]
      });
    }

    // If no leads match the criteria, return a 404.
    if (leadsToScore.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'No leads found to score based on the provided criteria.'
        }
      });
    }

    // Process scoring in batches to avoid overwhelming resources
    const batchSize = 50;  // Process 50 leads at a time
    const results = [];
    
    // Process in batches
    for (let i = 0; i < leadsToScore.length; i += batchSize) {
      const batch = leadsToScore.slice(i, i + batchSize);
      console.log(`Processing scoring batch ${i/batchSize + 1} of ${Math.ceil(leadsToScore.length/batchSize)}`);
      
      // Score batch using service
      for (const lead of batch) {
        try {
          // Apply scoring with custom weights if provided
          const scoreResult = scoringService.calculateLeadScore(lead, customWeights);
          
          // Update lead with scoring results
          await lead.updateScore(scoreResult);
          
          results.push({
            leadId: lead._id,
            score: scoreResult.score,
            category: scoreResult.category,
            details: {
              contactQuality: scoreResult.components.contactQuality.weightedScore,
              propertyQuality: scoreResult.components.propertyQuality.weightedScore,
              verificationStatus: scoreResult.components.verificationStatus.weightedScore,
              ownershipVerified: scoreResult.components.ownershipVerified.weightedScore
            }
          });
        } catch (error) {
          console.error(`Error scoring lead ${lead._id}:`, error.message);
          results.push({
            leadId: lead._id,
            error: error.message
          });
        }
      }
    }

    // Summarize scoring results by category
    const summary = {
      hot: results.filter(r => r.category === 'Hot').length,
      warm: results.filter(r => r.category === 'Warm').length,
      cold: results.filter(r => r.category === 'Cold').length,
      error: results.filter(r => r.error).length,
      total: results.length
    };

    // Respond with a summary of the scoring process.
    res.status(200).json({
      success: true,
      message: 'Lead scoring process completed.',
      data: {
        scoredCount: results.length,
        summary: summary,
        results: results
      }
    });

  } catch (error) {
    // Catch any errors during database lookup or update.
    console.error('Error scoring leads:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SCORING_ERROR',
        message: 'An error occurred during the lead scoring process.',
        details: error.message
      }
    });
  }
});

// POST /api/leads - Create a new lead manually
// This route is distinct from /upload for individual lead creation via UI for example.
router.post('/', authenticate, async (req, res) => {
  try {
    const leadData = req.body;
    const { fullName, email, address, phone, company, notes, status, score, source } = leadData;

    // Basic validation
    if (!fullName || !email) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Full name and email are required fields.'
        }
      });
    }

    // Create the new lead associated with the authenticated user
    const newLead = new Lead({
      fullName,
      email,
      address,
      phone: phone || '', // Ensure phone is not undefined
      company,
      notes,
      status: status || 'pending', // Default status if not provided
      score: score || 0,           // Default score if not provided
      source: source || 'manual',  // Default source if not provided
      user: req.userId,          // Associate lead with the authenticated user
      verificationStatus: 'pending', // Initial verification status
      // rawData: leadData // Optionally store the entire input if needed for history/debugging
    });

    const savedLead = await newLead.save();

    res.status(201).json({
      success: true,
      message: 'Lead created successfully.',
      data: savedLead
    });

  } catch (error) {
    console.error('Error creating lead:', error);
    // Check for Mongoose validation error
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Lead validation failed.',
          details: error.message
        }
      });
    }
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An unexpected error occurred while creating the lead.'
      }
    });
  }
});

// GET /api/leads/:id - Get a single lead by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const leadId = req.params.id;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID_FORMAT',
          message: 'Invalid lead ID format.'
        }
      });
    }

    const lead = await Lead.findOne({ _id: leadId, user: req.userId });

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lead not found or you do not have permission to access it.'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: lead
    });

  } catch (error) {
    console.error(`Error fetching lead ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An unexpected error occurred while fetching the lead.'
      }
    });
  }
});

// PUT /api/leads/:id - Update an existing lead
router.put('/:id', authenticate, async (req, res) => {
  try {
    const leadId = req.params.id;
    const updateData = req.body;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID_FORMAT',
          message: 'Invalid lead ID format.'
        }
      });
    }

    // Prevent updating the user association or _id
    delete updateData.user;
    delete updateData._id;

    // Find the lead and ensure it belongs to the authenticated user
    const lead = await Lead.findOneAndUpdate(
      { _id: leadId, user: req.userId },
      { $set: updateData },
      { new: true, runValidators: true } // new: true returns the updated doc, runValidators ensures schema validation on update
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lead not found, you do not have permission to update it, or no changes were made.'
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lead updated successfully.',
      data: lead
    });

  } catch (error) {
    console.error(`Error updating lead ${req.params.id}:`, error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Lead update validation failed.',
          details: error.message
        }
      });
    }
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An unexpected error occurred while updating the lead.'
      }
    });
  }
});

// DELETE /api/leads/:id - Delete a lead
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const leadId = req.params.id;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID_FORMAT',
          message: 'Invalid lead ID format.'
        }
      });
    }

    const lead = await Lead.findOneAndDelete({ _id: leadId, user: req.userId });

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Lead not found or you do not have permission to delete it.'
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully.',
      data: { id: leadId } // Confirm which lead was deleted
    });

  } catch (error) {
    console.error(`Error deleting lead ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'An unexpected error occurred while deleting the lead.'
      }
    });
  }
});

module.exports = router; 