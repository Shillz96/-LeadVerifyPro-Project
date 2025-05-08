/**
 * File Splitter Utility
 * 
 * Utility for handling large CSV files by splitting them into manageable chunks
 * Useful for processing large datasets in memory-efficient way
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

/**
 * Split a large CSV file into smaller chunks
 * @param {string} filePath - Path to the CSV file
 * @param {number} chunkSize - Number of records per chunk
 * @param {string} outputDir - Directory to save chunks
 * @returns {Promise<string[]>} - Array of paths to the chunk files
 */
const splitCsvFile = async (filePath, chunkSize = 1000, outputDir = null) => {
  if (!outputDir) {
    outputDir = path.join(path.dirname(filePath), 'chunks');
  }
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  return new Promise((resolve, reject) => {
    const results = [];
    const chunkPaths = [];
    let chunkIndex = 0;
    let recordCount = 0;
    let headers = null;
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('headers', (headerList) => {
        headers = headerList;
      })
      .on('data', (data) => {
        results.push(data);
        recordCount++;
        
        // When we reach chunk size, write to file
        if (recordCount >= chunkSize) {
          const chunkPath = path.join(outputDir, `chunk_${chunkIndex}.csv`);
          writeChunkToFile(chunkPath, results, headers);
          chunkPaths.push(chunkPath);
          
          // Reset for next chunk
          results.length = 0;
          recordCount = 0;
          chunkIndex++;
        }
      })
      .on('end', async () => {
        // Write any remaining records
        if (results.length > 0) {
          const chunkPath = path.join(outputDir, `chunk_${chunkIndex}.csv`);
          await writeChunkToFile(chunkPath, results, headers);
          chunkPaths.push(chunkPath);
        }
        
        resolve(chunkPaths);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

/**
 * Write a chunk of data to a CSV file
 * @param {string} filePath - Path to save the chunk
 * @param {Array} data - Array of records
 * @param {Array} headers - CSV headers
 * @returns {Promise<void>}
 */
const writeChunkToFile = async (filePath, data, headers) => {
  // Create header config for csv-writer
  const headerConfig = headers.map(header => ({
    id: header,
    title: header
  }));
  
  const csvWriter = createCsvWriter({
    path: filePath,
    header: headerConfig
  });
  
  await csvWriter.writeRecords(data);
};

/**
 * Merge multiple CSV files into one
 * @param {string[]} filePaths - Array of paths to CSV files
 * @param {string} outputPath - Path for the merged file
 * @returns {Promise<string>} - Path to the merged file
 */
const mergeCsvFiles = async (filePaths, outputPath) => {
  let allData = [];
  let headers = null;
  
  // Read all files
  for (const filePath of filePaths) {
    const fileData = await readCsvFile(filePath);
    
    if (fileData.length > 0) {
      // Get headers from first file
      if (!headers) {
        headers = Object.keys(fileData[0]);
      }
      
      allData = allData.concat(fileData);
    }
  }
  
  // Write merged data to output file
  if (allData.length > 0 && headers) {
    const headerConfig = headers.map(header => ({
      id: header,
      title: header
    }));
    
    const csvWriter = createCsvWriter({
      path: outputPath,
      header: headerConfig
    });
    
    await csvWriter.writeRecords(allData);
  }
  
  return outputPath;
};

/**
 * Read a CSV file into an array of objects
 * @param {string} filePath - Path to CSV file
 * @returns {Promise<Array>} - Array of objects
 */
const readCsvFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
};

module.exports = {
  splitCsvFile,
  mergeCsvFiles,
  readCsvFile
}; 