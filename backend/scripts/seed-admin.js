/**
 * Script to create initial admin user
 * 
 * Run with: node scripts/seed-admin.js
 * 
 * This script creates a superadmin user if none exists
 */

// Load environment variables - improved to check multiple locations
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Try to find and load .env file from multiple locations
function loadEnvFile() {
  // Possible paths to check for .env file
  const possiblePaths = [
    path.join(process.cwd(), '.env'),              // current working directory
    path.join(process.cwd(), '..', '.env'),        // parent directory
    path.join(__dirname, '..', '.env'),            // backend directory
    path.join(__dirname, '..', '..', '.env')       // project root
  ];

  console.log('Looking for .env file in possible locations...');
  
  // Try each path
  for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
      console.log(`Found .env file at: ${envPath}`);
      dotenv.config({ path: envPath });
      return true;
    }
  }

  // If no .env file is found, try default loading
  console.log('No .env file found in expected locations, trying default loading...');
  dotenv.config();
  
  return false;
}

// Load environment variables
loadEnvFile();

const mongoose = require('mongoose');
const readline = require('readline');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Define MongoDB Atlas URI as fallback
const ATLAS_FALLBACK_URI = 'mongodb+srv://dylanspivack:msRMGT5EGn7lh7Fv@leadverifypro.wjgn36r.mongodb.net/leadverifypro_dev?retryWrites=true&w=majority&appName=LeadVerifyPro';

// Create interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt for input
const prompt = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    
    // Get MongoDB URI from environment variables or use fallback
    const uri = process.env.MONGO_URI || ATLAS_FALLBACK_URI;
    
    if (!process.env.MONGO_URI) {
      console.log('MONGO_URI not found in environment variables.');
      console.log('Using fallback Atlas connection string.');
    } else {
      console.log('Using connection string from environment variables.');
    }
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully!');
    return true;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    return false;
  }
};

// Create superadmin user
const createSuperAdmin = async () => {
  try {
    // Check if a superadmin already exists
    const existingSuperAdmin = await User.findOne({ role: 'superadmin' });
    
    if (existingSuperAdmin) {
      console.log('\nA superadmin user already exists:');
      console.log(`Email: ${existingSuperAdmin.email}`);
      
      const resetPassword = await prompt('\nDo you want to reset the password? (y/n): ');
      
      if (resetPassword.toLowerCase() === 'y') {
        const newPassword = await prompt('Enter new password: ');
        
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        
        // Update the password
        existingSuperAdmin.password = hashedPassword;
        await existingSuperAdmin.save();
        
        console.log('Superadmin password reset successfully');
      }
      
      return;
    }
    
    // Get user input for creating a new superadmin
    console.log('\nNo superadmin account found. Creating a new one...');
    
    const email = await prompt('Enter email: ');
    const password = await prompt('Enter password: ');
    const firstName = await prompt('Enter first name: ');
    const lastName = await prompt('Enter last name: ');
    
    // Create the superadmin user
    const newAdmin = new User({
      email,
      password, // Will be hashed by the pre-save hook
      firstName,
      lastName,
      role: 'superadmin',
      emailVerified: true,
      subscription: {
        plan: 'enterprise',
        status: 'active',
        limits: {
          leadsPerMonth: 999999,
          apiCallsPerDay: 999999,
          batchSize: 9999,
          advancedFeatures: true
        }
      }
    });
    
    await newAdmin.save();
    
    console.log('\nSuperadmin created successfully!');
    console.log(`Email: ${email}`);
    console.log('You can now log in with these credentials');
    
  } catch (error) {
    console.error('Error creating superadmin:', error.message);
  }
};

// Main function
const main = async () => {
  const connected = await connectDB();
  
  if (!connected) {
    console.error('Failed to connect to the database. Exiting...');
    process.exit(1);
  }
  
  await createSuperAdmin();
  
  // Close the database connection and readline interface
  rl.close();
  await mongoose.connection.close();
  console.log('Database connection closed');
  process.exit(0);
};

// Run the script
main(); 