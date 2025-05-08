/**
 * Authentication Middleware
 * 
 * This file loads the compiled TypeScript authentication middleware 
 * from dist/middleware/auth.js.
 */

// Load the compiled TypeScript auth middleware
try {
  const tsAuth = require('../dist/middleware/auth');
  // Attempt to export the correct auth function from the compiled module
  // Common export patterns are checked to ensure compatibility
  module.exports = tsAuth.auth || 
                   tsAuth.authenticate || 
                   (tsAuth.default && tsAuth.default.auth) || 
                   (tsAuth.default && tsAuth.default.authenticate) ||
                   tsAuth.default; // Fallback if default is the function itself
  if (typeof module.exports !== 'function') {
    throw new Error('Auth function not found in compiled TypeScript module.');
  }
  console.log('Using TypeScript compiled auth middleware');
} catch (err) {
  console.error('Error loading compiled TypeScript auth middleware:', err.message);
  console.error('Please ensure the backend is correctly built ("npm run build").');
  // Exit if the compiled auth middleware cannot be loaded.
  process.exit(1);
} 