import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

// Convert fs functions to promise-based
const mkdir = promisify(fs.mkdir);
const access = promisify(fs.access);
const unlink = promisify(fs.unlink);

/**
 * Creates the uploads directory if it doesn't exist
 */
export const createUploadsDirectory = async (): Promise<void> => {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  
  try {
    await access(uploadsDir);
  } catch (error) {
    try {
      await mkdir(uploadsDir, { recursive: true });
      console.log('Uploads directory created successfully');
    } catch (error) {
      console.error('Error creating uploads directory:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
};

/**
 * Deletes a file from the uploads directory
 */
export const deleteFile = async (filename: string): Promise<void> => {
  const filepath = path.join(process.cwd(), 'uploads', filename);
  
  try {
    await unlink(filepath);
    console.log(`File ${filename} deleted successfully`);
  } catch (error) {
    console.error(`Error deleting file ${filename}:`, error instanceof Error ? error.message : String(error));
    throw error;
  }
};

/**
 * Validates file type based on allowed extensions
 */
export const validateFileType = (filename: string, allowedExtensions: string[]): boolean => {
  const ext = path.extname(filename).toLowerCase();
  return allowedExtensions.includes(ext);
};

/**
 * Gets the absolute path for a file in the uploads directory
 */
export const getUploadPath = (filename: string): string => {
  return path.join(process.cwd(), 'uploads', filename);
}; 