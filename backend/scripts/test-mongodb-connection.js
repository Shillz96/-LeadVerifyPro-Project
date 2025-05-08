/**
 * MongoDB Connection Test Script
 * Run this script to test the MongoDB connection for both development and production environments
 */
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ask user which environment to test
console.log('\n=== MongoDB Connection Test ===\n');
console.log('This script will test the MongoDB connection for your environment.');
console.log('Which environment would you like to test?\n');
console.log('1. Development');
console.log('2. Production');
console.log('3. Custom URI\n');

rl.question('Enter your choice (1-3): ', async (choice) => {
  let uri;
  
  // Load connection string based on user choice
  if (choice === '1' || choice === '2') {
    // Get environment file based on choice
    const env = choice === '1' ? 'development' : 'production';
    const envFile = path.join(__dirname, '..', `.env.${env}`);
    
    if (!fs.existsSync(envFile)) {
      console.error(`Error: Environment file for ${env} not found.`);
      rl.close();
      return;
    }
    
    // Read the .env file content
    const envContent = fs.readFileSync(envFile, 'utf8');
    
    // Extract MONGO_URI from env file - improved regex to handle complex URIs
    const match = envContent.match(/MONGO_URI=(.+)(\r?\n|$)/);
    if (!match) {
      console.error(`Error: MONGO_URI not found in ${env} environment file.`);
      console.log(`File content: ${envContent}`);
      rl.close();
      return;
    }
    
    uri = match[1].trim();
    console.log(`\nUsing MongoDB URI from ${env} environment.`);
  } else if (choice === '3') {
    // Get custom URI from user
    rl.question('\nEnter your MongoDB URI: ', (customUri) => {
      uri = customUri.trim();
      testConnection(uri);
    });
    return;
  } else {
    console.error('Invalid choice. Please run the script again and select 1, 2, or 3.');
    rl.close();
    return;
  }
  
  // Test connection if URI was loaded from env file
  if (uri) {
    testConnection(uri);
  }
});

// Function to test MongoDB connection
async function testConnection(uri) {
  console.log('\nAttempting to connect to MongoDB...');
  console.log(`URI: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`); // Show URI but hide credentials
  
  try {
    // MongoDB connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4
    };
    
    // Try to connect
    await mongoose.connect(uri, options);
    
    console.log('\n✅ Connection successful!');
    console.log('Database details:');
    
    // Safely extract host info without exposing credentials
    const hostInfo = uri.split('@')[1]?.split('/')[0] || 'unknown';
    console.log(`- Host: ${hostInfo}`);
    
    // Get database information if available
    if (mongoose.connection.db) {
      try {
        const serverInfo = await mongoose.connection.db.admin().serverInfo();
        console.log(`- MongoDB version: ${serverInfo.version}`);
      } catch (e) {
        console.log(`- MongoDB version: Unable to retrieve`);
      }
      
      console.log(`- Database name: ${mongoose.connection.db.databaseName}`);
      
      // List collections
      try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log(`- Collections: ${collections.length > 0 ? collections.map(c => c.name).join(', ') : 'No collections found'}`);
      } catch (e) {
        console.log(`- Collections: Unable to list collections (${e.message})`);
      }
    }
    
    // Close connection and readline
    await mongoose.connection.close();
    console.log('\nConnection closed.');
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error(`Error details: ${error.message}`);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\nTroubleshooting suggestions:');
      console.log('- Check if the hostname is correct');
      console.log('- Verify your network connection');
    } else if (error.message.includes('Authentication failed')) {
      console.log('\nTroubleshooting suggestions:');
      console.log('- Verify your username and password');
      console.log('- Ensure the user has access to the specified database');
    } else if (error.message.includes('timed out')) {
      console.log('\nTroubleshooting suggestions:');
      console.log('- Check network connectivity and firewall settings');
      console.log('- Database server might be down or under heavy load');
    }
    
    console.log('\nFull error:');
    console.log(error);
  } finally {
    // Ensure readline is closed
    rl.close();
  }
} 