const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

/**
 * Harris County Property Scraper
 * This module handles property data extraction from Harris County (Houston, TX)
 * public records, including HCAD property records and tax information.
 */
class HarrisCountyScraper {
  constructor() {
    // Base URLs for Harris County property data
    this.baseUrl = 'https://hcad.org';
    this.propertySearchUrl = 'https://public.hcad.org/records/Real.asp';
    this.taxSearchUrl = 'https://www.hctax.net/Property/PropertyTax';
    
    // Cache directory for storing temporary data
    this.cacheDir = path.join(__dirname, '../../cache/firecrawl/harris');
    
    // Ensure cache directory exists
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Search for properties by address
   * @param {Object} options - Search options (address, city, zip)
   * @returns {Promise<Array>} - Matching properties
   */
  async searchByAddress(options = {}) {
    const { address, city = 'HOUSTON', zip } = options;
    const browser = await puppeteer.launch({ headless: true });
    
    try {
      const page = await browser.newPage();
      
      // Navigate to the property search page
      await page.goto(this.propertySearchUrl, { waitUntil: 'networkidle2' });
      
      // Fill out the search form
      await page.type('input[name="stnum"]', this._extractStreetNumber(address) || '');
      await page.type('input[name="stname"]', this._extractStreetName(address) || '');
      
      if (city) {
        await page.type('input[name="city"]', city);
      }
      
      if (zip) {
        await page.type('input[name="zip"]', zip);
      }
      
      // Submit the form and wait for results
      await Promise.all([
        page.click('input[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'networkidle2' })
      ]);
      
      // Extract results from the page
      const content = await page.content();
      const results = this._parseSearchResults(content);
      
      return results;
    } catch (error) {
      console.error('Error searching Harris County properties:', error);
      return [];
    } finally {
      await browser.close();
    }
  }

  /**
   * Get property details by account number
   * @param {string} accountNumber - HCAD account number
   * @returns {Promise<Object>} - Property details
   */
  async getPropertyDetails(accountNumber) {
    const browser = await puppeteer.launch({ headless: true });
    
    try {
      const page = await browser.newPage();
      
      // Navigate to the property details page
      await page.goto(`https://public.hcad.org/records/details.asp?crypt=%93CRP%94&acct=${accountNumber}`, { waitUntil: 'networkidle2' });
      
      // Extract details from the page
      const content = await page.content();
      const details = this._parsePropertyDetails(content, accountNumber);
      
      // Get tax info in a separate request
      const taxInfo = await this._getTaxInfo(accountNumber);
      
      return {
        ...details,
        taxInfo
      };
    } catch (error) {
      console.error(`Error getting Harris County property details for account ${accountNumber}:`, error);
      return { error: error.message };
    } finally {
      await browser.close();
    }
  }

  /**
   * Get property tax information
   * @param {string} accountNumber - HCAD account number
   * @returns {Promise<Object>} - Tax information
   */
  async _getTaxInfo(accountNumber) {
    const browser = await puppeteer.launch({ headless: true });
    
    try {
      const page = await browser.newPage();
      
      // Navigate to the tax search page
      await page.goto(this.taxSearchUrl, { waitUntil: 'networkidle2' });
      
      // Fill and submit the search form
      await page.type('input#propertyID', accountNumber);
      
      await Promise.all([
        page.click('input[type="submit"]'),
        page.waitForNavigation({ waitUntil: 'networkidle2' })
      ]);
      
      // Extract tax info from the page
      const content = await page.content();
      return this._parseTaxInfo(content);
    } catch (error) {
      console.error(`Error getting tax info for account ${accountNumber}:`, error);
      return { error: error.message };
    } finally {
      await browser.close();
    }
  }

  /**
   * Parse search results from HTML content
   * @param {string} html - HTML content
   * @returns {Array} - Parsed property results
   */
  _parseSearchResults(html) {
    const $ = cheerio.load(html);
    const results = [];
    
    // Find the results table
    $('table tr').each((index, row) => {
      // Skip header row
      if (index === 0) return;
      
      const columns = $(row).find('td');
      if (columns.length >= 5) {
        const accountNumber = $(columns[0]).text().trim();
        const address = $(columns[1]).text().trim();
        const owner = $(columns[2]).text().trim();
        const legal = $(columns[3]).text().trim();
        const valuation = $(columns[4]).text().trim();
        
        results.push({
          accountNumber,
          address,
          owner,
          legal,
          valuation,
          county: 'harrisCounty'
        });
      }
    });
    
    return results;
  }

  /**
   * Parse property details from HTML content
   * @param {string} html - HTML content
   * @param {string} accountNumber - HCAD account number
   * @returns {Object} - Parsed property details
   */
  _parsePropertyDetails(html, accountNumber) {
    const $ = cheerio.load(html);
    const details = { accountNumber };
    
    // Extract property value
    const valuationRow = $('table tr').filter((i, el) => $(el).text().includes('Appraised Value:'));
    if (valuationRow.length) {
      details.propertyValue = valuationRow.find('td').last().text().trim();
    }
    
    // Extract property characteristics
    details.characteristics = {};
    $('table tr').each((i, el) => {
      const label = $(el).find('td').first().text().trim();
      const value = $(el).find('td').last().text().trim();
      
      // Map specific characteristics
      if (label.includes('Land Area')) {
        details.characteristics.landArea = value;
      } else if (label.includes('Building Area')) {
        details.characteristics.buildingArea = value;
      } else if (label.includes('Year Built')) {
        details.characteristics.yearBuilt = value;
      } else if (label.includes('State Class')) {
        details.characteristics.stateClass = value;
      }
    });
    
    // Extract ownership information
    details.owner = $('table tr').filter((i, el) => $(el).text().includes('Owner:')).find('td').last().text().trim();
    details.ownerAddress = $('table tr').filter((i, el) => $(el).text().includes('Mailing Address:')).find('td').last().text().trim();
    
    // Determine if property is likely vacant based on different addresses
    details.vacant = this._isLikelyVacant(details);
    
    return details;
  }

  /**
   * Parse tax information from HTML content
   * @param {string} html - HTML content
   * @returns {Object} - Parsed tax information
   */
  _parseTaxInfo(html) {
    const $ = cheerio.load(html);
    const taxInfo = {};
    
    // Extract tax amount due
    const taxDueRow = $('table tr').filter((i, el) => $(el).text().includes('Total Amount Due:'));
    if (taxDueRow.length) {
      taxInfo.taxAmountDue = taxDueRow.find('td').last().text().trim();
    }
    
    // Extract delinquent status
    const delinquentRow = $('table tr').filter((i, el) => $(el).text().includes('Delinquent:'));
    if (delinquentRow.length) {
      const delinquentText = delinquentRow.find('td').last().text().trim();
      taxInfo.taxDelinquent = delinquentText.toLowerCase() === 'yes';
    }
    
    // Extract last payment date
    const lastPaymentRow = $('table tr').filter((i, el) => $(el).text().includes('Last Payment Date:'));
    if (lastPaymentRow.length) {
      taxInfo.lastPaymentDate = lastPaymentRow.find('td').last().text().trim();
    }
    
    return taxInfo;
  }

  /**
   * Determine if a property is likely vacant based on property details
   * @param {Object} details - Property details
   * @returns {boolean} - True if property is likely vacant
   */
  _isLikelyVacant(details) {
    // If owner address is different from property address, likely vacant
    if (details.address && details.ownerAddress && 
        !details.ownerAddress.includes(details.address)) {
      return true;
    }
    
    // Other vacancy indicators could be added here
    return false;
  }

  /**
   * Extract street number from address
   * @param {string} address - Full address
   * @returns {string} - Street number
   */
  _extractStreetNumber(address) {
    if (!address) return '';
    const match = address.match(/^(\d+)/);
    return match ? match[1] : '';
  }

  /**
   * Extract street name from address
   * @param {string} address - Full address
   * @returns {string} - Street name
   */
  _extractStreetName(address) {
    if (!address) return '';
    const match = address.match(/^\d+\s+(.*?)(?:,|$)/);
    return match ? match[1].trim() : '';
  }

  /**
   * Calculate property motivation score
   * @param {Object} propertyDetails - Property details including tax info
   * @returns {number} - Motivation score (0-100)
   */
  calculateMotivationScore(propertyDetails) {
    let score = 0;
    
    // If there was an error getting details, score is 0
    if (propertyDetails.error) {
      return 0;
    }
    
    // Scoring factors
    
    // Vacant property (highest indicator)
    if (propertyDetails.vacant) {
      score += 30;
    }
    
    // Tax delinquency (strong indicator)
    if (propertyDetails.taxInfo?.taxDelinquent) {
      score += 25;
    }
    
    // No recent tax payments
    if (propertyDetails.taxInfo?.lastPaymentDate) {
      const lastPayment = new Date(propertyDetails.taxInfo.lastPaymentDate);
      const now = new Date();
      const monthsAgo = (now.getFullYear() - lastPayment.getFullYear()) * 12 + 
                         (now.getMonth() - lastPayment.getMonth());
      
      if (monthsAgo > 12) {
        score += 15;
      } else if (monthsAgo > 6) {
        score += 10;
      }
    }
    
    // Out of state owner (moderate indicator)
    if (propertyDetails.ownerAddress && 
        !propertyDetails.ownerAddress.toLowerCase().includes('texas') &&
        !propertyDetails.ownerAddress.toLowerCase().includes('tx')) {
      score += 10;
    }
    
    // Older property (minor indicator)
    if (propertyDetails.characteristics?.yearBuilt) {
      const yearBuilt = parseInt(propertyDetails.characteristics.yearBuilt);
      if (!isNaN(yearBuilt) && yearBuilt < 1970) {
        score += 5;
      }
    }
    
    // Ensure score is between 0-100
    return Math.min(100, Math.max(0, score));
  }
}

module.exports = new HarrisCountyScraper(); 