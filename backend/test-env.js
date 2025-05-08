/**
 * Test script to check if .env file is being loaded correctly
 */

console.log('Current working directory:', process.cwd());
console.log('Loading .env file...');

// Load dotenv
const dotenv = require('dotenv');
const result = dotenv.config();

if (result.error) {
  console.error('Error loading .env file:', result.error.message);
} else {
  console.log('.env file loaded successfully');
}

// Print the MongoDB URI
console.log('\nMONGO_URI from process.env:');
console.log(process.env.MONGO_URI || 'Not defined');

// Check other important environment variables
console.log('\nOther environment variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '[Defined]' : 'Not defined'); 