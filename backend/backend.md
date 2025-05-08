### BACK-END.MD
```markdown
# Backend Development for LeadVerifyPro

## 1. Overview
The backend is a Node.js server with Express, using MongoDB for data storage, hosted on Heroku's free tier.

## 2. Tech Stack
- **Framework**: Node.js + Express
- **Database**: MongoDB (via MongoDB Atlas free tier)
- **File Handling**: Multer for CSV uploads
- **APIs**: NumVerify for phone validation (free tier available)

## 3. Database Schema
```javascript
const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  name: String,
  address: String,
  phone: String,
  verificationStatus: { type: String, default: 'pending' }, // e.g., pending, verified, failed
  ownershipVerified: { type: Boolean, default: false }, // For future ownership check
  score: { type: Number, default: 0 }, // AI-generated score
  userId: String, // Associate with the user who uploaded the lead
  createdAt: { type: Date, default: Date.now },
});

// Example Usage: const Lead = mongoose.model('Lead', leadSchema);
```

## 4. API Endpoints
- `POST /api/upload`: Upload CSV and save leads to MongoDB. Requires authentication.
- `GET /api/leads`: Retrieve leads associated with the authenticated user.
- `POST /api/verify`: Trigger verification (phone + potentially ownership) for specific leads.
- `POST /api/score`: Trigger AI scoring for verified leads.

## 5. Authentication (MVP Placeholder)
For the MVP, authentication might be simplified (e.g., using a hardcoded user ID or a simple API key in the header). A proper authentication system (like JWT or session-based) should be implemented post-MVP. The `userId` field in the schema links leads to users.

## 6. Step-by-Step Process
1. Initialize project: `npm init -y && npm install express mongoose multer csv-parser dotenv`.
2. Set up MongoDB Atlas and connect via `.env` (using `MONGO_URI`).
3. Create upload endpoint using Multer for file handling and `csv-parser` for parsing.
4. Implement API endpoints for retrieving, verifying, and scoring leads.
5. Integrate NumVerify API for phone validation.
6. Add basic authentication to protect endpoints and associate data with users.
7. Test endpoints thoroughly using Postman or a similar tool.

## 7. Code Snippet: Upload Endpoint Example
```javascript
const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const mongoose = require('mongoose');
// Assume Lead model is defined elsewhere based on the schema
// const Lead = require('./models/Lead'); 
// Assume basic auth middleware sets req.userId
// const { authenticate } = require('./middleware/auth'); 

const app = express(); // Assuming app is initialized elsewhere
const upload = multer({ dest: 'uploads/' }); // Temporary storage for uploads

// Connect to MongoDB (ensure this is done once, typically in server.js)
// mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Example Upload Route - Apply authentication middleware first
app.post('/api/upload', /* authenticate, */ upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  
  // For MVP, using a placeholder userId if auth isn't fully implemented
  const userId = req.userId || 'default-user-id'; 

  const leadsToInsert = [];
  fs.createReadStream(req.file.path)
    .pipe(csv()) // Add error handling for CSV parsing
    .on('data', (row) => {
      // Basic validation/mapping - adapt based on expected CSV columns
      const leadData = { 
        name: row.Name || row.name, 
        address: row.Address || row.address,
        phone: row.Phone || row.phone,
        userId: userId, // Associate with user
        // Initialize other fields as needed
        verificationStatus: 'pending',
        score: 0
      };
      leadsToInsert.push(leadData);
    })
    .on('end', async () => {
      try {
        if (leadsToInsert.length > 0) {
          // Use the actual Lead model to insert
          // await Lead.insertMany(leadsToInsert); 
          console.log(`Inserting ${leadsToInsert.length} leads for user ${userId}`);
          // Placeholder response until DB is connected
          res.json({ 
            message: 'Leads parsed successfully (DB insert pending)', 
            count: leadsToInsert.length 
          }); 
        } else {
           res.status(400).json({ message: 'CSV file was empty or could not be parsed.' });
        }
      } catch (error) {
        console.error('Error inserting leads:', error);
        res.status(500).json({ message: 'Error saving leads to database.' });
      } finally {
         // Clean up the uploaded file
         fs.unlink(req.file.path, (err) => {
           if (err) console.error('Error deleting uploaded file:', err);
         });
      }
    })
    .on('error', (error) => {
       console.error('Error processing CSV file:', error);
       fs.unlink(req.file.path, (err) => { // Clean up on error too
          if (err) console.error('Error deleting uploaded file after CSV error:', err);
       });
       res.status(500).json({ message: 'Error processing CSV file.' });
    });
});

// Assume app listens elsewhere
// app.listen(3000, () => console.log('Server running on port 3000'));
```

## 8. AI Prompts for Cursor AI
- "Create a Node.js Express endpoint to handle CSV uploads using Multer and save data to MongoDB."
- "Write a function to verify phone numbers using the NumVerify API and update MongoDB records."
- "Generate a MongoDB schema for a lead management system with user association."
```
---