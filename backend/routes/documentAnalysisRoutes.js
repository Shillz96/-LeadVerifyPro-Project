/**
 * Document Analysis Routes
 * Endpoints for document analysis using NLP
 */
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Lead = require('../models/Lead');
const documentFetchService = require('../services/documentFetchService');
const documentAnalysisService = require('../services/documentAnalysisService');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * @route   POST /api/document-analysis/analyze-property-documents
 * @desc    Analyze documents related to a property
 * @access  Private
 */
router.post('/analyze-property-documents', auth, async (req, res) => {
  try {
    const { leadId, propertyId, countyId, forceRefresh } = req.body;
    
    // Validate required parameters
    if (!leadId && !propertyId) {
      return res.status(400).json({ 
        success: false, 
        error: {
          message: 'Either leadId or propertyId is required'
        }
      });
    }
    
    if (!countyId) {
      return res.status(400).json({ 
        success: false, 
        error: {
          message: 'County ID is required'
        }
      });
    }
    
    // Get or verify the lead record if leadId is provided
    let lead;
    if (leadId) {
      if (!mongoose.Types.ObjectId.isValid(leadId)) {
        return res.status(400).json({ 
          success: false, 
          error: {
            message: 'Invalid lead ID format'
          }
        });
      }
      
      lead = await Lead.findById(leadId);
      if (!lead) {
        return res.status(404).json({ 
          success: false, 
          error: {
            message: 'Lead not found'
          }
        });
      }
      
      // Check if the lead belongs to the current user
      if (lead.user.toString() !== req.user.id) {
        return res.status(403).json({ 
          success: false, 
          error: {
            message: 'Not authorized to access this lead'
          }
        });
      }
    }
    
    // Determine which property ID to use
    const targetPropertyId = propertyId || (lead && lead.propertyId);
    
    if (!targetPropertyId) {
      return res.status(400).json({ 
        success: false, 
        error: {
          message: 'Property ID is required for document analysis'
        }
      });
    }
    
    // Fetch documents for the property
    const documents = await documentFetchService.getDocuments(
      targetPropertyId, 
      countyId, 
      { forceRefresh }
    );
    
    if (!documents || documents.length === 0) {
      return res.json({
        success: true,
        data: {
          message: 'No documents found for this property',
          documentCount: 0
        }
      });
    }
    
    // Analyze the documents
    const analysisResults = await documentAnalysisService.analyzeDocuments(
      documents, 
      { forceRefresh }
    );
    
    // If we have a lead, update it with the analysis results
    if (lead) {
      lead.documentAnalysis = {
        legalStatus: analysisResults.legalStatus,
        financialSituation: {
          indicators: analysisResults.financialIndicators,
          summary: generateFinancialSummary(analysisResults.financialIndicators)
        },
        motivationKeywords: analysisResults.motivationTerms,
        documentSentiment: analysisResults.sentiment,
        motivationScore: analysisResults.motivationScore,
        legalIssuesProbability: analysisResults.legalIssuesProbability,
        confidence: analysisResults.confidence,
        documentCount: documents.length,
        documentTypes: analysisResults.documentTypes,
        documentIds: documents.map(doc => doc.id),
        analysisDate: new Date(),
        textuallyAnalyzed: true
      };
      
      // Update the overall lead score if lower than the motivation score
      if (!lead.score || lead.score < analysisResults.motivationScore) {
        lead.score = analysisResults.motivationScore;
      }
      
      await lead.save();
      
      logger.info(`Updated lead ${leadId} with document analysis results`);
    }
    
    return res.json({
      success: true,
      data: {
        analysis: analysisResults,
        documents: documents.map(doc => ({
          id: doc.id,
          type: doc.documentType,
          title: doc.title,
          recordingDate: doc.recordingDate,
          url: doc.documentUrl
        })),
        leadUpdated: Boolean(lead)
      }
    });
  } catch (error) {
    logger.error('Document analysis API error:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Error analyzing documents',
        details: error.message
      }
    });
  }
});

/**
 * @route   GET /api/document-analysis/legal-status/:leadId
 * @desc    Get legal status information for a lead
 * @access  Private
 */
router.get('/legal-status/:leadId', auth, async (req, res) => {
  try {
    const leadId = req.params.leadId;
    
    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      return res.status(400).json({ 
        success: false, 
        error: {
          message: 'Invalid lead ID format'
        }
      });
    }
    
    const lead = await Lead.findById(leadId);
    
    if (!lead) {
      return res.status(404).json({ 
        success: false, 
        error: {
          message: 'Lead not found'
        }
      });
    }
    
    // Check if the lead belongs to the current user
    if (lead.user.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        error: {
          message: 'Not authorized to access this lead'
        }
      });
    }
    
    // Check if document analysis has been performed
    if (!lead.documentAnalysis || !lead.documentAnalysis.textuallyAnalyzed) {
      return res.json({
        success: true,
        data: {
          message: 'No document analysis has been performed for this lead',
          hasLegalIssues: false
        }
      });
    }
    
    const legalStatus = lead.documentAnalysis.legalStatus || {};
    const legalIssuesProbability = lead.documentAnalysis.legalIssuesProbability || 0;
    
    return res.json({
      success: true,
      data: {
        legalStatus,
        legalIssuesProbability,
        hasLegalIssues: legalIssuesProbability > 0.5 || Object.keys(legalStatus).length > 0,
        analysisDate: lead.documentAnalysis.analysisDate
      }
    });
  } catch (error) {
    logger.error('Legal status API error:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Error retrieving legal status information',
        details: error.message
      }
    });
  }
});

/**
 * @route   GET /api/document-analysis/motivation-factors/:leadId
 * @desc    Get motivation factors for a lead
 * @access  Private
 */
router.get('/motivation-factors/:leadId', auth, async (req, res) => {
  try {
    const leadId = req.params.leadId;
    
    if (!mongoose.Types.ObjectId.isValid(leadId)) {
      return res.status(400).json({ 
        success: false, 
        error: {
          message: 'Invalid lead ID format'
        }
      });
    }
    
    const lead = await Lead.findById(leadId);
    
    if (!lead) {
      return res.status(404).json({ 
        success: false, 
        error: {
          message: 'Lead not found'
        }
      });
    }
    
    // Check if the lead belongs to the current user
    if (lead.user.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        error: {
          message: 'Not authorized to access this lead'
        }
      });
    }
    
    // Check if document analysis has been performed
    if (!lead.documentAnalysis || !lead.documentAnalysis.textuallyAnalyzed) {
      return res.json({
        success: true,
        data: {
          message: 'No document analysis has been performed for this lead',
          motivationScore: 0,
          motivationFactors: []
        }
      });
    }
    
    // Combine motivation factors from financial situation and motivation keywords
    const financialFactors = (lead.documentAnalysis.financialSituation?.indicators || [])
      .map(indicator => ({
        type: 'financial',
        category: indicator.category,
        strength: indicator.strength,
        keywords: indicator.matches
      }));
    
    const motivationFactors = (lead.documentAnalysis.motivationKeywords || [])
      .map(term => ({
        type: 'motivation',
        category: term.category,
        strength: term.strength,
        keywords: term.matches
      }));
    
    const legalFactors = lead.documentAnalysis.legalStatus
      ? Object.entries(lead.documentAnalysis.legalStatus).map(([category, data]) => ({
          type: 'legal',
          category,
          strength: data.probability,
          keywords: data.matches
        }))
      : [];
    
    // Combine all factors and sort by strength
    const allFactors = [...financialFactors, ...motivationFactors, ...legalFactors]
      .sort((a, b) => b.strength - a.strength);
    
    return res.json({
      success: true,
      data: {
        motivationScore: lead.documentAnalysis.motivationScore || 0,
        motivationFactors: allFactors,
        sentiment: lead.documentAnalysis.documentSentiment,
        confidence: lead.documentAnalysis.confidence,
        analysisDate: lead.documentAnalysis.analysisDate
      }
    });
  } catch (error) {
    logger.error('Motivation factors API error:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Error retrieving motivation factors',
        details: error.message
      }
    });
  }
});

/**
 * Generate a summary of financial indicators
 * @param {Array} financialIndicators - Array of financial indicator objects
 * @returns {string} Summary text
 */
function generateFinancialSummary(financialIndicators) {
  if (!financialIndicators || financialIndicators.length === 0) {
    return 'No financial indicators detected.';
  }
  
  // Sort by strength
  const sortedIndicators = [...financialIndicators].sort((a, b) => b.strength - a.strength);
  
  // Map categories to readable names
  const categoryNames = {
    'distress': 'financial distress',
    'hardship': 'financial hardship',
    'urgency': 'urgency to sell'
  };
  
  // Generate summary text
  const topIndicator = sortedIndicators[0];
  const topCategory = categoryNames[topIndicator.category] || topIndicator.category;
  
  if (sortedIndicators.length === 1) {
    return `Documents indicate ${topCategory} with keywords: ${topIndicator.matches.join(', ')}.`;
  } else {
    const secondIndicator = sortedIndicators[1];
    const secondCategory = categoryNames[secondIndicator.category] || secondIndicator.category;
    
    return `Documents indicate ${topCategory} and ${secondCategory} with keywords: ${topIndicator.matches.concat(secondIndicator.matches).join(', ')}.`;
  }
}

module.exports = router; 