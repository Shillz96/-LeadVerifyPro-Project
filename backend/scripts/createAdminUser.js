/**
 * Script to create an admin user directly in MongoDB
 * Run with: node scripts/createAdminUser.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Get MongoDB connection string from environment
const MONGO_URI = process.env.MONGO_URI || '';

if (!MONGO_URI) {
  console.error('ERROR: No MONGO_URI found in environment variables');
  process.exit(1);
}

console.log('Connecting to MongoDB...');

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected successfully.');
    
    // Define a simple user schema for this script only
    const userSchema = new mongoose.Schema({
      email: String,
      password: String,
      firstName: String,
      lastName: String,
      role: String,
      emailVerified: Boolean,
      subscription: {
        plan: String,
        status: String,
        startDate: Date,
        endDate: Date,
        limits: {
          leadsPerMonth: Number,
          apiCallsPerDay: Number,
          batchSize: Number,
          advancedFeatures: Boolean
        }
      }
    });
    
    // Create a model
    const User = mongoose.model('User', userSchema);
    
    // Check if admin user already exists
    const existingUser = await User.findOne({ email: 'admin@example.com' });
    
    if (existingUser) {
      console.log('Admin user already exists.');
      
      // Update the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      existingUser.password = hashedPassword;
      await existingUser.save();
      
      console.log('Admin password updated successfully.');
    } else {
      console.log('Creating new admin user...');
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      // Create the admin user
      const adminUser = new User({
        email: 'admin@example.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        emailVerified: true,
        subscription: {
          plan: 'premium',
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          limits: {
            leadsPerMonth: 5000,
            apiCallsPerDay: 2000,
            batchSize: 200,
            advancedFeatures: true
          }
        }
      });
      
      await adminUser.save();
      console.log('Admin user created successfully.');
    }
    
    console.log('Admin user credentials:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
    // Disconnect from DB
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
    
    process.exit(0);
  })
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  }); 