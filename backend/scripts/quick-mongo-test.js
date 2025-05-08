/**
 * Quick MongoDB Connection Test
 * A simplified script to test MongoDB connection using the current environment
 */
require('dotenv').config();
const mongoose = require('mongoose');

// Get MongoDB URI from environment
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('ERROR: MongoDB URI is not defined in environment variables.');
  console.error('Please make sure your .env file contains a MONGO_URI variable.');
  process.exit(1);
}

// Hide credentials when printing the connection string
const safeUri = MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
console.log(`Testing connection to MongoDB: ${safeUri}`);

// MongoDB connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4
};

// Connect to MongoDB
mongoose.connect(MONGO_URI, options)
  .then(async () => {
    console.log('\n✅ MongoDB connected successfully!');
    
    try {
      // Get server info
      const serverInfo = await mongoose.connection.db.admin().serverInfo();
      console.log(`- MongoDB version: ${serverInfo.version}`);
    } catch (e) {
      console.log('- Unable to retrieve MongoDB version');
    }
    
    console.log(`- Database name: ${mongoose.connection.db.databaseName}`);
    
    try {
      // List collections
      const collections = await mongoose.connection.db.listCollections().toArray();
      if (collections.length > 0) {
        console.log(`- Collections: ${collections.map(c => c.name).join(', ')}`);
      } else {
        console.log('- No collections found (database may be empty)');
      }
    } catch (e) {
      console.log(`- Unable to list collections: ${e.message}`);
    }
    
    // Close connection
    await mongoose.connection.close();
    console.log('\nConnection closed.');
  })
  .catch(err => {
    console.error('\n❌ MongoDB connection failed:');
    console.error(`- Error: ${err.message}`);
    
    // Provide troubleshooting tips based on error type
    if (err.message.includes('ENOTFOUND')) {
      console.log('\nPossible causes:');
      console.log('- Hostname does not exist or is incorrect');
      console.log('- Network connectivity issues');
    } else if (err.message.includes('Authentication failed')) {
      console.log('\nPossible causes:');
      console.log('- Incorrect username or password');
      console.log('- User does not have access to the database');
    } else if (err.message.includes('timed out')) {
      console.log('\nPossible causes:');
      console.log('- Network connectivity or firewall issues');
      console.log('- MongoDB server is down or unreachable');
    }
    
    process.exit(1);
  }); 