const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const harrisCountyScraper = require('./harris-county');
const dallasCountyScraper = require('./dallas-county');
const countiesConfig = require('./config/counties');

/**
 * FireCrawlService - A service for web scraping real estate data and validating leads
 * This service handles data extraction from county property websites and
 * enriches lead data with property validation information.
 */
class FireCrawlService {
  constructor() {
    // Set default timeout for HTTP requests
    this.timeout = 30000;
    
    // Cache directory for storing temporary data
    this.cacheDir = path.join(__dirname, '../../cache/firecrawl');
    
    // Ensure cache directory exists
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
    
    // County scrapers
    this.scrapers = {
      harrisCounty: harrisCountyScraper,
      dallasCounty: dallasCountyScraper
      // Additional scrapers will be added as they are developed
    };
    
    // API endpoints for different counties/data sources are now managed in counties.js
  }

  /**
   * Validate a list of leads by checking against county records
   * @param {Array} leads - Array of lead objects to validate
   * @param {Object} options - Validation options
   * @returns {Promise<Array>} - Validated leads with additional data
   */
  async validateLeads(leads, options = {}) {
    try {
      const validatedLeads = [];
      
      for (const lead of leads) {
        // Clone the lead to avoid modifying the original
        const validatedLead = { ...lead, validation: { } };
        
        // Determine which county to check based on address
        const county = this._determineCounty(lead);
        
        if (county && this.scrapers[county]) {
          // Check if this county requires pro access and user has it
          const countyConfig = countiesConfig.getCountyById(county);
          if (countyConfig && countyConfig.proOnly && !options.isPro) {
            validatedLead.validation = {
              error: 'This county requires a Pro subscription',
              score: 0,
              timestamp: new Date().toISOString(),
              source: county,
              requiresPro: true
            };
          } else {
            // Extract property information from county records
            const propertyInfo = await this._extractPropertyInfo(lead, county);
            const score = this._calculateScore(lead, propertyInfo, county);
            
            validatedLead.validation = {
              ...propertyInfo,
              score,
              timestamp: new Date().toISOString(),
              source: county
            };
          }
        } else if (county) {
          // County identified but scraper not yet available
          const countyConfig = countiesConfig.getCountyById(county);
          validatedLead.validation = {
            error: 'County identified but data extraction not yet available',
            score: 0,
            timestamp: new Date().toISOString(),
            source: county,
            comingSoon: true,
            countyName: countyConfig ? countyConfig.name : county
          };
        } else {
          // No supported county found for this address
          validatedLead.validation = {
            error: 'Unsupported county or location',
            score: 0,
            timestamp: new Date().toISOString()
          };
        }
        
        validatedLeads.push(validatedLead);
      }
      
      return validatedLeads;
    } catch (error) {
      console.error('Error validating leads:', error);
      throw error;
    }
  }

  /**
   * Determine which county to use for validation based on lead address
   * @param {Object} lead - Lead to validate
   * @returns {string|null} - County identifier or null if not supported
   */
  _determineCounty(lead) {
    // Extract address components
    const { address = '', city = '', state = '', zip = '' } = lead;
    
    // Use the counties configuration to determine the county
    return countiesConfig.determineCounty({ address, city, state, zip });
  }

  /**
   * Extract property information from county records
   * @param {Object} lead - Lead to validate
   * @param {string} county - County identifier
   * @returns {Promise<Object>} - Property information
   */
  async _extractPropertyInfo(lead, county) {
    try {
      // Check if the county is supported
      if (!this.scrapers[county]) {
        throw new Error(`County ${county} is not supported`);
      }
      
      const scraper = this.scrapers[county];
      
      // Search for the property by address
      const properties = await scraper.searchByAddress({
        address: lead.address,
        city: lead.city,
        zip: lead.zip
      });
      
      // If no properties found, try to search by owner name
      if (!properties || properties.length === 0) {
        // Only try owner search if we have owner information
        if (lead.owner) {
          return this._searchByOwnerName(lead, county);
        }
        return { error: 'Property not found' };
      }
      
      // Use the first property result (most relevant)
      const property = properties[0];
      
      // Get detailed information for the property
      let propertyDetails;
      
      if (county === 'harrisCounty' && property.accountNumber) {
        propertyDetails = await scraper.getPropertyDetails(property.accountNumber);
      } else if (county === 'dallasCounty' && property.propertyId) {
        propertyDetails = await scraper.getPropertyDetails(property.propertyId);
      } else {
        return { error: 'Unable to retrieve property details' };
      }
      
      // Add property verification status
      propertyDetails.addressVerified = true;
      propertyDetails.ownerVerified = property.owner && lead.owner && 
                                     property.owner.toLowerCase().includes(lead.owner.toLowerCase());
      
      return propertyDetails;
    } catch (error) {
      console.error(`Error extracting property info for ${county}:`, error);
      return { error: error.message };
    }
  }

  /**
   * Search for property by owner name
   * @param {Object} lead - Lead to validate
   * @param {string} county - County identifier
   * @returns {Promise<Object>} - Property information
   */
  async _searchByOwnerName(lead, county) {
    try {
      const scraper = this.scrapers[county];
      
      const properties = await scraper.searchByOwner({
        ownerName: lead.owner
      });
      
      if (!properties || properties.length === 0) {
        return { error: 'Property not found by owner name' };
      }
      
      // Try to find the property that matches the address
      const matchedProperty = properties.find(p => 
        p.address && lead.address && 
        this._normalizeAddress(p.address).includes(this._normalizeAddress(lead.address))
      ) || properties[0];
      
      // Get detailed information for the property
      let propertyDetails;
      
      if (county === 'harrisCounty' && matchedProperty.accountNumber) {
        propertyDetails = await scraper.getPropertyDetails(matchedProperty.accountNumber);
      } else if (county === 'dallasCounty' && matchedProperty.propertyId) {
        propertyDetails = await scraper.getPropertyDetails(matchedProperty.propertyId);
      } else {
        return { error: 'Unable to retrieve property details' };
      }
      
      // Add property verification status
      propertyDetails.addressVerified = matchedProperty.address && lead.address && 
                                      this._normalizeAddress(matchedProperty.address).includes(this._normalizeAddress(lead.address));
      propertyDetails.ownerVerified = true;
      
      return propertyDetails;
    } catch (error) {
      console.error(`Error searching property by owner for ${county}:`, error);
      return { error: error.message };
    }
  }

  /**
   * Normalize address for comparison
   * @param {string} address - Address to normalize
   * @returns {string} - Normalized address
   */
  _normalizeAddress(address) {
    if (!address) return '';
    return address.replace(/\s+/g, ' ')
                  .replace(/,/g, '')
                  .toLowerCase()
                  .trim();
  }

  /**
   * Calculate a validation score based on the lead and property info
   * @param {Object} lead - Original lead data
   * @param {Object} propertyInfo - Extracted property information
   * @param {string} county - County identifier
   * @returns {number} - Validation score between 0-100
   */
  _calculateScore(lead, propertyInfo, county) {
    if (propertyInfo.error) {
      return 0;
    }
    
    // Use county-specific scoring if available
    if (county === 'harrisCounty' && this.scrapers.harrisCounty.calculateMotivationScore) {
      return this.scrapers.harrisCounty.calculateMotivationScore(propertyInfo);
    } else if (county === 'dallasCounty' && this.scrapers.dallasCounty.calculateMotivationScore) {
      return this.scrapers.dallasCounty.calculateMotivationScore(propertyInfo);
    }
    
    // Default scoring if county-specific scoring is not available
    let score = 0;
    
    // Basic scoring criteria
    if (propertyInfo.ownerVerified) score += 30;
    if (propertyInfo.addressVerified) score += 20;
    if (propertyInfo.vacant) score += 25;
    if (propertyInfo.taxInfo && propertyInfo.taxInfo.taxDelinquent) score += 15;
    if (propertyInfo.propertyValue) score += 10;
    
    // Ensure score is between 0-100
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Search for properties by address
   * @param {Object} options - Search options
   * @returns {Promise<Array>} - Matching properties
   */
  async searchProperties(options = {}) {
    try {
      const { address, city, state, zip, county } = options;
      
      // If county is specified, use that county's search
      if (county && this.scrapers[county]) {
        // Check if this county requires pro access
        const countyConfig = countiesConfig.getCountyById(county);
        if (countyConfig && countyConfig.proOnly && !options.isPro) {
          return [{
            error: 'This county requires a Pro subscription',
            requiresPro: true
          }];
        }
        
        return await this.scrapers[county].searchByAddress({
          address, city, zip
        });
      }
      
      // If no county specified, try to determine from address
      const determinedCounty = this._determineCountyFromAddress(address, city, state, zip);
      if (determinedCounty && this.scrapers[determinedCounty]) {
        // Check if this county requires pro access
        const countyConfig = countiesConfig.getCountyById(determinedCounty);
        if (countyConfig && countyConfig.proOnly && !options.isPro) {
          return [{
            error: 'This county requires a Pro subscription',
            requiresPro: true,
            county: determinedCounty,
            countyName: countyConfig.name
          }];
        }
        
        return await this.scrapers[determinedCounty].searchByAddress({
          address, city, zip
        });
      }
      
      // County identified but scraper not yet available
      if (determinedCounty) {
        const countyConfig = countiesConfig.getCountyById(determinedCounty);
        return [{
          error: 'County identified but data extraction not yet available',
          comingSoon: true,
          county: determinedCounty,
          countyName: countyConfig ? countyConfig.name : determinedCounty
        }];
      }
      
      return [];
    } catch (error) {
      console.error('Error searching properties:', error);
      throw error;
    }
  }
  
  /**
   * Determine county from address components
   * @param {string} address - Street address
   * @param {string} city - City
   * @param {string} state - State
   * @param {string} zip - ZIP code
   * @returns {string|null} - County identifier or null
   */
  _determineCountyFromAddress(address, city, state, zip) {
    // Use the counties configuration to determine the county
    return countiesConfig.determineCounty({ address, city, state, zip });
  }
  
  /**
   * Get property details by ID
   * @param {Object} options - Options including propertyId and county
   * @returns {Promise<Object>} - Property details
   */
  async getPropertyDetails(options = {}) {
    try {
      const { propertyId, accountNumber, county } = options;
      
      if (!county || !this.scrapers[county]) {
        throw new Error('Valid county is required for property details');
      }
      
      // Check if this county requires pro access
      const countyConfig = countiesConfig.getCountyById(county);
      if (countyConfig && countyConfig.proOnly && !options.isPro) {
        return {
          error: 'This county requires a Pro subscription',
          requiresPro: true
        };
      }
      
      const scraper = this.scrapers[county];
      
      if (county === 'harrisCounty' && accountNumber) {
        return await scraper.getPropertyDetails(accountNumber);
      } else if (county === 'dallasCounty' && propertyId) {
        return await scraper.getPropertyDetails(propertyId);
      }
      
      throw new Error('Property ID is required for property details');
    } catch (error) {
      console.error('Error getting property details:', error);
      throw error;
    }
  }
  
  /**
   * Batch validate a list of properties
   * @param {Array} properties - Array of property objects with identifiers
   * @returns {Promise<Array>} - Array of validated properties
   */
  async batchValidateProperties(properties) {
    try {
      const results = [];
      
      for (const property of properties) {
        const { id, propertyId, accountNumber, county } = property;
        
        if (!county || !this.scrapers[county]) {
          results.push({
            id,
            error: 'Valid county is required'
          });
          continue;
        }
        
        // Check if this county requires pro access
        const countyConfig = countiesConfig.getCountyById(county);
        if (countyConfig && countyConfig.proOnly && !property.isPro) {
          results.push({
            id,
            error: 'This county requires a Pro subscription',
            requiresPro: true
          });
          continue;
        }
        
        try {
          let details;
          if (county === 'harrisCounty' && accountNumber) {
            details = await this.scrapers.harrisCounty.getPropertyDetails(accountNumber);
          } else if (county === 'dallasCounty' && propertyId) {
            details = await this.scrapers.dallasCounty.getPropertyDetails(propertyId);
          } else {
            throw new Error('Valid property identifier is required');
          }
          
          // Calculate score
          const score = this._calculateScore({}, details, county);
          
          results.push({
            id,
            details,
            score
          });
        } catch (error) {
          results.push({
            id,
            error: error.message
          });
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error batch validating properties:', error);
      throw error;
    }
  }

  /**
   * Get a list of all available counties
   * @param {boolean} includeComing - Whether to include coming soon counties
   * @returns {Array} - List of counties
   */
  getCounties(includeComing = false) {
    const available = countiesConfig.getAvailableCounties();
    
    if (includeComing) {
      const comingSoon = countiesConfig.getComingSoonCounties();
      return [...available, ...comingSoon];
    }
    
    return available;
  }

  /**
   * Get a list of all counties by state
   * @returns {Object} - Counties grouped by state
   */
  getCountiesByState() {
    const allCounties = countiesConfig.getAllCounties();
    const countiesByState = {};
    
    allCounties.forEach(county => {
      if (!countiesByState[county.state]) {
        countiesByState[county.state] = [];
      }
      
      countiesByState[county.state].push(county);
    });
    
    return countiesByState;
  }
}

module.exports = new FireCrawlService(); 