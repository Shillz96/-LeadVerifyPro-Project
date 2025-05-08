/**
 * Document Analysis Service
 * Implements NLP to analyze property-related documents and extract insights
 */
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const natural = require('natural');
const documentFetchService = require('./documentFetchService');
const logger = require('../utils/logger');

// Initialize NLP tools from natural.js
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;
const TfIdf = natural.TfIdf;
const sentiment = new natural.SentimentAnalyzer('English', stemmer, 'afinn');

class DocumentAnalysisService {
  constructor() {
    // External NLP API configuration
    this.baseUrl = process.env.NLP_API_URL || 'https://api.example.com/nlp';
    this.apiKey = process.env.NLP_API_KEY || '';
    
    // Cache path
    this.cachePath = path.join(__dirname, '../cache/document-analysis');
    
    // Create cache directory if it doesn't exist
    if (!fs.existsSync(this.cachePath)) {
      fs.mkdirSync(this.cachePath, { recursive: true });
    }
    
    // Legal status keywords and phrases
    this.legalStatusTerms = {
      foreclosure: ['foreclosure', 'notice of default', 'trustee sale', 'sheriff sale', 'auction', 'repossession'],
      bankruptcy: ['bankruptcy', 'chapter 7', 'chapter 13', 'insolvency', 'debtor', 'creditor'],
      probate: ['probate', 'deceased', 'estate', 'heir', 'executor', 'will', 'inheritance'],
      divorce: ['divorce', 'dissolution', 'marital settlement', 'separation agreement'],
      tax_lien: ['tax lien', 'delinquent taxes', 'unpaid taxes', 'tax sale'],
      mechanics_lien: ['mechanic\'s lien', 'contractor lien', 'construction lien', 'unpaid work']
    };
    
    // Financial indicator keywords
    this.financialTerms = {
      distress: ['behind on payments', 'default', 'delinquent', 'past due', 'overdue', 'collections'],
      hardship: ['job loss', 'medical bills', 'hardship', 'financial difficulty', 'can\'t afford'],
      urgency: ['need to sell', 'must sell', 'quick sale', 'immediate', 'urgent', 'time-sensitive']
    };
    
    // Motivation indicators
    this.motivationTerms = {
      relocation: ['relocation', 'job transfer', 'moving', 'relocating', 'new job'],
      investment: ['investment property', 'rental property', 'no longer want to be landlord'],
      life_change: ['retirement', 'downsizing', 'empty nest', 'growing family', 'divorce'],
      property_issues: ['repairs', 'renovation', 'fixer-upper', 'problem property', 'code violations']
    };
  }

  /**
   * Analyze documents to extract legal status, financial indicators, and motivation factors
   * @param {Array} documents - Array of document objects
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeDocuments(documents, options = {}) {
    try {
      if (!documents || documents.length === 0) {
        return {
          legalStatus: null,
          financialIndicators: [],
          motivationTerms: [],
          sentiment: 0,
          confidence: 0,
          documentCount: 0
        };
      }
      
      logger.info(`Analyzing ${documents.length} documents`);
      
      // Generate cache key based on document IDs
      const documentIds = documents.map(doc => doc.id).sort().join('_');
      const cacheKey = this._generateCacheKey(documentIds);
      const cacheFile = path.join(this.cachePath, `${cacheKey}.json`);
      
      // Check cache first
      if (fs.existsSync(cacheFile) && !options.forceRefresh) {
        logger.debug(`Using cached analysis for documents ${documentIds}`);
        const cachedAnalysis = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        return cachedAnalysis;
      }
      
      let analysisResults;
      
      // If we're not in development mode and have API credentials, call the external API
      if (process.env.NODE_ENV !== 'development' && this.apiKey) {
        analysisResults = await this._analyzeWithExternalAPI(documents, options);
      } else {
        // Otherwise use our built-in analysis
        analysisResults = this._analyzeWithBuiltInNLP(documents);
      }
      
      // Cache the results
      fs.writeFileSync(cacheFile, JSON.stringify(analysisResults, null, 2));
      
      return analysisResults;
    } catch (error) {
      logger.error(`Error analyzing documents: ${error.message}`, error);
      throw new Error(`Document analysis failed: ${error.message}`);
    }
  }

  /**
   * Generate a cache key from document IDs
   * @param {string} documentIds - Joined document IDs
   * @returns {string} MD5 hash of the input string
   * @private
   */
  _generateCacheKey(documentIds) {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(documentIds).digest('hex');
  }

  /**
   * Analyze documents using an external NLP API
   * @param {Array} documents - Array of document objects
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Analysis results
   * @private
   */
  async _analyzeWithExternalAPI(documents, options) {
    try {
      // Prepare document content for API
      const documentContent = documents.map(doc => ({
        id: doc.id,
        text: doc.content,
        type: doc.documentType,
        metadata: doc.metadata
      }));
      
      // Call external NLP API
      const response = await axios.post(
        `${this.baseUrl}/analyze`,
        {
          documents: documentContent,
          analysisTypes: options.analysisTypes || ['entities', 'sentiment', 'classification'],
          options
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      logger.error('NLP API call failed:', error.response?.data || error.message);
      // Fallback to built-in NLP if API fails
      logger.info('Falling back to built-in NLP analysis');
      return this._analyzeWithBuiltInNLP(documents);
    }
  }

  /**
   * Analyze documents using built-in NLP tools
   * @param {Array} documents - Array of document objects
   * @returns {Object} Analysis results
   * @private
   */
  _analyzeWithBuiltInNLP(documents) {
    // Combine all document content
    const allText = documents.map(doc => doc.content).join(' ');
    
    // Tokenize and normalize text
    const tokens = tokenizer.tokenize(allText.toLowerCase());
    
    // Detect legal status
    const legalStatus = this._detectLegalStatus(allText);
    
    // Detect financial indicators
    const financialIndicators = this._detectFinancialIndicators(allText);
    
    // Detect motivation keywords
    const motivationKeywords = this._detectMotivationTerms(allText);
    
    // Calculate sentiment score (-5 to 5 scale)
    const sentimentScore = this._calculateSentiment(allText);
    
    // Calculate confidence based on document types and content length
    const confidence = this._calculateConfidence(documents);
    
    // Generate legalIssuesProbability based on detected issues
    const legalIssuesProbability = this._calculateLegalIssuesProbability(legalStatus);
    
    // Calculate motivation score (0-100 scale)
    const motivationScore = this._calculateMotivationScore(
      legalStatus, 
      financialIndicators, 
      motivationKeywords, 
      sentimentScore
    );
    
    return {
      legalStatus,
      financialIndicators,
      motivationTerms: motivationKeywords,
      sentiment: sentimentScore,
      legalIssuesProbability,
      motivationScore,
      confidence,
      documentCount: documents.length,
      documentTypes: [...new Set(documents.map(doc => doc.documentType))],
      analysisDate: new Date().toISOString()
    };
  }

  /**
   * Detect legal status indicators in text
   * @param {string} text - Document text
   * @returns {Object} Detected legal statuses
   * @private
   */
  _detectLegalStatus(text) {
    const lowerText = text.toLowerCase();
    const results = {};
    
    // Check each legal status category
    for (const [category, terms] of Object.entries(this.legalStatusTerms)) {
      const matches = terms.filter(term => lowerText.includes(term.toLowerCase()));
      if (matches.length > 0) {
        results[category] = {
          detected: true,
          matches,
          probability: matches.length / terms.length
        };
      }
    }
    
    return Object.keys(results).length > 0 ? results : null;
  }

  /**
   * Detect financial indicator terms in text
   * @param {string} text - Document text
   * @returns {Array} Detected financial indicators
   * @private
   */
  _detectFinancialIndicators(text) {
    const lowerText = text.toLowerCase();
    const results = [];
    
    // Check each financial indicator category
    for (const [category, terms] of Object.entries(this.financialTerms)) {
      const matches = terms.filter(term => lowerText.includes(term.toLowerCase()));
      if (matches.length > 0) {
        results.push({
          category,
          matches,
          strength: matches.length / terms.length
        });
      }
    }
    
    return results;
  }

  /**
   * Detect seller motivation terms in text
   * @param {string} text - Document text
   * @returns {Array} Detected motivation terms
   * @private
   */
  _detectMotivationTerms(text) {
    const lowerText = text.toLowerCase();
    const results = [];
    
    // Check each motivation category
    for (const [category, terms] of Object.entries(this.motivationTerms)) {
      const matches = terms.filter(term => lowerText.includes(term.toLowerCase()));
      if (matches.length > 0) {
        results.push({
          category,
          matches,
          strength: matches.length / terms.length
        });
      }
    }
    
    return results;
  }

  /**
   * Calculate sentiment score for text
   * @param {string} text - Document text
   * @returns {number} Sentiment score from -5 to 5
   * @private
   */
  _calculateSentiment(text) {
    // Split text into sentences for better sentiment analysis
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    
    let totalScore = 0;
    for (const sentence of sentences) {
      const tokens = tokenizer.tokenize(sentence.toLowerCase());
      totalScore += sentiment.getSentiment(tokens);
    }
    
    // Normalize to a -5 to 5 scale
    const normalizedScore = Math.max(-5, Math.min(5, totalScore));
    
    return parseFloat(normalizedScore.toFixed(2));
  }

  /**
   * Calculate confidence score based on document types and content
   * @param {Array} documents - Document objects
   * @returns {number} Confidence score from 0 to 1
   * @private
   */
  _calculateConfidence(documents) {
    if (!documents || documents.length === 0) return 0;
    
    // Weight by document type importance
    const typeWeights = {
      'FORE': 1.0,  // Foreclosure - highest importance
      'BANKRUPTCY': 1.0,
      'PROBATE': 0.9,
      'LIEN': 0.8,
      'TAX': 0.7,
      'DEED': 0.6,
      'DIVORCE': 0.6,
      'PERMIT': 0.5,
      'LISTING': 0.4,
      'AUCTION': 0.8
    };
    
    // Calculate weighted score
    let weightedSum = 0;
    let totalWeight = 0;
    
    for (const doc of documents) {
      const weight = typeWeights[doc.documentType] || 0.3;
      const contentLength = doc.content ? doc.content.length : 0;
      
      // Documents with more content give higher confidence
      const contentFactor = Math.min(1, contentLength / 1000);
      
      weightedSum += weight * contentFactor;
      totalWeight += weight;
    }
    
    // Normalize to 0-1 range
    const confidence = totalWeight > 0 ? weightedSum / totalWeight : 0;
    
    return parseFloat(confidence.toFixed(2));
  }

  /**
   * Calculate probability of legal issues based on detected legal status
   * @param {Object} legalStatus - Detected legal statuses
   * @returns {number} Probability score from 0 to 1
   * @private
   */
  _calculateLegalIssuesProbability(legalStatus) {
    if (!legalStatus) return 0;
    
    // Weight different legal issues by their importance for motivation
    const legalIssueWeights = {
      'foreclosure': 1.0,
      'bankruptcy': 0.9,
      'tax_lien': 0.8,
      'probate': 0.7,
      'divorce': 0.6,
      'mechanics_lien': 0.5
    };
    
    let totalScore = 0;
    let totalWeight = 0;
    
    for (const [issue, data] of Object.entries(legalStatus)) {
      const weight = legalIssueWeights[issue] || 0.3;
      totalScore += data.probability * weight;
      totalWeight += weight;
    }
    
    const probability = totalWeight > 0 ? totalScore / totalWeight : 0;
    
    return parseFloat(Math.min(1, probability).toFixed(2));
  }

  /**
   * Calculate overall motivation score based on all factors
   * @param {Object} legalStatus - Detected legal statuses
   * @param {Array} financialIndicators - Detected financial indicators
   * @param {Array} motivationTerms - Detected motivation terms
   * @param {number} sentimentScore - Text sentiment score
   * @returns {number} Motivation score from 0 to 100
   * @private
   */
  _calculateMotivationScore(legalStatus, financialIndicators, motivationTerms, sentimentScore) {
    // Base score starts at 40 (neutral)
    let score = 40;
    
    // Legal status adds up to 25 points
    if (legalStatus) {
      const legalIssuesCount = Object.keys(legalStatus).length;
      score += Math.min(25, legalIssuesCount * 8);
    }
    
    // Financial indicators add up to 20 points
    const financialScore = financialIndicators.reduce(
      (sum, indicator) => sum + (indicator.strength * 10), 
      0
    );
    score += Math.min(20, financialScore);
    
    // Motivation terms add up to 15 points
    const motivationScore = motivationTerms.reduce(
      (sum, term) => sum + (term.strength * 5), 
      0
    );
    score += Math.min(15, motivationScore);
    
    // Sentiment affects the score by up to 10 points
    // Negative sentiment increases motivation score (distressed sellers)
    if (sentimentScore < 0) {
      score += Math.min(10, Math.abs(sentimentScore) * 2);
    }
    
    // Cap at 0-100 range
    return Math.min(100, Math.max(0, Math.round(score)));
  }
}

module.exports = new DocumentAnalysisService(); 