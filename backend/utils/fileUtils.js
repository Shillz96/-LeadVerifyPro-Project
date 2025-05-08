/**
 * Utility functions for file operations
 */
const fs = require('fs');
const path = require('path');

/**
 * Creates the uploads directory if it doesn't exist
 */
const createUploadsDirectory = () => {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  
  if (!fs.existsSync(uploadsDir)) {
    try {
      fs.mkdirSync(uploadsDir);
      console.log('Created uploads directory successfully');
    } catch (err) {
      console.error('Failed to create uploads directory:', err);
      throw new Error('Failed to create uploads directory. Check permissions.');
    }
  }
};

/**
 * Deletes a file from the uploads directory
 * @param {string} filename - Name of the file to delete
 */
const deleteFile = (filename) => {
  const filePath = path.join(__dirname, '..', 'uploads', filename);
  
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      return true;
    } catch (err) {
      console.error(`Error deleting file ${filename}:`, err);
      return false;
    }
  } else {
    return false; // File doesn't exist
  }
};

module.exports = {
  createUploadsDirectory,
  deleteFile
}; 