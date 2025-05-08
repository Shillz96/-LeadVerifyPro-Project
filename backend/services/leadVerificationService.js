const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

class LeadVerificationService {
  constructor() {
    // Set paths to Python scripts
    this.pythonScriptsPath = path.join(__dirname, '../../python-scripts');
    this.scoreLeadsScript = path.join(this.pythonScriptsPath, 'score_leads.py');
    this.textBlastScript = path.join(this.pythonScriptsPath, 'text_blast.py');
    this.leadGeneratorScript = path.join(this.pythonScriptsPath, 'lead_generator.py');
    
    // Temporary file paths
    this.tempDir = path.join(os.tmpdir(), 'leadverifypro');
    
    // Create temp directory if it doesn't exist
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  /**
   * Convert leads array to CSV file
   * @param {Array} leads - Array of lead objects
   * @returns {string} - Path to the created CSV file
   */
  async createLeadsCsv(leads) {
    const tempFile = path.join(this.tempDir, `leads_${Date.now()}.csv`);
    
    // Define CSV headers based on first lead
    const headers = Object.keys(leads[0] || {}).map(id => ({
      id,
      title: id.charAt(0).toUpperCase() + id.slice(1).replace(/_/g, ' ')
    }));
    
    const csvWriter = createCsvWriter({
      path: tempFile,
      header: headers
    });
    
    await csvWriter.writeRecords(leads);
    return tempFile;
  }

  /**
   * Read CSV file into array of objects
   * @param {string} filePath - Path to CSV file
   * @returns {Promise<Array>} - Array of lead objects
   */
  readCsvFile(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }

  /**
   * Execute a Python script with arguments
   * @param {string} scriptPath - Path to Python script
   * @param {Array} args - Command line arguments
   * @returns {Promise<Object>} - Result of the script execution
   */
  executeScript(scriptPath, args = []) {
    return new Promise((resolve, reject) => {
      // Determine Python executable
      const pythonExecutable = process.platform === 'win32' ? 'python' : 'python3';
      
      // Spawn Python process
      const process = spawn(pythonExecutable, [scriptPath, ...args]);
      
      let stdout = '';
      let stderr = '';
      
      // Collect stdout
      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      // Collect stderr
      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      // Handle process exit
      process.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Script execution failed: ${stderr}`));
        } else {
          resolve({ stdout, stderr });
        }
      });
      
      // Handle process error
      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Verify and score leads
   * @param {Array} leads - Array of lead objects
   * @returns {Promise<Array>} - Array of verified/scored lead objects
   */
  async verifyLeads(leads) {
    try {
      // Create input CSV
      const inputCsv = await this.createLeadsCsv(leads);
      
      // Create output path
      const outputCsv = path.join(this.tempDir, `verified_${Date.now()}.csv`);
      
      // Execute Python script
      await this.executeScript(this.scoreLeadsScript, [inputCsv, '--output', outputCsv]);
      
      // Read results
      const results = await this.readCsvFile(outputCsv);
      
      // Clean up temporary files
      fs.unlinkSync(inputCsv);
      fs.unlinkSync(outputCsv);
      
      return results;
    } catch (error) {
      console.error('Error verifying leads:', error);
      throw error;
    }
  }

  /**
   * Send text messages to leads
   * @param {Array} leads - Array of verified lead objects
   * @param {Object} options - Text blast options
   * @returns {Promise<Object>} - Results of the text blast
   */
  async sendTextBlast(leads, options = {}) {
    try {
      // Default options
      const defaults = {
        template: 'generic',
        test: true, // Default to test mode for safety
        limit: 100
      };
      
      const settings = { ...defaults, ...options };
      
      // Create input CSV
      const inputCsv = await this.createLeadsCsv(leads);
      
      // Create output path for results
      const outputJson = path.join(this.tempDir, `blast_results_${Date.now()}.json`);
      
      // Build arguments
      const args = [
        inputCsv,
        '--template', settings.template,
        '--output', outputJson,
        '--limit', settings.limit.toString()
      ];
      
      // Add test flag if in test mode
      if (settings.test) {
        args.push('--test');
      }
      
      // Execute Python script
      await this.executeScript(this.textBlastScript, args);
      
      // Read results
      const resultsRaw = fs.readFileSync(outputJson, 'utf8');
      const results = JSON.parse(resultsRaw);
      
      // Clean up temporary files
      fs.unlinkSync(inputCsv);
      fs.unlinkSync(outputJson);
      
      return results;
    } catch (error) {
      console.error('Error sending text blast:', error);
      throw error;
    }
  }

  /**
   * Generate new leads based on existing leads
   * @param {Array} existingLeads - Array of existing lead objects
   * @param {Object} options - Lead generation options
   * @returns {Promise<Array>} - Array of generated lead objects
   */
  async generateLeads(existingLeads, options = {}) {
    try {
      // Create input CSV if leads provided
      let inputCsv = null;
      if (existingLeads && existingLeads.length > 0) {
        inputCsv = await this.createLeadsCsv(existingLeads);
      }
      
      // Create output path
      const outputCsv = path.join(this.tempDir, `generated_leads_${Date.now()}.csv`);
      
      // Build arguments
      const args = ['--output', outputCsv];
      
      // Add input file if we have existing leads
      if (inputCsv) {
        args.unshift('--input', inputCsv);
      }
      
      // Add location arguments if provided
      if (options.zip) args.push('--zip', options.zip);
      if (options.city) args.push('--city', options.city);
      if (options.state) args.push('--state', options.state);
      
      // Add target flags
      if (options.foreclosure) args.push('--foreclosure');
      if (options.fsbo) args.push('--fsbo');
      
      // Execute Python script
      await this.executeScript(this.leadGeneratorScript, args);
      
      // Read results
      const results = await this.readCsvFile(outputCsv);
      
      // Clean up temporary files
      if (inputCsv) fs.unlinkSync(inputCsv);
      fs.unlinkSync(outputCsv);
      
      return results;
    } catch (error) {
      console.error('Error generating leads:', error);
      throw error;
    }
  }
}

module.exports = new LeadVerificationService(); 