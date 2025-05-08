/**
 * Environment Configuration
 * Centralizes all environment variables with defaults
 */
require('dotenv').config();

// Import computer vision configuration
const computerVision = require('./computer-vision');

// Environment configuration with defaults
const config = {
  // Server Configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database Configuration
  MONGO_URI: process.env.MONGO_URI,
  
  // JWT Authentication
  JWT_SECRET: process.env.JWT_SECRET || 'dev-jwt-secret-please-change-in-production',
  
  // API Keys
  API_KEY: process.env.API_KEY || 'dev-api-key-for-testing',
  
  // External Services
  FIRECRAWL_API_KEY: process.env.FIRECRAWL_API_KEY,
  
  // Email Service
  EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'smtp',
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT || 587,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@leadverifypro.com',
  
  // Payment Processing
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  
  // Security Settings
  PASSWORD_RESET_EXPIRY: 3600000, // 1 hour in milliseconds
  ACCOUNT_LOCKOUT_ATTEMPTS: 5,
  
  // Feature Flags
  ENABLE_TEAM_FEATURES: process.env.ENABLE_TEAM_FEATURES === 'true',
  ENABLE_API_ACCESS: process.env.ENABLE_API_ACCESS === 'true',
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // Computer Vision Configuration
  computerVision
};

// Log warning if using default JWT secret in production
if (config.NODE_ENV === 'production' && config.JWT_SECRET === 'dev-jwt-secret-please-change-in-production') {
  console.warn('WARNING: Using default JWT_SECRET in production environment!');
  console.warn('Set a secure JWT_SECRET in your environment variables.');
}

// Validate essential configuration
if (!config.MONGO_URI) {
  console.error('ERROR: MongoDB URI is not configured!');
  console.error('Please set the MONGO_URI environment variable.');
  process.exit(1);
}

module.exports = config; 