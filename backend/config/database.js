/**
 * Database configuration module
 * Centralizes MongoDB connection logic
 */
const mongoose = require('mongoose');
// const { config } = require('./env'); // We'll get NODE_ENV directly too
const logger = require('../utils/logger').default;

// MongoDB connection URI directly from environment variables
const MONGO_URI = process.env.MONGO_URI;
const NODE_ENV = process.env.NODE_ENV || 'development'; // Get NODE_ENV directly

// Database connection options - updated for MongoDB Atlas best practices
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 15000, // Increased timeout for robust Atlas connections
  maxPoolSize: NODE_ENV === 'production' ? 15 : 5, // Adjusted pool size for prod/dev // Use directly sourced NODE_ENV
  socketTimeoutMS: 60000, // Close sockets after 60 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6
};

// Maximum connection attempts
const MAX_RETRIES = 5; // Increased retries
const RETRY_DELAY_MS = 5000; // Delay between retries

// State to track connection status
let isConnected = false;
let isOfflineMode = false; // This state might be re-evaluated for production APIs

/**
 * Connect to MongoDB with retry logic
 */
const connectWithRetry = async (retryCount = 0) => {
  try {
    if (retryCount === 0) {
      // Mask credentials in log output if URI contains them
      const safeMongoUri = MONGO_URI.includes('@') ? MONGO_URI.substring(0, MONGO_URI.indexOf('//') + 2) + '****:****@' + MONGO_URI.substring(MONGO_URI.indexOf('@') + 1) : MONGO_URI;
      logger.info(`Attempting to connect to MongoDB: ${safeMongoUri.split('@')[1]?.split('/')[0] || 'configured URI'}... (Attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);
    }
    
    await mongoose.connect(MONGO_URI, options);
    logger.info('MongoDB connected successfully');
    isConnected = true;
    isOfflineMode = false;
    return true;
  } catch (err) {
    logger.warn(`MongoDB connection attempt ${retryCount + 1} failed: ${err.message}`);
    if (retryCount < MAX_RETRIES) {
      logger.info(`Retrying in ${RETRY_DELAY_MS / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      return connectWithRetry(retryCount + 1);
    } else {
      logger.error(`Failed to connect to MongoDB after ${MAX_RETRIES + 1} attempts.`);
      if (NODE_ENV === 'production') {
        logger.error('CRITICAL: MongoDB connection failed in PRODUCTION. The application might not function correctly.');
        // For a production API, you might want to throw an error here or exit to ensure it doesn't run in a broken state.
        // For now, it will proceed to offline mode as per original logic, but this needs review.
      }
      logger.info('Switching to offline mode. Some features may be limited or unavailable.');
      isOfflineMode = true;
      isConnected = false; // Explicitly set isConnected to false
      return false;
    }
  }
};

// Event listeners for MongoDB connection
mongoose.connection.on('error', err => {
  logger.error(`MongoDB connection error: ${err.message}`);
  isConnected = false;
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected. Attempting to reconnect if appropriate...');
  isConnected = false;
  // If not intentionally disconnecting, you might want to trigger connectWithRetry here
  // or rely on the driver's auto-reconnect if configured (though explicit retries are often better).
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected successfully');
  isConnected = true;
  isOfflineMode = false;
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  logger.info(`Received ${signal}. Closing MongoDB connection...`);
  await mongoose.connection.close();
  logger.info('MongoDB connection closed due to app termination.');
  process.exit(0);
};

// Handle termination signals
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Get database connection status
const isDatabaseConnected = () => isConnected;

// Check if offline mode is active
const isInOfflineMode = () => isOfflineMode;

module.exports = {
  connectWithRetry,
  mongoose, // Export mongoose instance itself
  isDatabaseConnected,
  isInOfflineMode
}; 