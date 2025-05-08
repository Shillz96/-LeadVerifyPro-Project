const express = require('express');
const router = express.Router();
const fireCrawlService = require('../services/firecrawl');
const ExcelParser = require('../utils/excel-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure file upload storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/leads');
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `leads_${timestamp}${ext}`);
  }
});

// Configure upload middleware
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept only Excel files
    const filetypes = /xlsx|xls/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'));
    }
  }
});

// Middleware to check if user has Pro subscription
const checkProAccess = (req, res, next) => {
  // Get user subscription status from the request
  // This would be set by your authentication middleware
  const isPro = req.user?.subscription?.level === 'pro' || req.user?.subscription?.level === 'premium';
  
  // For development, we can use a query parameter to simulate pro access
  if (process.env.NODE_ENV === 'development' && req.query.isPro === 'true') {
    req.isPro = true;
  } else {
    req.isPro = isPro;
  }
  
  next();
};

/**
 * @route   GET /api/firecrawl/counties
 * @desc    Get all available counties
 * @access  Public
 */
router.get('/counties', (req, res) => {
  try {
    const includeComing = req.query.includeComing === 'true';
    const counties = fireCrawlService.getCounties(includeComing);
    
    return res.status(200).json({
      success: true,
      data: counties
    });
  } catch (error) {
    console.error('Error getting counties:', error);
    return res.status(500).json({ 
      success: false, 
      error: { 
        message: 'Error getting counties',
        details: error.message
      } 
    });
  }
});

/**
 * @route   GET /api/firecrawl/counties/by-state
 * @desc    Get all counties grouped by state
 * @access  Public
 */
router.get('/counties/by-state', (req, res) => {
  try {
    const countiesByState = fireCrawlService.getCountiesByState();
    
    return res.status(200).json({
      success: true,
      data: countiesByState
    });
  } catch (error) {
    console.error('Error getting counties by state:', error);
    return res.status(500).json({ 
      success: false, 
      error: { 
        message: 'Error getting counties by state',
        details: error.message
      } 
    });
  }
});

/**
 * @route   POST /api/firecrawl/validate
 * @desc    Validate a list of leads using property data
 * @access  Private
 */
router.post('/validate', checkProAccess, async (req, res) => {
  try {
    const { leads, options = {} } = req.body;
    
    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: { 
          message: 'Invalid leads data. Please provide an array of lead objects.'
        } 
      });
    }
    
    // Pass pro status to the service
    options.isPro = req.isPro;
    
    const validatedLeads = await fireCrawlService.validateLeads(leads, options);
    
    return res.status(200).json({
      success: true,
      data: validatedLeads
    });
  } catch (error) {
    console.error('Error validating leads:', error);
    return res.status(500).json({ 
      success: false, 
      error: { 
        message: 'Error validating leads',
        details: error.message
      } 
    });
  }
});

/**
 * @route   POST /api/firecrawl/search
 * @desc    Search for properties by address
 * @access  Private
 */
router.post('/search', checkProAccess, async (req, res) => {
  try {
    const { address, city, state, zip, county } = req.body;
    
    if (!address) {
      return res.status(400).json({ 
        success: false, 
        error: { 
          message: 'Address is required for property search.'
        } 
      });
    }
    
    // Pass pro status to the service
    const options = {
      address, 
      city, 
      state, 
      zip, 
      county,
      isPro: req.isPro
    };
    
    const properties = await fireCrawlService.searchProperties(options);
    
    return res.status(200).json({
      success: true,
      data: properties
    });
  } catch (error) {
    console.error('Error searching properties:', error);
    return res.status(500).json({ 
      success: false, 
      error: { 
        message: 'Error searching properties',
        details: error.message
      } 
    });
  }
});

/**
 * @route   GET /api/firecrawl/property/:county/:id
 * @desc    Get property details by ID
 * @access  Private
 */
router.get('/property/:county/:id', checkProAccess, async (req, res) => {
  try {
    const { county, id } = req.params;
    
    if (!county || !id) {
      return res.status(400).json({ 
        success: false, 
        error: { 
          message: 'County and property ID are required.'
        } 
      });
    }
    
    const propertyDetails = await fireCrawlService.getPropertyDetails({
      propertyId: id,
      accountNumber: id,
      county,
      isPro: req.isPro
    });
    
    return res.status(200).json({
      success: true,
      data: propertyDetails
    });
  } catch (error) {
    console.error('Error getting property details:', error);
    return res.status(500).json({ 
      success: false, 
      error: { 
        message: 'Error getting property details',
        details: error.message
      } 
    });
  }
});

/**
 * @route   POST /api/firecrawl/batch-validate
 * @desc    Batch validate a list of properties
 * @access  Private
 */
router.post('/batch-validate', checkProAccess, async (req, res) => {
  try {
    const { properties } = req.body;
    
    if (!properties || !Array.isArray(properties) || properties.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: { 
          message: 'Invalid properties data. Please provide an array of property objects.'
        } 
      });
    }
    
    // Add pro status to each property
    properties.forEach(property => {
      property.isPro = req.isPro;
    });
    
    const validatedProperties = await fireCrawlService.batchValidateProperties(properties);
    
    return res.status(200).json({
      success: true,
      data: validatedProperties
    });
  } catch (error) {
    console.error('Error batch validating properties:', error);
    return res.status(500).json({ 
      success: false, 
      error: { 
        message: 'Error batch validating properties',
        details: error.message
      } 
    });
  }
});

/**
 * @route   POST /api/firecrawl/upload
 * @desc    Upload a file of leads for validation
 * @access  Private
 */
router.post('/upload', upload.single('file'), checkProAccess, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No file uploaded'
        }
      });
    }

    // Parse the Excel file
    const filePath = req.file.path;
    const leads = ExcelParser.parseLeadExcel(filePath);
    
    if (!leads || leads.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No valid lead data found in the file'
        }
      });
    }
    
    // Start the validation process - this might be async for large files
    const options = req.body.options ? JSON.parse(req.body.options) : {};
    
    // Add pro status to options
    options.isPro = req.isPro;
    
    // For very large files, we might want to process asynchronously
    // and return a job ID for the client to poll later
    if (leads.length > 100) {
      // Just return the parsed leads for now
      return res.status(200).json({
        success: true,
        message: 'File uploaded and parsed successfully',
        data: {
          totalLeads: leads.length,
          sampleLeads: leads.slice(0, 3), // First 3 leads as a sample
          filePath: req.file.path
        }
      });
    } else {
      // For smaller files, process immediately
      const validatedLeads = await fireCrawlService.validateLeads(leads, options);
      
      // Export the validated leads to a new Excel file
      const outputPath = path.join(
        path.dirname(filePath),
        `validated_${path.basename(filePath)}`
      );
      
      ExcelParser.exportToExcel(validatedLeads, outputPath);
      
      return res.status(200).json({
        success: true,
        message: 'File processed successfully',
        data: {
          validatedLeads,
          outputFile: outputPath
        }
      });
    }
  } catch (error) {
    console.error('Error processing uploaded file:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Error processing uploaded file',
        details: error.message
      }
    });
  }
});

/**
 * @route   GET /api/firecrawl/download/:filename
 * @desc    Download a processed leads file
 * @access  Private
 */
router.get('/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../uploads/leads', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'File not found'
        }
      });
    }
    
    // Send the file
    res.download(filePath);
  } catch (error) {
    console.error('Error downloading file:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Error downloading file',
        details: error.message
      }
    });
  }
});

/**
 * @route   POST /api/firecrawl/request-county
 * @desc    Request a new county to be added
 * @access  Private
 */
router.post('/request-county', async (req, res) => {
  try {
    const { county, state, email, reason } = req.body;
    
    if (!county || !state) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'County and state are required'
        }
      });
    }
    
    // Here you would typically store the request in a database
    // and notify administrators
    
    // For now, we'll just return a success message
    return res.status(200).json({
      success: true,
      message: 'County request submitted successfully',
      data: {
        county,
        state,
        estimatedTime: '2-4 weeks'
      }
    });
  } catch (error) {
    console.error('Error requesting county:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Error requesting county',
        details: error.message
      }
    });
  }
});

module.exports = router; 