import dotenv from 'dotenv';
// import path from 'path'; // No longer needed for complex path joining
// import fs from 'fs'; // No longer needed for fs.existsSync

// Load environment variables
// For local development, dotenv will look for .env in process.cwd().
// Ensure you run your dev server from the project root or backend root where .env is.
// In production (e.g., Render), environment variables are typically injected directly.
// Calling dotenv.config() here won't override existing process.env variables set by Render.
dotenv.config();

if (process.env.NODE_ENV !== 'production') {
  console.log('Development environment: Loaded .env file if present.');
} else {
  console.log('Production environment: Relying on system-set environment variables.');
}

// Log debug info for verification
console.log(`Current NODE_ENV:    ${process.env.NODE_ENV || 'not set (defaults to development)'}`);
console.log(`MONGO_URI defined:   ${process.env.MONGO_URI ? 'Yes' : 'No'}`);
console.log(`JWT_SECRET defined:  ${process.env.JWT_SECRET ? 'Yes' : 'No'}`);

interface Config {
  PORT: number;
  MONGO_URI: string;
  NODE_ENV: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
}

// Define MongoDB Atlas URI as fallback for non-production environments
const ATLAS_FALLBACK_URI = 'mongodb+srv://dylanspivack:msRMGT5EGn7lh7Fv@leadverifypro.wjgn36r.mongodb.net/leadverifypro_dev?retryWrites=true&w=majority&appName=LeadVerifyPro';
const DEFAULT_JWT_SECRET = 'your-super-secret-jwt-key-change-in-production';

let mongoUriToUse: string;
let jwtSecretToUse: string;
const nodeEnv = process.env.NODE_ENV || 'development';

if (nodeEnv === 'production') {
  if (!process.env.MONGO_URI) {
    console.error('CRITICAL ERROR: MONGO_URI is not defined in production environment.');
    process.exit(1);
  }
  mongoUriToUse = process.env.MONGO_URI;

  if (!process.env.JWT_SECRET) {
    console.error('CRITICAL ERROR: JWT_SECRET is not defined in production environment.');
    process.exit(1);
  }
  if (process.env.JWT_SECRET === DEFAULT_JWT_SECRET) {
    console.error('CRITICAL ERROR: Default JWT_SECRET is being used in production. Please set a secure secret.');
    process.exit(1);
  }
  jwtSecretToUse = process.env.JWT_SECRET;
} else {
  // Non-production environments (development, test, etc.)
  if (!process.env.MONGO_URI) {
    console.warn('WARNING: MONGO_URI is not defined in environment variables.');
    console.warn(`Using fallback Atlas connection string: ${ATLAS_FALLBACK_URI.substring(0, ATLAS_FALLBACK_URI.indexOf('@') + 1)}...`); // Log only part of URI for brevity
    mongoUriToUse = ATLAS_FALLBACK_URI;
  } else {
    mongoUriToUse = process.env.MONGO_URI;
  }

  if (!process.env.JWT_SECRET) {
    console.warn('WARNING: JWT_SECRET is not defined. Using default development JWT_SECRET.');
    jwtSecretToUse = DEFAULT_JWT_SECRET;
  } else if (process.env.JWT_SECRET === DEFAULT_JWT_SECRET) {
    console.warn('WARNING: Using default development JWT_SECRET. This is fine for development but not for production.');
    jwtSecretToUse = process.env.JWT_SECRET;
  }
  else {
    jwtSecretToUse = process.env.JWT_SECRET;
  }
}

export const config: Config = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGO_URI: mongoUriToUse,
  NODE_ENV: nodeEnv,
  JWT_SECRET: jwtSecretToUse,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d'
};

// Final check after config object creation
if (config.NODE_ENV === 'production') {
    if (!config.MONGO_URI || config.MONGO_URI === ATLAS_FALLBACK_URI) {
        console.error('CRITICAL ERROR: Production environment is incorrectly configured to use a fallback or undefined MONGO_URI.');
        process.exit(1);
    }
    if (!config.JWT_SECRET || config.JWT_SECRET === DEFAULT_JWT_SECRET) {
        console.error('CRITICAL ERROR: Production environment is incorrectly configured to use a default or undefined JWT_SECRET.');
        process.exit(1);
    }
    console.log('Production configuration loaded successfully and validated.');
} else {
    console.log(`Development/Test configuration loaded. MONGO_URI: ${config.MONGO_URI.startsWith('mongodb+srv://dylanspivack') ? 'Fallback' : 'Custom'}, JWT_SECRET: ${config.JWT_SECRET === DEFAULT_JWT_SECRET ? 'Default' : 'Custom'}`);
} 