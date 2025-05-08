import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import logger from '../utils/logger';

const execAsync = promisify(exec);
const BACKUP_DIR = path.join(__dirname, '../backups');

async function createBackup() {
  try {
    // Ensure backup directory exists
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.gz`;
    const filepath = path.join(BACKUP_DIR, filename);

    // Create MongoDB dump
    const { MONGODB_URI } = process.env;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    await execAsync(`mongodump --uri="${MONGODB_URI}" --archive="${filepath}" --gzip`);

    // Delete backups older than 7 days
    const files = fs.readdirSync(BACKUP_DIR);
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    files.forEach((file) => {
      const filePath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filePath);
      if (stats.birthtime.getTime() < sevenDaysAgo) {
        fs.unlinkSync(filePath);
        logger.info(`Deleted old backup: ${file}`);
      }
    });

    logger.info(`Backup created successfully: ${filename}`);
  } catch (error) {
    logger.error('Backup failed:', error);
    throw error;
  }
}

// If running directly (not imported as a module)
if (require.main === module) {
  createBackup()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default createBackup; 