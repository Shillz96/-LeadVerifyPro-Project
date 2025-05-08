/**
 * Database migration script for LeadVerifyPro
 * 
 * This script manages database migrations to keep the schema up-to-date
 * and transform existing data when schema changes occur.
 * 
 * Usage: node scripts/migrate-data.js [--dry-run]
 */

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { logger } = require('../utils/logger');

// Check if this is a dry run
const isDryRun = process.argv.includes('--dry-run');
if (isDryRun) {
  logger.info('Running in DRY RUN mode - no changes will be made to the database');
}

// Path to migrations directory
const migrationsDir = path.join(__dirname, '../migrations');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB database');
    runMigrations();
  })
  .catch(err => {
    logger.error('MongoDB connection error', err);
    process.exit(1);
  });

/**
 * Migration record model to track completed migrations
 */
const MigrationModel = mongoose.model('Migration', new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  appliedAt: { type: Date, required: true, default: Date.now },
  version: { type: Number, required: true }
}));

/**
 * Run all pending migrations in order
 */
async function runMigrations() {
  try {
    // Ensure migrations directory exists
    if (!fs.existsSync(migrationsDir)) {
      fs.mkdirSync(migrationsDir, { recursive: true });
      logger.info('Created migrations directory');
    }

    // Get already applied migrations
    const appliedMigrations = await MigrationModel.find().sort({ version: 1 });
    const appliedNames = appliedMigrations.map(m => m.name);
    
    logger.info(`Found ${appliedMigrations.length} previously applied migrations`);

    // Get available migration files
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js'))
      .sort(); // Lexicographical order for versions

    logger.info(`Found ${migrationFiles.length} migration files`);

    // Determine pending migrations
    const pendingMigrations = migrationFiles.filter(file => !appliedNames.includes(file));
    
    logger.info(`${pendingMigrations.length} migrations pending application`);

    if (pendingMigrations.length === 0) {
      logger.info('No pending migrations. Database is up to date.');
      mongoose.disconnect();
      return;
    }

    // Apply pending migrations in order
    for (const migrationFile of pendingMigrations) {
      const migration = require(path.join(migrationsDir, migrationFile));
      const version = parseInt(migrationFile.split('-')[0], 10);
      
      if (!migration.up || typeof migration.up !== 'function') {
        logger.error(`Migration ${migrationFile} is missing an 'up' function`);
        continue;
      }

      logger.info(`Applying migration: ${migrationFile} (version ${version})`);
      
      try {
        // Execute the migration unless this is a dry run
        if (!isDryRun) {
          await migration.up(mongoose);
          
          // Record the migration
          await MigrationModel.create({
            name: migrationFile,
            version,
            appliedAt: new Date()
          });
        } else {
          logger.info(`[DRY RUN] Would apply migration: ${migrationFile}`);
        }
        
        logger.info(`Successfully ${isDryRun ? 'simulated' : 'applied'} migration: ${migrationFile}`);
      } catch (error) {
        logger.error(`Failed to apply migration ${migrationFile}:`, error);
        logger.error('Migration process aborted. Fix the issues and try again.');
        
        if (migration.down && typeof migration.down === 'function' && !isDryRun) {
          try {
            logger.info(`Attempting to roll back migration: ${migrationFile}`);
            await migration.down(mongoose);
            logger.info(`Successfully rolled back migration: ${migrationFile}`);
          } catch (rollbackError) {
            logger.error(`Failed to roll back migration ${migrationFile}:`, rollbackError);
            logger.error('Manual intervention required to fix the database state.');
          }
        }
        
        mongoose.disconnect();
        process.exit(1);
      }
    }

    logger.info(`Successfully ${isDryRun ? 'simulated' : 'applied'} ${pendingMigrations.length} migrations`);
    mongoose.disconnect();
  } catch (error) {
    logger.error('Error running migrations:', error);
    mongoose.disconnect();
    process.exit(1);
  }
}

// Create a new migration file template
function createMigrationTemplate(name) {
  const timestamp = Date.now();
  const version = Math.floor(timestamp / 1000); // Unix timestamp in seconds
  const fileName = `${version}-${name}.js`;
  const filePath = path.join(migrationsDir, fileName);
  
  const template = `/**
 * Migration: ${name}
 * Version: ${version}
 * Created: ${new Date().toISOString()}
 */

module.exports = {
  /**
   * Apply the migration
   * @param {Object} mongoose - Mongoose instance
   */
  async up(mongoose) {
    // TODO: Implement the migration logic here
    // Example:
    // const db = mongoose.connection.db;
    // await db.collection('users').updateMany({}, { $set: { newField: 'default' } });
  },

  /**
   * Rollback the migration
   * @param {Object} mongoose - Mongoose instance
   */
  async down(mongoose) {
    // TODO: Implement the rollback logic here
    // Example:
    // const db = mongoose.connection.db;
    // await db.collection('users').updateMany({}, { $unset: { newField: '' } });
  }
};
`;

  fs.writeFileSync(filePath, template);
  logger.info(`Created new migration template: ${fileName}`);
  return filePath;
}

// Handle command to generate a new migration
if (process.argv.includes('--create')) {
  const nameIndex = process.argv.indexOf('--create') + 1;
  if (nameIndex < process.argv.length) {
    const name = process.argv[nameIndex].replace(/[^a-z0-9-_]/gi, '-').toLowerCase();
    createMigrationTemplate(name);
    process.exit(0);
  } else {
    logger.error('Migration name is required. Usage: node scripts/migrate-data.js --create migration-name');
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