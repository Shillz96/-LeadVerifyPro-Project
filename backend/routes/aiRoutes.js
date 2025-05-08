/**
 * AI Routes
 * Endpoints for artificial intelligence features such as computer vision, NLP, and ML scoring
 */
const express = require('express');
const router = express.Router();
const computerVisionService = require('../services/computerVisionService');
const documentAnalysisService = require('../services/documentAnalysisService');
const geoSpatialAnalyticsService = require('../services/geoSpatialAnalyticsService');
const scoringService = require('../utils/scoringService');
const Lead = require('../models/Lead');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');
const { NotFoundError, BadRequestError } = require('../utils/errors');

/**
 * @route   POST /api/ai/computer-vision/analyze
 * @desc    Analyze property images using computer vision
 * @access  Private
 */
router.post('/computer-vision/analyze', auth, async (req, res, next) => {
  try {
    const { images, propertyAddress, options } = req.body;
    
    if (!images || !Array.isArray(images) || images.length === 0) {
      throw new BadRequestError('At least one image URL must be provided');
    }
    
    logger.info(`Analyzing ${images.length} images for property ${propertyAddress || 'unknown'}`);
    const visionResults = await computerVisionService.analyzeImages(images, options || {});
    
    res.status(200).json({
      success: true,
      data: visionResults
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/ai/computer-vision/condition/:propertyId
 * @desc    Get property condition assessment
 * @access  Private
 */
router.get('/computer-vision/condition/:propertyId', auth, async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const { forceRefresh } = req.query;
    
    // Find the lead by property ID
    const lead = await Lead.findById(propertyId);
    if (!lead) {
      throw new NotFoundError(`Property with ID ${propertyId} not found`);
    }
    
    // Check authorization
    if (lead.user.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        error: {
          message: 'Not authorized to access this property'
        }
      });
    }
    
    // Get property images
    const address = lead.address;
    const images = await computerVisionService.getPropertyImages(address);
    
    if (images.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: {
          message: 'No images found for this property'
        }
      });
    }
    
    // Analyze the images
    const visionResults = await computerVisionService.analyzeImages(images, {
      forceRefresh: forceRefresh === 'true'
    });
    
    // Update the lead with condition data
    lead.propertyCondition = {
      condition: visionResults.condition,
      vacancyIndicators: visionResults.vacancyIndicators,
      repairNeeds: visionResults.repairNeeds,
      improvementPotential: visionResults.improvementPotential,
      imageUrls: images,
      analysisDate: new Date(),
      visuallyVerified: true
    };
    
    await lead.save();
    
    res.status(200).json({
      success: true,
      data: {
        propertyId,
        address,
        condition: visionResults.condition,
        vacancyIndicators: visionResults.vacancyIndicators,
        repairNeeds: visionResults.repairNeeds,
        improvementPotential: visionResults.improvementPotential
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/ai/nlp/analyze-documents/:propertyId
 * @desc    Analyze property documents using NLP
 * @access  Private
 */
router.get('/nlp/analyze-documents/:propertyId', auth, async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const { forceRefresh } = req.query;
    
    // Find the lead by property ID
    const lead = await Lead.findById(propertyId);
    if (!lead) {
      throw new NotFoundError(`Property with ID ${propertyId} not found`);
    }
    
    // Check authorization
    if (lead.user.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        error: {
          message: 'Not authorized to access this property'
        }
      });
    }
    
    const countyId = lead.county;
    if (!countyId) {
      throw new BadRequestError('County information is required for document analysis');
    }
    
    // Get property documents
    const documentFetchService = require('../services/documentFetchService');
    const documents = await documentFetchService.getDocuments(propertyId, countyId);
    
    if (documents.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: {
          message: 'No documents found for this property'
        }
      });
    }
    
    // Analyze the documents
    const nlpResults = await documentAnalysisService.analyzeDocuments(documents, {
      forceRefresh: forceRefresh === 'true'
    });
    
    // Update the lead with NLP data
    lead.documentAnalysis = {
      legalStatus: nlpResults.legalStatus,
      financialSituation: nlpResults.financialIndicators,
      motivationKeywords: nlpResults.motivationTerms,
      documentSentiment: nlpResults.sentiment,
      analysisDate: new Date(),
      textuallyAnalyzed: true
    };
    
    await lead.save();
    
    res.status(200).json({
      success: true,
      data: {
        propertyId,
        legalStatus: nlpResults.legalStatus,
        financialIndicators: nlpResults.financialIndicators,
        motivationTerms: nlpResults.motivationTerms,
        sentiment: nlpResults.sentiment,
        legalIssuesProbability: nlpResults.legalIssuesProbability,
        motivationScore: nlpResults.motivationScore,
        documentCount: nlpResults.documentCount
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/ai/scoring/motivation/:leadId
 * @desc    Calculate motivation score for a lead using ML model
 * @access  Private
 */
router.get('/scoring/motivation/:leadId', auth, async (req, res, next) => {
  try {
    const { leadId } = req.params;
    
    // Find the lead
    const lead = await Lead.findById(leadId);
    if (!lead) {
      throw new NotFoundError(`Lead with ID ${leadId} not found`);
    }
    
    // Check authorization
    if (lead.user.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        error: {
          message: 'Not authorized to access this lead'
        }
      });
    }
    
    // Get property information from the lead
    const propertyInfo = {
      yearBuilt: lead.propertyDetails?.yearBuilt,
      estimatedValue: lead.propertyDetails?.estimatedValue,
      address: lead.address,
      ownerAddress: lead.ownerAddress,
      ownershipHistory: lead.propertyDetails?.ownershipHistory || []
    };
    
    // Get visual features if available
    const visionResults = lead.propertyCondition || {
      conditionScore: 50,
      vacancyProbability: 0
    };
    
    // Get geospatial features if available
    let spatialContext = { marketTrendScore: 50, proximityScores: {} };
    if (lead.location?.coordinates) {
      try {
        spatialContext = await geoSpatialAnalyticsService.analyze({
          coordinates: [
            lead.location.coordinates[0],
            lead.location.coordinates[1]
          ],
          radius: 1
        });
      } catch (error) {
        logger.error(`Error getting geospatial data for lead ${leadId}:`, error);
      }
    }
    
    // Get NLP features if available
    const nlpResults = lead.documentAnalysis || {
      legalIssuesProbability: 0,
      motivationScore: 50
    };
    
    // Calculate equity if possible
    const calculateEquity = (info) => {
      if (!info.estimatedValue || !info.mortgageAmount) return null;
      return info.estimatedValue - info.mortgageAmount;
    };
    
    // Calculate ownership length
    const calculateOwnershipLength = (history) => {
      if (!history || history.length === 0) return null;
      const latestOwnership = history[0];
      return (new Date() - new Date(latestOwnership.purchaseDate)) / (1000 * 60 * 60 * 24 * 365);
    };
    
    // Check if owner address is out of state
    const isOutOfStateOwner = (ownerAddr, propertyAddr) => {
      if (!ownerAddr || !propertyAddr) return false;
      
      const ownerState = ownerAddr.split(',').pop()?.trim().substring(0, 2);
      const propertyState = propertyAddr.split(',').pop()?.trim().substring(0, 2);
      
      return ownerState !== propertyState;
    };
    
    // Gather all features for ML model
    const features = {
      // Property features
      propertyAge: propertyInfo.yearBuilt ? (new Date().getFullYear() - propertyInfo.yearBuilt) : null,
      propertyValue: propertyInfo.estimatedValue,
      equity: calculateEquity(propertyInfo),
      
      // Owner features
      ownershipLength: calculateOwnershipLength(propertyInfo.ownershipHistory),
      outOfStateOwner: isOutOfStateOwner(propertyInfo.ownerAddress, propertyInfo.address),
      
      // Visual features from computer vision
      propertyCondition: visionResults.condition?.score || 50,
      vacancySigns: visionResults.vacancyIndicators?.probability || 0,
      
      // Geospatial features
      neighborhoodTrend: spatialContext.marketTrend?.score || 50,
      proximityScores: spatialContext.proximityAnalysis?.overallScore || 50,
      
      // NLP features
      legalIssues: nlpResults.legalIssuesProbability || 0,
      motivationLanguage: nlpResults.motivationScore || 50
    };
    
    // Create a mock ML service since we don't have a real ML model yet
    // In a real implementation, this would call the ML service
    const mlScoringService = {
      predictMotivationScore: async (features) => {
        // Simple weighted algorithm as a placeholder for ML prediction
        let score = 50; // Default score
        let totalWeight = 0;
        
        if (features.propertyAge !== null) {
          // Older properties might have more motivated sellers
          const ageScore = Math.min(100, features.propertyAge * 2);
          score += ageScore * 0.05;
          totalWeight += 0.05;
        }
        
        if (features.outOfStateOwner) {
          // Out of state owners tend to be more motivated
          score += 15;
          totalWeight += 0.15;
        }
        
        if (features.propertyCondition !== null) {
          // Poor condition properties indicate higher motivation
          const conditionWeight = 0.2;
          score += (100 - features.propertyCondition) * conditionWeight;
          totalWeight += conditionWeight;
        }
        
        if (features.legalIssues > 0) {
          // Legal issues strongly indicate motivation
          score += features.legalIssues * 30;
          totalWeight += 0.3;
        }
        
        if (features.motivationLanguage > 0) {
          // Direct motivation language in documents
          score += features.motivationLanguage * 0.25;
          totalWeight += 0.25;
        }
        
        // Normalize score
        return totalWeight > 0 ? Math.min(100, Math.max(0, score / totalWeight)) : 50;
      },
      
      getFeatureImportance: async (features) => {
        // Mock feature importance calculation
        return [
          { name: "Legal Issues", importance: 0.30, impact: features.legalIssues > 30 ? "positive" : "neutral" },
          { name: "Property Condition", importance: 0.20, impact: features.propertyCondition < 50 ? "positive" : "neutral" },
          { name: "Out of State Owner", importance: 0.15, impact: features.outOfStateOwner ? "positive" : "neutral" },
          { name: "Motivation Language", importance: 0.25, impact: features.motivationLanguage > 60 ? "positive" : "neutral" },
          { name: "Property Age", importance: 0.10, impact: (features.propertyAge || 0) > 30 ? "positive" : "neutral" }
        ];
      },
      
      getConfidenceInterval: (features) => {
        // Mock confidence interval calculation
        // The more complete our data, the higher our confidence
        let confidenceScore = 0.5; // Base confidence
        
        // Add confidence for each feature that exists
        const keyFeatures = ["propertyAge", "propertyCondition", "legalIssues", "ownershipLength"];
        for (const feature of keyFeatures) {
          if (features[feature] !== null && features[feature] !== undefined) {
            confidenceScore += 0.1;
          }
        }
        
        return Math.min(0.95, confidenceScore);
      }
    };
    
    // Get score and feature importance from ML model
    const score = await mlScoringService.predictMotivationScore(features);
    const motivationFactors = await mlScoringService.getFeatureImportance(features);
    const confidenceInterval = mlScoringService.getConfidenceInterval(features);
    
    // Update the lead with the motivation score
    lead.motivationScore = {
      score,
      motivationFactors,
      confidenceInterval,
      calculationDate: new Date(),
      features
    };
    
    await lead.save();
    
    res.status(200).json({
      success: true,
      data: {
        leadId,
        score,
        motivationFactors,
        confidenceInterval,
        features
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/ai/scoring/investment/:propertyId
 * @desc    Calculate investment potential score for a property
 * @access  Private
 */
router.get('/scoring/investment/:propertyId', auth, async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    
    // Find the lead by property ID
    const lead = await Lead.findById(propertyId);
    if (!lead) {
      throw new NotFoundError(`Property with ID ${propertyId} not found`);
    }
    
    // Check authorization
    if (lead.user.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        error: {
          message: 'Not authorized to access this property'
        }
      });
    }
    
    // Get geospatial data for opportunity score
    let opportunityScore = 50;
    let spatialContext = null;
    
    if (lead.location?.coordinates) {
      try {
        spatialContext = await geoSpatialAnalyticsService.analyze({
          coordinates: [
            lead.location.coordinates[0], 
            lead.location.coordinates[1]
          ],
          radius: 1,
          includeFactors: ['amenities', 'schools', 'transit', 'crime', 'development', 'property_values']
        });
        
        opportunityScore = spatialContext.opportunityScore;
      } catch (error) {
        logger.error(`Error getting geospatial opportunity score for property ${propertyId}:`, error);
      }
    }
    
    // Calculate investment score components
    const arv = lead.propertyDetails?.afterRepairValue || 0;
    const purchasePrice = lead.propertyDetails?.estimatedValue || 0;
    const repairCost = lead.propertyCondition?.repairNeeds?.reduce((total, repair) => {
      return total + (repair.cost || 0);
    }, 0) || 0;
    
    // Calculate potential return metrics
    const investmentMetrics = {
      potentialEquity: arv - (purchasePrice + repairCost),
      roi: (arv > 0 && (purchasePrice + repairCost) > 0) 
        ? ((arv - (purchasePrice + repairCost)) / (purchasePrice + repairCost)) * 100 
        : 0,
      cashOnCashReturn: 12, // Placeholder - would calculate based on rental data
      capRate: 8.5, // Placeholder - would calculate based on NOI and purchase price
      neighborhood: spatialContext?.marketTrend || { direction: "stable", score: 50 }
    };
    
    // Update the lead with investment score data
    lead.investmentScore = {
      opportunityScore,
      investmentMetrics,
      analysisDate: new Date()
    };
    
    await lead.save();
    
    res.status(200).json({
      success: true,
      data: {
        propertyId,
        opportunityScore,
        investmentMetrics,
        neighborhoodFactors: spatialContext ? {
          schools: spatialContext.schoolsAnalysis,
          amenities: spatialContext.proximityAnalysis,
          crimeRate: spatialContext.crimeAnalysis,
          propertyValues: spatialContext.propertyValuesAnalysis
        } : {}
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 