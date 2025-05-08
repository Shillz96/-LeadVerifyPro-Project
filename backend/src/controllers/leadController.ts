import { Request, Response, NextFunction } from 'express';
import multer from 'multer'; // multer might be used in routes, but types are useful here
import csv from 'csv-parser';
import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
// import mongoose from 'mongoose'; // If using mongoose specific types like ObjectId
import { asyncHandler, ValidationError, NotFoundError } from '../middleware/errorHandlers'; // Fix the import path

// --- Type Definitions (Placeholders - expand as needed) ---
interface RawLeadData { [key: string]: any; }

interface LeadInputData {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  phoneNumbers?: string[];
  primaryPhone?: string;
  email?: string;
  county?: string;
  state?: string;
  // Add any other fields that are directly input or mapped
  company?: string;
  notes?: string;
  status?: string; // e.g., 'pending', 'verified', 'contacted'
  score?: number;
  source?: string; // e.g., 'upload', 'manual', 'api'
  verificationStatus?: string; // e.g., 'pending', 'verified', 'failed', 'partially_verified'
  rawData?: RawLeadData; // To store the original row
  phone?: string; // Add phone property for backward compatibility
  user?: string; // Include user property for updates
}

interface LeadType extends LeadInputData {
  _id?: string; // Or your specific ID type
  user: string; // User ID associated with the lead
  createdAt?: Date;
  updatedAt?: Date;

  // Placeholder methods - implement in LeadModel
  save: () => Promise<LeadType>;
  // Example: updateVerification: (result: any) => Promise<void>;
  // Example: updateScore: (result: any) => Promise<void>;
}

interface VerificationResult {
  isValid: boolean;
  phoneVerification?: { isValid: boolean; details?: any };
  emailVerification?: { isValid: boolean; details?: any };
  addressVerification?: { isValid: boolean; details?: any };
  reason?: string; // For failure or partial verification
  // Add other fields returned by your actual verification service
}

interface ScoreResult {
  score: number;
  category: 'Hot' | 'Warm' | 'Cold' | 'Error';
  components?: { // Example components, adjust to your actual scoring logic
    contactQuality?: { rawScore: number; weightedScore: number };
    propertyQuality?: { rawScore: number; weightedScore: number };
    verificationStatus?: { rawScore: number; weightedScore: number };
    ownershipVerified?: { rawScore: number; weightedScore: number }; // Example from JS
  };
  // Add other relevant scoring details
}

interface CustomWeights { // Define based on your scoringService needs
  contactQualityWeight?: number;
  propertyQualityWeight?: number;
  verificationStatusWeight?: number;
  ownershipVerifiedWeight?: number;
  // Add other weights
}

// --- Mock Lead Model (Class Implementation) ---
// Replace with your actual Mongoose/ORM Lead model
class LeadModel implements LeadType {
  _id?: string;
  user: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  phoneNumbers?: string[];
  primaryPhone?: string;
  email?: string;
  county?: string;
  state?: string;
  company?: string;
  notes?: string;
  status?: string;
  score?: number;
  source?: string;
  verificationStatus?: string;
  rawData?: RawLeadData;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(data: Partial<LeadType> & { user: string }) { // user is required
    this._id = data._id || `mock_lead_${Date.now()}`;
    this.user = data.user;
    this.fullName = data.fullName;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.address = data.address;
    this.phoneNumbers = data.phoneNumbers || [];
    this.primaryPhone = data.primaryPhone;
    this.email = data.email;
    this.county = data.county;
    this.state = data.state;
    this.company = data.company;
    this.notes = data.notes;
    this.status = data.status || 'pending';
    this.score = data.score || 0;
    this.source = data.source || 'upload';
    this.verificationStatus = data.verificationStatus || 'pending';
    this.rawData = data.rawData;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  async save(): Promise<LeadType> {
    this.updatedAt = new Date();
    // Mock save: In a real scenario, this interacts with a database.
    // For now, we can log or simulate it.
    console.log(`Mock LeadModel.save() called for lead: ${this._id || this.email}`);
    // Simulate saving by adding to a mock in-memory store if needed for other functions
    mockLeadDb.set(this._id!, this);
    return this;
  }
  
  static async findByUserId(userId: string): Promise<LeadType[]> {
    const userLeads: LeadType[] = [];
    mockLeadDb.forEach(lead => {
        if (lead.user === userId) {
            userLeads.push(lead);
        }
    });
    return userLeads;
  }

  static async insertMany(leads: Partial<LeadType>[]): Promise<LeadType[]> {
    const insertedLeads: LeadType[] = [];
    for (const leadData of leads) {
      if (!leadData.user) throw new Error('User ID is required for inserting leads');
      const newLead = new LeadModel(leadData as Partial<LeadType> & { user: string });
      await newLead.save(); // Uses the instance save method
      insertedLeads.push(newLead);
    }
    return insertedLeads;
  }
  
  static async find(query: any): Promise<LeadType[]> { // Basic find for now
    const results: LeadType[] = [];
    mockLeadDb.forEach(lead => {
        let match = true;
        for (const key in query) {
            if (key === '_id' && query._id.$in && Array.isArray(query._id.$in)) {
                if (!query._id.$in.includes(lead._id)) {
                    match = false; break;
                }
            } else if (lead[key as keyof LeadType] !== query[key]) {
                match = false; break;
            }
        }
        if (match) results.push(lead);
    });
    return results;
  }

  // Add other static methods like findOne, findOneAndUpdate, findOneAndDelete as needed

  async updateVerification(result: VerificationResult): Promise<void> {
    // Determine overall status
    let newStatus = 'pending';
    if (result.isValid) {
        newStatus = 'verified';
    } else {
        // If not overall valid, check if any sub-verification passed for 'partially_verified'
        const phoneValid = result.phoneVerification?.isValid;
        const emailValid = result.emailVerification?.isValid;
        const addressValid = result.addressVerification?.isValid;
        if (phoneValid || emailValid || addressValid) {
            newStatus = 'partially_verified';
        } else {
            newStatus = 'failed';
        }
    }
    this.verificationStatus = newStatus;

    // Optionally, store more detailed results or update specific fields
    // For example, you might have fields like isPhoneVerified, isEmailVerified on LeadType
    // this.isPhoneVerified = result.phoneVerification?.isValid;
    // this.isEmailVerified = result.emailVerification?.isValid;
    // this.isAddressVerified = result.addressVerification?.isValid;

    if (result.reason) {
        this.notes = `${this.notes || ''}\n[Verification]: ${result.reason}`.trim();
    }
    await this.save();
  }

  async updateScore(result: ScoreResult): Promise<void> {
    this.score = result.score;
    // Example: Store category if you add a field for it in LeadType
    // this.leadCategory = result.category; 
    console.log(`Updating score for lead ${this._id} to ${result.score}`);
    await this.save();
  }
}

const Lead = LeadModel;
const mockLeadDb = new Map<string, LeadType>(); // In-memory DB for mock

// --- File Processing Utilities (adapted from leadRoutes.js) ---

// Placeholder for file splitting utilities - these would need more robust implementation
const needsSplitting = async (filePath: string): Promise<boolean> => {
  // Simple mock: split if > 5MB for demo. Real logic would be more complex.
  try {
    const stats = fs.statSync(filePath);
    return stats.size > 5 * 1024 * 1024; // 5MB
  } catch (error) {
    console.error('Error checking file size for splitting:', error);
    return false;
  }
};

const splitExcelFile = async (filePath: string): Promise<string[]> => {
  console.warn('splitExcelFile is a placeholder and does not actually split files yet.');
  // TODO: Implement actual Excel file splitting logic
  // This would involve reading the workbook, splitting sheets/rows into new workbooks,
  // and saving them as temporary files.
  return [filePath]; // Return original path as a mock
};

const cleanupSplitFiles = async (filePaths: string[]): Promise<void> => {
  console.log('cleanupSplitFiles called for:', filePaths);
  for (const filePath of filePaths) {
    try {
      // Add check to prevent deleting original if it wasn't actually a split chunk
      // This needs careful management based on how splitExcelFile names chunks.
      // For now, it's a simple unlink.
      // if (filePath.includes('_chunk_')) { // Example condition
      //   fs.unlinkSync(filePath);
      // }
    } catch (error) {
      console.error(`Error cleaning up split file ${filePath}:`, error);
    }
  }
};

function mapColumnNames(row: RawLeadData): LeadInputData {
  const leadData: LeadInputData = {
    phoneNumbers: [],
    rawData: { ...row } // Preserve original row
  };

  leadData.fullName = String(row['Owner Full Name'] || row['Full Name'] || row['Name'] || row['name'] || '').trim();
  leadData.firstName = String(row['Owner First Name'] || row['First Name'] || row['firstName'] || '').trim();
  leadData.lastName = String(row['Owner Last Name'] || row['Last Name'] || row['lastName'] || '').trim();
  
  if (!leadData.fullName && (leadData.firstName || leadData.lastName)) {
    leadData.fullName = `${leadData.firstName} ${leadData.lastName}`.trim();
  }
  
  leadData.address = String(row['Property Address'] || row['Address'] || row['address'] || '').trim();
  leadData.county = String(row['County Name'] || row['County'] || row['county'] || '').trim();
  leadData.state = String(row['State'] || row['state'] || '').trim();
  leadData.email = String(row['Email'] || row['email'] || row['Email Address'] || 'no-email@example.com').trim();
  
  const phoneFields = [
    'Phone', 'phone', 'Phone Number', 'phoneNumber',
    'Wireless 1', 'Wireless 2', 'Wireless 3', 'Wireless 4', 'Wireless 5',
    'Landline 1', 'Landline 2', 'Landline 3', 'Landline 4', 'Landline 5'
  ];
  
  phoneFields.forEach(field => {
    const phoneValue = String(row[field] || '').trim();
    if (phoneValue) {
      leadData.phoneNumbers!.push(phoneValue);
    }
  });
  
  if (leadData.phoneNumbers!.length > 0) {
    leadData.primaryPhone = leadData.phoneNumbers![0];
  }
  
  return leadData;
}

function parseCsvFile(filePath: string): Promise<LeadInputData[]> {
  return new Promise((resolve, reject) => {
    const leadsToInsert: LeadInputData[] = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row: RawLeadData) => {
        leadsToInsert.push(mapColumnNames(row));
      })
      .on('end', () => resolve(leadsToInsert))
      .on('error', (error) => reject(error));
  });
}

function parseExcelFile(filePath: string): Promise<LeadInputData[]> {
  return new Promise((resolve, reject) => {
    try {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: RawLeadData[] = xlsx.utils.sheet_to_json(worksheet, { defval: '' });
      const leadsToInsert = jsonData.map(row => mapColumnNames(row));
      resolve(leadsToInsert);
    } catch (error) {
      reject(error);
    }
  });
}

// --- Controller Methods ---

export const uploadLeads = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authenticatedUser = (req as any).user; // Populated by authenticate middleware
  if (!authenticatedUser || !authenticatedUser.id) {
    throw new ValidationError('User not authenticated for lead upload.'); // Or use specific AuthError
  }
  const userId = authenticatedUser.id;

  if (!req.file) {
    return res.status(400).json({ success: false, error: { code: 'NO_FILE_UPLOADED', message: 'No file uploaded.' } });
  }

  const filePath = req.file.path;
  const originalFilename = req.file.originalname;
  let filesToProcess = [filePath];
  let splitFilesOccurred = false; // Renamed to avoid conflict with fs.splitFiles if it existed

  try {
    const fileExt = path.extname(originalFilename).toLowerCase();

    if ((fileExt === '.xlsx' || fileExt === '.xls') && await needsSplitting(filePath)) {
      console.log(`File ${originalFilename} is large. Attempting to split.`);
      filesToProcess = await splitExcelFile(filePath); // This is a mock, will return [filePath]
      splitFilesOccurred = filesToProcess.length > 1 && filesToProcess[0] !== filePath; // Check if actual splitting happened
    }

    let totalLeadsInserted = 0;
    const allInsertedLeadIds: string[] = [];

    for (const currentFile of filesToProcess) {
      let leadsToParse: LeadInputData[];
      const currentFileExt = path.extname(currentFile).toLowerCase() || fileExt; // Use original ext if chunk has no ext

      if (currentFileExt === '.csv') {
        leadsToParse = await parseCsvFile(currentFile);
      } else if (currentFileExt === '.xlsx' || currentFileExt === '.xls') {
        leadsToParse = await parseExcelFile(currentFile);
      } else {
        throw new Error('Unsupported file format for parsing.');
      }

      const leadsToSave: Partial<LeadType>[] = leadsToParse.map(leadInput => ({
        ...leadInput,
        user: userId,
        status: 'pending',
        score: 0,
        verificationStatus: 'pending',
        source: 'upload',
        // The primaryPhone from mapColumnNames should be used for the 'phone' field if your Lead schema uses 'phone'
        // If LeadType uses primaryPhone directly, this mapping might not be needed here.
        // phone: leadInput.primaryPhone || '' // Assuming LeadType might have a simple 'phone' field
      }));

      if (leadsToSave.length > 0) {
        const batchSize = 1000; // As per original JS
        for (let i = 0; i < leadsToSave.length; i += batchSize) {
          const batch = leadsToSave.slice(i, i + batchSize);
          const insertedLeads = await Lead.insertMany(batch);
          totalLeadsInserted += insertedLeads.length;
          insertedLeads.forEach(l => l._id && allInsertedLeadIds.push(l._id));
          console.log(`Inserted batch of ${insertedLeads.length} leads from ${path.basename(currentFile)}`);
        }
      }
    }

    if (splitFilesOccurred && filesToProcess[0] !== filePath) { // Ensure original isn't deleted if no split occurred or it was the only file
      await cleanupSplitFiles(filesToProcess); 
    }

    res.status(201).json({
      success: true,
      message: 'Leads uploaded successfully.',
      data: { count: totalLeadsInserted, leadIds: allInsertedLeadIds }
    });

  } catch (error: any) {
    console.error('Error processing file upload:', error);
    res.status(500).json({
      success: false,
      error: { code: 'FILE_PROCESSING_ERROR', message: 'Error processing file upload.', details: error.message }
    });
  } finally {
    // Cleanup original uploaded file if it wasn't a chunk from splitting
    if (filePath !== filesToProcess[0] || !splitFilesOccurred) {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`Cleaned up original uploaded file: ${filePath}`);
            }
        } catch (err: any) {
            console.error('Error deleting original uploaded file:', err);
        }
    }
  }
});

// Placeholder for getAllLeads - GET /
export const getAllLeads = asyncHandler(async (req: Request, res: Response) => {
    const authenticatedUser = (req as any).user;
    if (!authenticatedUser || !authenticatedUser.id) {
        throw new ValidationError('User not authenticated.');
    }
    const leads = await Lead.findByUserId(authenticatedUser.id);
    res.status(200).json({ success: true, message: 'Leads retrieved successfully.', data: leads });
});

// POST /api/leads - Create a new lead manually
export const createLead = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authenticatedUser = (req as any).user;
  if (!authenticatedUser || !authenticatedUser.id) {
    throw new ValidationError('User not authenticated to create lead.');
  }
  const userId = authenticatedUser.id;

  const { fullName, email, address, phone, company, notes, status, score, source } = req.body as LeadInputData;

  if (!fullName || !email) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Full name and email are required fields.' } });
  }

  const newLeadData: Partial<LeadType> & { user: string } = {
    ...req.body, // Pass all provided fields
    user: userId,
    status: status || 'pending',
    score: score || 0,
    source: source || 'manual',
    verificationStatus: 'pending', // Default for new manual lead
  };

  try {
    const lead = new Lead(newLeadData);
    const savedLead = await lead.save();
    res.status(201).json({ success: true, message: 'Lead created successfully.', data: savedLead });
  } catch (error: any) {
    // Basic error handling, can be expanded (e.g. for Mongoose ValidationErrors)
    console.error('Error creating lead:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Error creating lead.', details: error.message } });
  }
});

// GET /api/leads/:id - Get a single lead by ID
export const getLeadById = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authenticatedUser = (req as any).user;
  if (!authenticatedUser || !authenticatedUser.id) {
    throw new ValidationError('User not authenticated.');
  }
  const userId = authenticatedUser.id;
  const leadId = req.params.id;

  // Add mock findOne method to LeadModel if it doesn't exist
  if (!(Lead as any).findOneByIdAndUser) {
      (Lead as any).findOneByIdAndUser = async (lId: string, uId: string): Promise<LeadType | null> => {
          const lead = mockLeadDb.get(lId);
          return (lead && lead.user === uId) ? lead : null;
      };
  }

  const lead = await (Lead as any).findOneByIdAndUser(leadId, userId);

  if (!lead) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Lead not found or you do not have permission to access it.' } });
  }
  res.status(200).json({ success: true, data: lead });
});

// PUT /api/leads/:id - Update an existing lead
export const updateLead = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authenticatedUser = (req as any).user;
  if (!authenticatedUser || !authenticatedUser.id) {
    throw new ValidationError('User not authenticated.');
  }
  const userId = authenticatedUser.id;
  const leadId = req.params.id;
  const updateData: Partial<LeadInputData> = req.body;

  // Prevent updating user association or _id directly
  delete updateData.user; 
  // delete (updateData as any)._id; // _id is not in LeadInputData, but good practice

   // Add mock findOneByIdAndUserForUpdate method to LeadModel if it doesn't exist
  if (!(Lead as any).findOneByIdAndUserForUpdate) {
      (Lead as any).findOneByIdAndUserForUpdate = async (lId: string, uId: string, data: Partial<LeadInputData>): Promise<LeadType | null> => {
          const lead = mockLeadDb.get(lId);
          if (lead && lead.user === uId) {
              Object.assign(lead, data, { updatedAt: new Date() });
              await lead.save(); // Persist to mock DB
              return lead;
          }
          return null;
      };
  }

  try {
    const updatedLead = await (Lead as any).findOneByIdAndUserForUpdate(leadId, userId, updateData);

    if (!updatedLead) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Lead not found, user mismatch, or no changes made.' } });
    }
    res.status(200).json({ success: true, message: 'Lead updated successfully.', data: updatedLead });
  } catch (error: any) {
    console.error(`Error updating lead ${leadId}:`, error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Error updating lead.', details: error.message } });
  }
});

// DELETE /api/leads/:id - Delete a lead
export const deleteLead = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authenticatedUser = (req as any).user;
  if (!authenticatedUser || !authenticatedUser.id) {
    throw new ValidationError('User not authenticated.');
  }
  const userId = authenticatedUser.id;
  const leadId = req.params.id;

  // Add mock findOneByIdAndUserForDelete method to LeadModel if it doesn't exist
  if (!(Lead as any).findOneByIdAndUserForDelete) {
      (Lead as any).findOneByIdAndUserForDelete = async (lId: string, uId: string): Promise<LeadType | null> => {
          const lead = mockLeadDb.get(lId);
          if (lead && lead.user === uId) {
              mockLeadDb.delete(lId);
              return lead; // Return the deleted lead for confirmation
          }
          return null;
      };
  }

  try {
    const deletedLead = await (Lead as any).findOneByIdAndUserForDelete(leadId, userId);

    if (!deletedLead) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Lead not found or user mismatch.' } });
    }
    res.status(200).json({ success: true, message: 'Lead deleted successfully.', data: { id: deletedLead._id } });
  } catch (error: any) {
    console.error(`Error deleting lead ${leadId}:`, error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Error deleting lead.', details: error.message } });
  }
});

// Mock Verification Service
const mockVerificationService = {
  verifyLead: async (lead: LeadType): Promise<VerificationResult> => {
    console.log(`Mock verifying lead: ${lead._id} - ${lead.email}`);
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100)); 
    const _rand = Math.random();
    if (_rand < 0.7) {
      return {
        isValid: true,
        phoneVerification: { isValid: Math.random() > 0.2 }, // 80% phone success
        emailVerification: { isValid: Math.random() > 0.1 }, // 90% email success
        addressVerification: { isValid: Math.random() > 0.3 } // 70% address success
      };
    } else if (_rand < 0.9) { // 20% chance of partial success / failure reason
      return {
        isValid: false,
        reason: 'Could not verify due to incomplete data.',
        phoneVerification: { isValid: false },
        emailVerification: { isValid: true },
        addressVerification: { isValid: false }
      };
    } else { // 10% chance of outright error during verification attempt
      throw new Error('Simulated verification service API error');
    }
  }
};

export const verifyLeads = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authenticatedUser = (req as any).user;
  if (!authenticatedUser || !authenticatedUser.id) {
    throw new ValidationError('User not authenticated.');
  }
  const userId = authenticatedUser.id;
  const leadIdsToVerify: string[] = req.body.leadIds || [];
  let leadsToVerifyQuery: any;

  if (leadIdsToVerify.length > 0) {
    leadsToVerifyQuery = { _id: { $in: leadIdsToVerify }, user: userId };
  } else {
    leadsToVerifyQuery = { status: 'pending', user: userId };
  }

  const leads = await Lead.find(leadsToVerifyQuery);

  if (leads.length === 0) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'No leads found to verify based on criteria.' } });
  }

  const batchSize = 10; // As in original JS
  const verificationResults: Array<{ leadId: string | undefined; status: string | undefined; details?: any; error?: string }> = [];

  for (let i = 0; i < leads.length; i += batchSize) {
    const batch = leads.slice(i, i + batchSize);
    console.log(`Processing verification batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(leads.length / batchSize)}`);

    const batchPromises = batch.map(async (leadInstance) => {
      try {
        const resultData = await mockVerificationService.verifyLead(leadInstance);
        // Ensure the leadInstance has the updateVerification method
        if (typeof (leadInstance as any).updateVerification !== 'function') {
            // If using generic LeadModel without method, attach it or handle differently
            // This should be on the LeadModel prototype.
            console.error(`Lead instance for ID ${leadInstance._id} missing updateVerification method.`);
            // Forcing it onto the mock instance for now if it was somehow lost
            (leadInstance as any).updateVerification = LeadModel.prototype.updateVerification.bind(leadInstance);
        }
        await (leadInstance as any).updateVerification(resultData);
        
        return {
          leadId: leadInstance._id,
          status: leadInstance.verificationStatus,
          details: { // Summarize specific verification outcomes
            phone: resultData.phoneVerification?.isValid,
            email: resultData.emailVerification?.isValid,
            address: resultData.addressVerification?.isValid,
          }
        };
      } catch (error: any) {
        console.error(`Error verifying lead ${leadInstance._id}:`, error.message);
        // Attempt to mark as failed even if service call errors out
        try {
          const errorResult: VerificationResult = { isValid: false, reason: `Verification service error: ${error.message}` };
           if (typeof (leadInstance as any).updateVerification === 'function') {
             await (leadInstance as any).updateVerification(errorResult);
           }
        } catch (updateError: any) {
            console.error(`Error updating lead ${leadInstance._id} after verification error:`, updateError.message);
        }
        return {
          leadId: leadInstance._id,
          status: 'failed', // Fallback status
          error: error.message
        };
      }
    });

    const currentBatchResults = await Promise.all(batchPromises);
    verificationResults.push(...currentBatchResults);

    if (i + batchSize < leads.length) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Delay between batches
    }
  }

  const summary = {
    verified: verificationResults.filter(r => r.status === 'verified').length,
    partially_verified: verificationResults.filter(r => r.status === 'partially_verified').length,
    failed: verificationResults.filter(r => r.status === 'failed' && !r.error).length, // Failed verification, not service error
    error: verificationResults.filter(r => r.error).length, // Errors from the service itself
    total: verificationResults.length
  };

  res.status(200).json({
    success: true,
    message: 'Lead verification process completed.',
    data: { summary, results: verificationResults }
  });
});

// Mock Scoring Service
const mockScoringService = {
  calculateLeadScore: (lead: LeadType, customWeights?: CustomWeights | null): ScoreResult => {
    console.log(`Mock scoring lead: ${lead._id} with weights:`, customWeights);
    let baseScore = 0;
    // Simple mock scoring logic
    if (lead.verificationStatus === 'verified') baseScore += 50;
    else if (lead.verificationStatus === 'partially_verified') baseScore += 25;
    if (lead.email && lead.email !== 'no-email@example.com') baseScore += 10;
    if (lead.phoneNumbers && lead.phoneNumbers.length > 0) baseScore += 10;
    if (lead.address) baseScore += 10;

    // Apply some randomness or more complex mock logic if needed
    const finalScore = Math.min(100, Math.max(0, baseScore + Math.floor(Math.random() * 21) - 10)); // Score 0-100

    let category: 'Hot' | 'Warm' | 'Cold' = 'Cold';
    if (finalScore > 75) category = 'Hot';
    else if (finalScore > 50) category = 'Warm';

    return {
      score: finalScore,
      category: category,
      components: { // Dummy components for the example
          contactQuality: { rawScore: (lead.email ? 1:0) + (lead.phoneNumbers && lead.phoneNumbers.length > 0 ? 1:0), weightedScore: (lead.email ? 5:0) + (lead.phoneNumbers && lead.phoneNumbers.length > 0 ? 5:0) },
          verificationStatus: { rawScore: lead.verificationStatus === 'verified' ? 2 : (lead.verificationStatus === 'partially_verified' ? 1:0) , weightedScore: lead.verificationStatus === 'verified' ? 25 : (lead.verificationStatus === 'partially_verified' ? 12:0) }
      }
    };
  }
};

export const scoreLeads = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const authenticatedUser = (req as any).user;
  if (!authenticatedUser || !authenticatedUser.id) {
    throw new ValidationError('User not authenticated.');
  }
  const userId = authenticatedUser.id;
  const leadIdsToScore: string[] = req.body.leadIds || [];
  const customWeights: CustomWeights | null = req.body.weights || null;
  let leadsToScoreQuery: any;

  if (leadIdsToScore.length > 0) {
    // Score specific leads if IDs are provided
    leadsToScoreQuery = { _id: { $in: leadIdsToScore }, user: userId };
  } else {
    // Score verified or partially_verified leads that have default score (0)
    leadsToScoreQuery = {
      user: userId,
      $or: [
        { verificationStatus: 'verified', score: 0 },
        { verificationStatus: 'partially_verified', score: 0 }
      ]
    };
  }

  const leads = await Lead.find(leadsToScoreQuery);

  if (leads.length === 0) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'No leads found to score based on criteria.' } });
  }

  const batchSize = 50; // As in original JS
  const scoringResults: Array<Partial<ScoreResult> & { leadId: string | undefined; error?: string }> = [];

  for (let i = 0; i < leads.length; i += batchSize) {
    const batch = leads.slice(i, i + batchSize);
    console.log(`Processing scoring batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(leads.length / batchSize)}`);

    for (const leadInstance of batch) {
      try {
        const scoreResultData = mockScoringService.calculateLeadScore(leadInstance, customWeights);
        // Ensure updateScore method exists (should be on prototype)
        if (typeof (leadInstance as any).updateScore !== 'function') {
            console.error(`Lead instance for ID ${leadInstance._id} missing updateScore method.`);
            (leadInstance as any).updateScore = LeadModel.prototype.updateScore.bind(leadInstance);
        }
        await (leadInstance as any).updateScore(scoreResultData);
        
        scoringResults.push({
          leadId: leadInstance._id,
          score: scoreResultData.score,
          category: scoreResultData.category,
          // details from scoreResultData.components if needed
        });
      } catch (error: any) {
        console.error(`Error scoring lead ${leadInstance._id}:`, error.message);
        scoringResults.push({
          leadId: leadInstance._id,
          category: 'Error',
          error: error.message
        });
      }
    }
    // Optional: add a small delay between batches if scoring service is external or heavy
    // if (i + batchSize < leads.length) {
    //   await new Promise(resolve => setTimeout(resolve, 200));
    // }
  }

  const summary = {
    hot: scoringResults.filter(r => r.category === 'Hot').length,
    warm: scoringResults.filter(r => r.category === 'Warm').length,
    cold: scoringResults.filter(r => r.category === 'Cold').length,
    error: scoringResults.filter(r => r.error).length,
    total: scoringResults.length
  };

  res.status(200).json({
    success: true,
    message: 'Lead scoring process completed.',
    data: { summary, results: scoringResults }
  });
});

export default {
  uploadLeads,
  getAllLeads,
  createLead,
  getLeadById,
  updateLead,
  deleteLead,
  verifyLeads,
  scoreLeads,
  // ... other exports when implemented
}; 