/**
 * LeadVerifyPro API Server
 * 
 * This file loads the compiled TypeScript server from dist/server.js.
 * Ensure you have built the TypeScript source using "npm run build"
 * before running this file.
 */

// This will load the compiled TypeScript server from the dist directory
try {
  console.log('Loading compiled TypeScript server from dist/server.js');
  
  // Attempt to load the compiled TypeScript server
  require('./dist/server');
} catch (err) {
  console.error('Error loading compiled TypeScript server:', err.message);
  console.error('Please ensure you have built the TypeScript source with "npm run build".');
  // Exit if the compiled server cannot be loaded, as there's no fallback.
  process.exit(1);
} 