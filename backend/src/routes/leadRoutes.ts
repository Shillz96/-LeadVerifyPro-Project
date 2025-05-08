import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import leadController from '../controllers/leadController'; // Import default export
// Assuming authenticate middleware will be from authController or a shared middleware file
// For now, let's assume it's part of authController and exported
import authController from '../controllers/authController';

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads'); // Relative to dist/routes
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads (from original leadRoutes.js)
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
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
    cb(new Error('Only CSV and Excel files are allowed. Received: ' + file.mimetype + ' or ext: ' + ext), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit, as in original JS
  }
});

// Use authenticate middleware (imported from authController for now)
// Note: If authController.authenticate is not what you use, replace it.
const authenticate = authController.authenticate; 

// POST /api/leads/upload - Handles uploading, parsing, and saving leads.
router.post('/upload', authenticate, upload.single('file'), leadController.uploadLeads);

// GET /api/leads - Get all leads for the authenticated user
router.get('/', authenticate, leadController.getAllLeads);

// POST /api/leads - Create a new lead manually
router.post('/', authenticate, leadController.createLead);

// GET /api/leads/:id
router.get('/:id', authenticate, leadController.getLeadById);

// PUT /api/leads/:id - Update an existing lead
router.put('/:id', authenticate, leadController.updateLead);

// DELETE /api/leads/:id - Delete a lead
router.delete('/:id', authenticate, leadController.deleteLead);

// POST /api/leads/verify - Verifies leads
router.post('/verify', authenticate, leadController.verifyLeads);

// POST /api/leads/score - Scores leads
router.post('/score', authenticate, leadController.scoreLeads);

// TODO: Implement verification and scoring routes
// router.post('/score', authenticate, leadController.scoreLeads);

export default router; 