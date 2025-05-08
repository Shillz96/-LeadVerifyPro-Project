import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';

/**
 * Seed a default admin user if no users exist in the database
 * This ensures there's always at least one user to test authentication
 */
export const seedDefaultUser = async (): Promise<void> => {
  try {
    // Check if we have any users
    const userCount = await User.countDocuments();
    
    if (userCount === 0) {
      console.log('No users found. Creating default admin user...');
      
      // Generate a hashed password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      // Create the default admin user
      const adminUser = new User({
        email: 'admin@example.com',
        password: hashedPassword, // Pre-hashed password
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
      
      // Save without triggering any hooks (direct save)
      await adminUser.save();
      
      console.log('Default admin user created successfully:');
      console.log('Email: admin@example.com');
      console.log('Password: admin123');
    } else {
      console.log(`Database already has ${userCount} users. Skipping user seed.`);
    }
  } catch (error) {
    console.error('Error seeding default user:', error);
  }
};

export default seedDefaultUser; 