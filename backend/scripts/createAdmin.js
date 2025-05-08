/**
 * Create Admin User Script
 * This script creates an admin user in the database for initial setup
 * 
 * Run with: node scripts/createAdmin.js
 */

// Load environment variables
require('dotenv').config();

// Import required modules
const mongoose = require('mongoose');
const config = require('../config/env');
const User = require('../models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log('Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Admin user data
const adminData = {
  email: 'admin@leadverifypro.com',
  password: 'AdminPassword123!',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin',
  emailVerified: true,
  subscription: {
    plan: 'enterprise',
    status: 'active',
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
  }
};

// Create admin user
const createAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      return existingAdmin;
    }
    
    // Create new admin user
    const admin = new User(adminData);
    await admin.save();
    
    console.log('Admin user created successfully:');
    console.log(`Email: ${adminData.email}`);
    console.log(`Password: ${adminData.password}`);
    
    return admin;
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    process.exit(1);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await createAdmin();
  
  // Disconnect from MongoDB
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
  
  console.log('Admin user creation script completed');
};

// Run the script
main(); 