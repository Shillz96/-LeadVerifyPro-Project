/**
 * Script to create MongoDB indexes for frequently queried fields
 * Improves query performance for the LeadVerifyPro application
 * 
 * Run with: node scripts/create-indexes.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { logger } = require('../utils/logger');

// Import models
const User = require('../models/User');
const Lead = require('../models/Lead');
const Subscription = require('../models/Subscription');
const PropertyAnalysis = require('../models/PropertyAnalysis');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB database');
    createIndexes();
  })
  .catch(err => {
    logger.error('MongoDB connection error', err);
    process.exit(1);
  });

async function createIndexes() {
  try {
    logger.info('Starting index creation...');
    
    // User indexes
    logger.info('Creating User indexes...');
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ createdAt: -1 });
    await User.collection.createIndex({ role: 1 });
    
    // Lead indexes
    logger.info('Creating Lead indexes...');
    await Lead.collection.createIndex({ userId: 1, createdAt: -1 }); // For getting user's leads
    await Lead.collection.createIndex({ status: 1 }); // For filtering by status
    await Lead.collection.createIndex({ address: 1, city: 1, state: 1, zipCode: 1 }, { unique: true }); // For preventing duplicates
    // Text index for searching
    await Lead.collection.createIndex(
      { address: 'text', city: 'text', state: 'text', zipCode: 'text', ownerName: 'text' }, 
      { weights: { address: 10, ownerName: 5, city: 3 }, name: 'lead_text_search' }
    );
    // Geospatial index if coords are used
    await Lead.collection.createIndex({ location: '2dsphere' });
    
    // Subscription indexes
    logger.info('Creating Subscription indexes...');
    await Subscription.collection.createIndex({ userId: 1 });
    await Subscription.collection.createIndex({ status: 1 });
    await Subscription.collection.createIndex({ expiresAt: 1 });
    
    // PropertyAnalysis indexes
    logger.info('Creating PropertyAnalysis indexes...');
    await PropertyAnalysis.collection.createIndex({ leadId: 1 });
    await PropertyAnalysis.collection.createIndex({ createdAt: -1 });
    
    logger.info('All indexes created successfully');
    
    // Print all created indexes for verification
    const userIndexes = await User.collection.indexes();
    const leadIndexes = await Lead.collection.indexes();
    const subscriptionIndexes = await Subscription.collection.indexes();
    const propertyAnalysisIndexes = await PropertyAnalysis.collection.indexes();
    
    logger.info('User indexes:', userIndexes);
    logger.info('Lead indexes:', leadIndexes);
    logger.info('Subscription indexes:', subscriptionIndexes);
    logger.info('PropertyAnalysis indexes:', propertyAnalysisIndexes);
    
    mongoose.disconnect();
    logger.info('MongoDB disconnected');
  } catch (error) {
    logger.error('Error creating indexes:', error);
    mongoose.disconnect();
    process.exit(1);
  }
}

// Handle termination signals
process.on('SIGINT', () => {
  mongoose.disconnect();
  logger.info('MongoDB disconnected on app termination');
  process.exit(0);
});

process.on('SIGTERM', () => {
  mongoose.disconnect();
  logger.info('MongoDB disconnected on app termination');
  process.exit(0);
}); 