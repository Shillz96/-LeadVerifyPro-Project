/**
 * Geospatial Analytics Routes
 * 
 * API routes for accessing the Geospatial Analytics Engine functionality.
 * These endpoints provide location-based insights for properties.
 */

const express = require('express');
const router = express.Router();
const geoSpatialAnalyticsService = require('../services/geoSpatialAnalyticsService');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');
const { NotFoundError, BadRequestError } = require('../utils/errors');

/**
 * @route   GET /api/geospatial/analyze
 * @desc    Analyze a location based on coordinates or address
 * @access  Private
 */
router.get('/analyze', auth, async (req, res, next) => {
  try {
    const { address, lat, lon, radius, includeFactors } = req.query;
    
    // Validate required parameters
    if (!address && (!lat || !lon)) {
      throw new BadRequestError('Either address or coordinates (lat & lon) must be provided');
    }
    
    // Convert coordinates if they were provided as strings
    let coordinates;
    if (lat && lon) {
      coordinates = [parseFloat(lon), parseFloat(lat)];
    }
    
    // If address is provided but no coordinates, geocode the address
    if (address && !coordinates) {
      coordinates = await geoSpatialAnalyticsService.geocode(address);
    }
    
    // Parse radius if provided
    const parsedRadius = radius ? parseFloat(radius) : 1;
    
    // Parse includeFactors if provided
    const factors = includeFactors ? includeFactors.split(',') : [];
    
    // Perform the analysis
    const analysisResults = await geoSpatialAnalyticsService.analyze({
      coordinates,
      radius: parsedRadius,
      includeFactors: factors
    });
    
    // Return success response
    res.status(200).json({
      success: true,
      data: analysisResults
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/geospatial/neighborhood-trends/:propertyId
 * @desc    Get neighborhood trends for a specific property
 * @access  Private
 */
router.get('/neighborhood-trends/:propertyId', auth, async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const { radius } = req.query;
    
    // Get property from database first
    // This is a placeholder - you would fetch property data from your database
    const property = await getPropertyById(propertyId);
    
    if (!property) {
      throw new NotFoundError(`Property with ID ${propertyId} not found`);
    }
    
    // Extract property coordinates
    const coordinates = [property.longitude, property.latitude];
    
    // Parse radius if provided
    const parsedRadius = radius ? parseFloat(radius) : 1;
    
    // Focus only on factors relevant to neighborhood trends
    const includeFactors = ['development', 'property_values', 'crime'];
    
    // Perform the analysis
    const analysisResults = await geoSpatialAnalyticsService.analyze({
      coordinates,
      radius: parsedRadius,
      includeFactors
    });
    
    // Return focused neighborhood trend data
    res.status(200).json({
      success: true,
      data: {
        propertyId,
        address: property.address,
        coordinates,
        marketTrend: analysisResults.marketTrend,
        developmentAnalysis: analysisResults.developmentAnalysis,
        propertyValuesAnalysis: analysisResults.propertyValuesAnalysis,
        crimeAnalysis: analysisResults.crimeAnalysis,
        analysisDate: analysisResults.analysisDate
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/geospatial/proximity/:propertyId
 * @desc    Get proximity analysis for a specific property
 * @access  Private
 */
router.get('/proximity/:propertyId', auth, async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const { radius } = req.query;
    
    // Get property from database first
    // This is a placeholder - you would fetch property data from your database
    const property = await getPropertyById(propertyId);
    
    if (!property) {
      throw new NotFoundError(`Property with ID ${propertyId} not found`);
    }
    
    // Extract property coordinates
    const coordinates = [property.longitude, property.latitude];
    
    // Parse radius if provided
    const parsedRadius = radius ? parseFloat(radius) : 1;
    
    // Focus only on proximity-related factors
    const includeFactors = ['amenities', 'schools', 'transit'];
    
    // Perform the analysis
    const analysisResults = await geoSpatialAnalyticsService.analyze({
      coordinates,
      radius: parsedRadius,
      includeFactors
    });
    
    // Return focused proximity data
    res.status(200).json({
      success: true,
      data: {
        propertyId,
        address: property.address,
        coordinates,
        proximityAnalysis: analysisResults.proximityAnalysis,
        schoolsAnalysis: analysisResults.schoolsAnalysis,
        transitAnalysis: analysisResults.transitAnalysis,
        analysisDate: analysisResults.analysisDate
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/geospatial/opportunity-score/:propertyId
 * @desc    Get investment opportunity score for a specific property
 * @access  Private
 */
router.get('/opportunity-score/:propertyId', auth, async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    
    // Get property from database first
    // This is a placeholder - you would fetch property data from your database
    const property = await getPropertyById(propertyId);
    
    if (!property) {
      throw new NotFoundError(`Property with ID ${propertyId} not found`);
    }
    
    // Extract property coordinates
    const coordinates = [property.longitude, property.latitude];
    
    // Perform the full analysis to get the most accurate opportunity score
    const analysisResults = await geoSpatialAnalyticsService.analyze({
      coordinates,
      radius: 1 // Use default radius for opportunity score
    });
    
    // Return opportunity score with supporting data
    res.status(200).json({
      success: true,
      data: {
        propertyId,
        address: property.address,
        coordinates,
        opportunityScore: analysisResults.opportunityScore,
        marketTrend: analysisResults.marketTrend,
        analysisDate: analysisResults.analysisDate
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Placeholder function to get property by ID
 * This would be replaced with your actual database query
 * @param {String} propertyId - Property ID to retrieve
 * @returns {Promise<Object>} Property object
 */
async function getPropertyById(propertyId) {
  // This is a mock implementation - replace with actual database query
  // For example:
  // return await Property.findById(propertyId);
  
  // Mock property data for testing
  return {
    id: propertyId,
    address: '123 Main St, Houston, TX 77002',
    latitude: 29.7604,
    longitude: -95.3698,
    county: 'Harris',
    zipCode: '77002'
  };
}

module.exports = router; 