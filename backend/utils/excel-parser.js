const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

/**
 * Excel Parser Utility
 * 
 * This utility provides functions to parse Excel files into usable JS objects,
 * specifically tailored for lead data processing.
 */
class ExcelParser {
  /**
   * Parse an Excel file to JSON
   * @param {string} filePath - Path to the Excel file
   * @param {Object} options - Parser options
   * @returns {Array} - Array of parsed objects
   */
  static parseExcel(filePath, options = {}) {
    try {
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      
      // Read the Excel file
      const workbook = xlsx.readFile(filePath);
      
      // Get the first sheet or a specified sheet
      const sheetName = options.sheet || workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      
      if (!sheet) {
        throw new Error(`Sheet not found: ${sheetName}`);
      }
      
      // Parse to JSON
      const jsonData = xlsx.utils.sheet_to_json(sheet, {
        raw: false,
        defval: '',
        ...options
      });
      
      return jsonData;
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      throw error;
    }
  }
  
  /**
   * Normalize lead data from Excel format
   * @param {Array} leads - Raw Excel data
   * @returns {Array} - Normalized lead data
   */
  static normalizeLeadData(leads) {
    if (!leads || !Array.isArray(leads)) {
      return [];
    }
    
    return leads.map(lead => {
      // Create a normalized lead object
      const normalizedLead = {};
      
      // Map Excel columns to standardized fields
      Object.keys(lead).forEach(key => {
        const value = lead[key];
        const lowercaseKey = key.toLowerCase().trim();
        
        // Map common Excel field variations to standardized names
        if (lowercaseKey.includes('address') || lowercaseKey === 'property address') {
          normalizedLead.address = value;
        } else if (lowercaseKey.includes('city')) {
          normalizedLead.city = value;
        } else if (lowercaseKey.includes('state')) {
          normalizedLead.state = value;
        } else if (lowercaseKey.includes('zip')) {
          normalizedLead.zip = value;
        } else if (lowercaseKey.includes('owner') && !lowercaseKey.includes('address')) {
          normalizedLead.owner = value;
        } else if (lowercaseKey.includes('phone') || lowercaseKey.includes('mobile')) {
          normalizedLead.phone = value;
        } else if (lowercaseKey.includes('email')) {
          normalizedLead.email = value;
        } else if (lowercaseKey.includes('account') || lowercaseKey.includes('parcel')) {
          normalizedLead.accountNumber = value;
        } else if (lowercaseKey.includes('value') || lowercaseKey.includes('price')) {
          normalizedLead.value = value;
        } else {
          // Keep original field if not mapping to a standard field
          normalizedLead[key] = value;
        }
      });
      
      return normalizedLead;
    });
  }
  
  /**
   * Parse an Excel file containing lead data
   * @param {string} filePath - Path to the Excel file
   * @param {Object} options - Parser options
   * @returns {Array} - Array of normalized lead objects
   */
  static parseLeadExcel(filePath, options = {}) {
    const rawData = this.parseExcel(filePath, options);
    return this.normalizeLeadData(rawData);
  }
  
  /**
   * Export leads data to Excel file
   * @param {Array} leads - Lead data to export
   * @param {string} outputPath - Path for the output file
   * @param {Object} options - Export options
   * @returns {string} - Path to the created file
   */
  static exportToExcel(leads, outputPath, options = {}) {
    try {
      // Create worksheet from data
      const worksheet = xlsx.utils.json_to_sheet(leads);
      
      // Create workbook and add the worksheet
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, options.sheetName || 'Leads');
      
      // Ensure output directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      // Write to file
      xlsx.writeFile(workbook, outputPath);
      
      return outputPath;
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw error;
    }
  }
}

module.exports = ExcelParser; 