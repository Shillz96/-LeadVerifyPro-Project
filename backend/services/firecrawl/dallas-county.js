const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

/**
 * Dallas County Property Scraper
 * This module handles property data extraction from Dallas County, TX
 * public records, including DCAD property records and tax information.
 */
class DallasCountyScraper {
  constructor() {
    // Base URLs for Dallas County property data
    this.baseUrl = 'https://www.dallascad.org';
    this.propertySearchUrl = 'https://www.dallascad.org/SearchOwner.aspx';
    this.taxSearchUrl = 'https://www.dallaspropertytax.org/';
    
    // Cache directory for storing temporary data
    this.cacheDir = path.join(__dirname, '../../cache/firecrawl/dallas');
    
    // Ensure cache directory exists
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Search for properties by owner name
   * @param {Object} options - Search options (ownerName, first, last)
   * @returns {Promise<Array>} - Matching properties
   */
  async searchByOwner(options = {}) {
    const { ownerName, first, last } = options;
    let searchName = ownerName;
    
    // If first and last name provided instead of full name
    if (!searchName && (first || last)) {
      searchName = [last, first].filter(Boolean).join(', ');
    }
    
    if (!searchName) {
      throw new Error('Owner name is required for Dallas County property search');
    }
    
    const browser = await puppeteer.launch({ headless: true });
    
    try {
      const page = await browser.newPage();
      
      // Navigate to the owner search page
      await page.goto(this.propertySearchUrl, { waitUntil: 'networkidle2' });
      
      // Wait for the search form
      await page.waitForSelector('#txtOwnerName');
      
      // Fill out the search form
      await page.type('#txtOwnerName', searchName);
      
      // Submit the form and wait for results
      await Promise.all([
        page.click('#cmdSearch'),
        page.waitForNavigation({ waitUntil: 'networkidle2' })
      ]);
      
      // Check if there are results
      const hasResults = await page.$('#SearchResultsTable') !== null;
      
      if (!hasResults) {
        return [];
      }
      
      // Extract results from the page
      const content = await page.content();
      const results = this._parseSearchResults(content);
      
      return results;
    } catch (error) {
      console.error('Error searching Dallas County properties:', error);
      return [];
    } finally {
      await browser.close();
    }
  }

  /**
   * Search for properties by address
   * @param {Object} options - Search options (address, city, zip)
   * @returns {Promise<Array>} - Matching properties
   */
  async searchByAddress(options = {}) {
    const { address, city = 'DALLAS', zip } = options;
    
    if (!address) {
      throw new Error('Address is required for Dallas County property search');
    }
    
    const browser = await puppeteer.launch({ headless: true });
    
    try {
      const page = await browser.newPage();
      
      // Navigate to the address search page
      await page.goto('https://www.dallascad.org/SearchAddr.aspx', { waitUntil: 'networkidle2' });
      
      // Fill out the search form
      await page.type('#txtAddrSearch', address);
      
      // Submit the form and wait for results
      await Promise.all([
        page.click('#cmdSearch'),
        page.waitForNavigation({ waitUntil: 'networkidle2' })
      ]);
      
      // Check if there are results
      const hasResults = await page.$('#SearchResultsTable') !== null;
      
      if (!hasResults) {
        return [];
      }
      
      // Extract results from the page
      const content = await page.content();
      const results = this._parseSearchResults(content);
      
      return results;
    } catch (error) {
      console.error('Error searching Dallas County properties by address:', error);
      return [];
    } finally {
      await browser.close();
    }
  }

  /**
   * Get property details by property ID
   * @param {string} propertyId - Dallas CAD property ID
   * @returns {Promise<Object>} - Property details
   */
  async getPropertyDetails(propertyId) {
    const browser = await puppeteer.launch({ headless: true });
    
    try {
      const page = await browser.newPage();
      
      // Navigate to the property details page
      await page.goto(`https://www.dallascad.org/AcctDetailRes.aspx?ID=${propertyId}`, { waitUntil: 'networkidle2' });
      
      // Extract details from the page
      const content = await page.content();
      const details = this._parsePropertyDetails(content, propertyId);
      
      // Get tax info in a separate request
      const taxInfo = await this._getTaxInfo(propertyId);
      
      return {
        ...details,
        taxInfo
      };
    } catch (error) {
      console.error(`Error getting Dallas County property details for ID ${propertyId}:`, error);
      return { error: error.message };
    } finally {
      await browser.close();
    }
  }

  /**
   * Get property tax information
   * @param {string} propertyId - Dallas CAD property ID
   * @returns {Promise<Object>} - Tax information
   */
  async _getTaxInfo(propertyId) {
    const browser = await puppeteer.launch({ headless: true });
    
    try {
      const page = await browser.newPage();
      
      // Navigate to the tax inquiry page
      await page.goto('https://www.dallaspropertytax.org/TaxInquirySearch.aspx', { waitUntil: 'networkidle2' });
      
      // Fill and submit the search form
      await page.type('#txtAccountNo', propertyId);
      
      await Promise.all([
        page.click('#btnSearch'),
        page.waitForNavigation({ waitUntil: 'networkidle2' })
      ]);
      
      // Extract tax info from the page
      const content = await page.content();
      return this._parseTaxInfo(content);
    } catch (error) {
      console.error(`Error getting tax info for property ID ${propertyId}:`, error);
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
    $('#SearchResultsTable tr').each((index, row) => {
      // Skip header row
      if (index === 0) return;
      
      const columns = $(row).find('td');
      if (columns.length >= 5) {
        const propertyId = $(columns[0]).text().trim();
        const address = $(columns[1]).text().trim();
        const ownerName = $(columns[2]).text().trim();
        const propertyType = $(columns[3]).text().trim();
        const value = $(columns[4]).text().trim();
        
        // Extract property ID from link if available
        let propId = propertyId;
        const idLink = $(columns[0]).find('a');
        if (idLink.length) {
          const href = idLink.attr('href') || '';
          const idMatch = href.match(/ID=(\d+)/);
          if (idMatch && idMatch[1]) {
            propId = idMatch[1];
          }
        }
        
        results.push({
          propertyId: propId,
          address,
          owner: ownerName,
          propertyType,
          value,
          county: 'dallasCounty'
        });
      }
    });
    
    return results;
  }

  /**
   * Parse property details from HTML content
   * @param {string} html - HTML content
   * @param {string} propertyId - Dallas CAD property ID
   * @returns {Object} - Parsed property details
   */
  _parsePropertyDetails(html, propertyId) {
    const $ = cheerio.load(html);
    const details = { propertyId };
    
    // Extract property value
    details.propertyValue = $('#ValueSummaryTableCurrent tr')
      .filter((i, el) => $(el).text().includes('Total Market Value:'))
      .find('td')
      .last()
      .text()
      .trim();
    
    // Extract property characteristics
    details.characteristics = {};
    $('#BuildingDescTable tr').each((i, el) => {
      const label = $(el).find('td').first().text().trim();
      const value = $(el).find('td').last().text().trim();
      
      // Map specific characteristics
      if (label.includes('Year Built')) {
        details.characteristics.yearBuilt = value;
      } else if (label.includes('Living Area')) {
        details.characteristics.livingArea = value;
      } else if (label.includes('Stories')) {
        details.characteristics.stories = value;
      } else if (label.includes('Style')) {
        details.characteristics.style = value;
      }
    });
    
    // Extract land info
    $('#LandTableRes tr').each((i, el) => {
      const columns = $(el).find('td');
      if (columns.length >= 4) {
        const sqFt = $(columns[2]).text().trim();
        if (sqFt) {
          details.characteristics.landArea = sqFt;
        }
      }
    });
    
    // Extract ownership information
    details.owner = $('#OwnerTableResMobile tr')
      .filter((i, el) => $(el).text().includes('Owner Name:'))
      .find('td')
      .last()
      .text()
      .trim();
    
    details.ownerAddress = '';
    $('#OwnerTableResMobile tr').each((i, el) => {
      const label = $(el).find('td').first().text().trim();
      const value = $(el).find('td').last().text().trim();
      
      if (label.includes('Mailing Address:') || label.includes('City, State, Zip:')) {
        details.ownerAddress += (details.ownerAddress ? ' ' : '') + value;
      }
    });
    
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
    const taxDueRow = $('#TaxYearSummaryTable tr').filter((i, el) => $(el).text().includes('Total Due:'));
    if (taxDueRow.length) {
      taxInfo.taxAmountDue = taxDueRow.find('td').last().text().trim();
    }
    
    // Extract delinquent status - look for delinquent tax years
    const delinquentYears = $('#TaxYearSummaryTable tr')
      .filter((i, el) => $(el).text().includes('Delinquent') && !$(el).text().includes('Total'));
    
    taxInfo.taxDelinquent = delinquentYears.length > 0;
    
    // Extract last payment date from payment history if available
    const paymentHistoryLink = $('a').filter((i, el) => $(el).text().includes('Payment History'));
    if (paymentHistoryLink.length) {
      taxInfo.hasPaymentHistory = true;
    }
    
    return taxInfo;
  }

  /**
   * Determine if a property is likely vacant based on property details
   * @param {Object} details - Property details
   * @returns {boolean} - True if property is likely vacant
   */
  _isLikelyVacant(details) {
    // Property address
    const propertyAddress = details.address || '';
    
    // Owner mailing address
    const ownerAddress = details.ownerAddress || '';
    
    // If owner address is different from property address, likely vacant
    if (propertyAddress && ownerAddress && 
        !ownerAddress.toLowerCase().includes(this._normalizeAddress(propertyAddress).toLowerCase())) {
      return true;
    }
    
    // Other vacancy indicators could be added here
    return false;
  }

  /**
   * Normalize address for comparison
   * @param {string} address - Address to normalize
   * @returns {string} - Normalized address
   */
  _normalizeAddress(address) {
    return address.replace(/\s+/g, ' ')
                  .replace(/,/g, '')
                  .toLowerCase()
                  .trim();
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
    
    // Tax amount due is high
    if (propertyDetails.taxInfo?.taxAmountDue) {
      const amountDue = parseFloat(propertyDetails.taxInfo.taxAmountDue.replace(/[$,]/g, ''));
      if (!isNaN(amountDue) && amountDue > 5000) {
        score += 15;
      } else if (!isNaN(amountDue) && amountDue > 2000) {
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
    
    // High value property with issues (potential opportunity)
    if (propertyDetails.propertyValue) {
      const value = parseFloat(propertyDetails.propertyValue.replace(/[$,]/g, ''));
      if (!isNaN(value) && value > 300000 && propertyDetails.taxInfo?.taxDelinquent) {
        score += 10;
      }
    }
    
    // Ensure score is between 0-100
    return Math.min(100, Math.max(0, score));
  }
}

module.exports = new DallasCountyScraper(); 