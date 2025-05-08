/**
 * Document Fetch Service
 * Responsible for retrieving property-related documents from public records and other sources
 */
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class DocumentFetchService {
  constructor() {
    this.baseUrl = process.env.DOCUMENT_API_URL || 'https://api.example.com/documents';
    this.apiKey = process.env.DOCUMENT_API_KEY || '';
    
    // Cache path for storing retrieved documents
    this.cachePath = path.join(__dirname, '../cache/documents');
    
    // Create cache directory if it doesn't exist
    if (!fs.existsSync(this.cachePath)) {
      fs.mkdirSync(this.cachePath, { recursive: true });
    }
    
    // Supported document types
    this.documentTypes = {
      'DEED': 'Property deed and transfer records',
      'TAX': 'Property tax records',
      'LIEN': 'Lien and judgment records',
      'FORE': 'Foreclosure notices',
      'PROBATE': 'Probate and estate records',
      'PERMIT': 'Building permits and code violations',
      'LISTING': 'Property listing descriptions',
      'BANKRUPTCY': 'Bankruptcy filings',
      'DIVORCE': 'Divorce records',
      'AUCTION': 'Auction notices'
    };
  }

  /**
   * Retrieve documents related to a property
   * @param {string} propertyId - Property identifier
   * @param {string} countyId - County identifier
   * @param {Object} options - Additional options
   * @returns {Promise<Array>} Array of document objects
   */
  async getDocuments(propertyId, countyId, options = {}) {
    try {
      logger.info(`Fetching documents for property ${propertyId} in county ${countyId}`);
      
      // Generate cache key
      const cacheKey = `${countyId}_${propertyId}`;
      const cacheFile = path.join(this.cachePath, `${cacheKey}.json`);
      
      // Check cache first
      if (fs.existsSync(cacheFile) && !options.forceRefresh) {
        logger.debug(`Using cached documents for property ${propertyId}`);
        const cachedDocuments = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        return cachedDocuments;
      }
      
      // If we're not in development mode, call the actual API
      if (process.env.NODE_ENV !== 'development') {
        const documents = await this._fetchFromAPI(propertyId, countyId, options);
        
        // Cache the results
        fs.writeFileSync(cacheFile, JSON.stringify(documents, null, 2));
        
        return documents;
      } else {
        // In development, use mocked results
        const mockDocuments = this._generateMockDocuments(propertyId, countyId);
        
        // Cache the mock results
        fs.writeFileSync(cacheFile, JSON.stringify(mockDocuments, null, 2));
        
        return mockDocuments;
      }
    } catch (error) {
      logger.error(`Error fetching documents: ${error.message}`, error);
      throw new Error(`Failed to fetch property documents: ${error.message}`);
    }
  }

  /**
   * Fetch documents from the API
   * @param {string} propertyId - Property identifier
   * @param {string} countyId - County identifier
   * @param {Object} options - Additional options
   * @returns {Promise<Array>} Array of document objects
   * @private
   */
  async _fetchFromAPI(propertyId, countyId, options) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/property/${propertyId}`,
        {
          params: {
            countyId,
            docTypes: options.documentTypes ? options.documentTypes.join(',') : undefined,
            startDate: options.startDate,
            endDate: options.endDate
          },
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data.documents || [];
    } catch (error) {
      logger.error('API call failed:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Generate mock documents for development testing
   * @param {string} propertyId - Property identifier
   * @param {string} countyId - County identifier
   * @returns {Array} Array of mock document objects
   * @private
   */
  _generateMockDocuments(propertyId, countyId) {
    // Generate a set of mock documents for testing
    const mockDocuments = [
      {
        id: `${countyId}-DEED-${Math.floor(Math.random() * 10000)}`,
        propertyId,
        countyId,
        documentType: 'DEED',
        title: 'Warranty Deed',
        recordingDate: new Date(Date.now() - Math.random() * 31536000000).toISOString(), // Random date in the last year
        documentUrl: `https://example.com/documents/${countyId}/${propertyId}/deed.pdf`,
        content: 'THIS WARRANTY DEED made this 10th day of January, 2022, between John Doe, a single person, grantor, and Jane Smith, grantee. WITNESSETH, that the grantor, for and in consideration of the sum of THREE HUNDRED THOUSAND DOLLARS ($300,000.00), the receipt whereof is hereby acknowledged, does hereby grant and convey unto the grantee, her heirs and assigns, the following described real estate.',
        metadata: {
          grantors: ['John Doe'],
          grantees: ['Jane Smith'],
          considerationAmount: 300000
        }
      },
      {
        id: `${countyId}-TAX-${Math.floor(Math.random() * 10000)}`,
        propertyId,
        countyId,
        documentType: 'TAX',
        title: 'Property Tax Statement',
        recordingDate: new Date(Date.now() - Math.random() * 15768000000).toISOString(), // Random date in the last 6 months
        documentUrl: `https://example.com/documents/${countyId}/${propertyId}/tax.pdf`,
        content: 'PROPERTY TAX STATEMENT FOR TAX YEAR 2023. Owner: Jane Smith. Property ID: ' + propertyId + '. Assessed Value: $320,000. Tax Amount Due: $4,800. DUE DATE: December 31, 2023. NOTICE: Property taxes are delinquent after the due date and subject to penalties and interest. If taxes remain unpaid, the property may be subject to foreclosure.',
        metadata: {
          taxYear: 2023,
          assessedValue: 320000,
          taxAmount: 4800,
          dueDate: '2023-12-31',
          delinquentStatus: false
        }
      },
      {
        id: `${countyId}-LIEN-${Math.floor(Math.random() * 10000)}`,
        propertyId,
        countyId,
        documentType: 'LIEN',
        title: 'Mechanic\'s Lien',
        recordingDate: new Date(Date.now() - Math.random() * 7884000000).toISOString(), // Random date in the last 3 months
        documentUrl: `https://example.com/documents/${countyId}/${propertyId}/lien.pdf`,
        content: 'NOTICE OF MECHANIC\'S LIEN. Claimant: ABC Contractors Inc. Amount: $18,500. Property Owner: Jane Smith. Property Address: 123 Main St. Description of Work: Kitchen remodel and bathroom renovation completed on June 15, 2023. Payment Demand: This lien is filed due to non-payment for services rendered. NOTICE: This lien may result in the loss of your property if not resolved.',
        metadata: {
          lienType: 'Mechanic\'s Lien',
          claimant: 'ABC Contractors Inc',
          amount: 18500,
          filingDate: '2023-07-20'
        }
      }
    ];
    
    // For some counties, add a foreclosure notice
    if (['harris', 'dallas', 'wayne', 'cook'].includes(countyId.toLowerCase())) {
      mockDocuments.push({
        id: `${countyId}-FORE-${Math.floor(Math.random() * 10000)}`,
        propertyId,
        countyId,
        documentType: 'FORE',
        title: 'Notice of Default and Election to Sell',
        recordingDate: new Date(Date.now() - Math.random() * 5256000000).toISOString(), // Random date in the last 2 months
        documentUrl: `https://example.com/documents/${countyId}/${propertyId}/foreclosure.pdf`,
        content: 'NOTICE OF DEFAULT AND ELECTION TO SELL UNDER DEED OF TRUST. Trustor: Jane Smith. Property Address: 123 Main St. YOU ARE IN DEFAULT UNDER A DEED OF TRUST DATED January 15, 2022. UNLESS YOU TAKE ACTION TO PROTECT YOUR PROPERTY, IT MAY BE SOLD AT A PUBLIC SALE. IF YOU NEED AN EXPLANATION OF THE NATURE OF THE PROCEEDING AGAINST YOU, YOU SHOULD CONTACT A LAWYER.',
        metadata: {
          lenderName: 'First National Bank',
          defaultAmount: 12500,
          saleDate: new Date(Date.now() + 5184000000).toISOString(), // 60 days in the future
          redemptionPeriod: '90 days'
        }
      });
    }
    
    return mockDocuments;
  }
}

module.exports = new DocumentFetchService(); 