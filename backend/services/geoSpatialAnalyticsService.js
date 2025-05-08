/**
 * GeoSpatial Analytics Service
 * 
 * Provides advanced geospatial analysis capabilities for property location assessment,
 * neighborhood trend detection, and proximity analysis to amenities and other factors
 * that affect property values and investment potential.
 */

const axios = require('axios');
const turf = require('@turf/turf');
const config = require('../config');
const logger = require('../utils/logger');
const cache = require('../utils/cache');

// Cache TTL in seconds - 24 hours
const CACHE_TTL = 86400;

class GeoSpatialAnalyticsService {
  constructor() {
    // Initialize external APIs based on configuration
    this.mapboxApiKey = config.mapbox.apiKey;
    this.censusApiKey = config.census.apiKey;
    this.osrmEndpoint = config.osrm.endpoint || 'https://router.project-osrm.org';
    this.zillow = config.zillow;
    
    // Define amenity types for proximity analysis
    this.amenityTypes = [
      'school', 'hospital', 'park', 'grocery', 'restaurant', 
      'shopping_mall', 'transit_station', 'police', 'fire_station'
    ];
  }

  /**
   * Main analysis function that coordinates all geospatial analysis tasks
   * @param {Object} options - Analysis options
   * @param {Array} options.coordinates - [longitude, latitude] coordinates
   * @param {Number} options.radius - Radius in miles for the analysis (default: 1)
   * @param {Array} options.includeFactors - Factors to include in the analysis
   * @returns {Promise<Object>} Comprehensive spatial context object
   */
  async analyze(options) {
    try {
      const { coordinates, radius = 1, includeFactors = [] } = options;
      const cacheKey = `geo_analysis:${coordinates.join(',')}:${radius}:${includeFactors.join(',')}`;
      
      // Check cache first
      const cachedResult = await cache.get(cacheKey);
      if (cachedResult) {
        logger.debug(`Returning cached geospatial analysis for ${coordinates}`);
        return JSON.parse(cachedResult);
      }
      
      logger.info(`Performing geospatial analysis for coordinates: ${coordinates}, radius: ${radius}mi`);
      
      // Convert radius from miles to meters for calculations
      const radiusInMeters = radius * 1609.34;
      
      // Run parallel analysis tasks based on requested factors
      const tasks = [];
      const allFactors = new Set(includeFactors.length ? includeFactors : [
        'amenities', 'schools', 'transit', 'crime', 'development', 'property_values'
      ]);
      
      if (allFactors.has('amenities')) {
        tasks.push(this.analyzeProximity(coordinates, radiusInMeters));
      }
      
      if (allFactors.has('schools')) {
        tasks.push(this.analyzeSchools(coordinates, radiusInMeters));
      }
      
      if (allFactors.has('transit')) {
        tasks.push(this.analyzeTransit(coordinates, radiusInMeters));
      }
      
      if (allFactors.has('crime')) {
        tasks.push(this.analyzeCrime(coordinates, radiusInMeters));
      }
      
      if (allFactors.has('development')) {
        tasks.push(this.analyzeDevelopment(coordinates, radiusInMeters));
      }
      
      if (allFactors.has('property_values')) {
        tasks.push(this.analyzePropertyValues(coordinates, radiusInMeters));
      }
      
      const [
        proximityData = {},
        schoolsData = {},
        transitData = {},
        crimeData = {},
        developmentData = {},
        propertyValuesData = {}
      ] = await Promise.all(tasks);
      
      // Calculate neighborhood trend score based on all factors
      const neighborhoodTrend = this.calculateNeighborhoodTrend({
        proximityData,
        schoolsData,
        transitData,
        crimeData,
        developmentData,
        propertyValuesData
      });
      
      // Calculate investment opportunity score
      const opportunityScore = this.calculateOpportunityScore({
        neighborhoodTrend,
        proximityData,
        schoolsData,
        transitData,
        crimeData,
        developmentData,
        propertyValuesData
      });
      
      // Compile the complete spatial context
      const spatialContext = {
        coordinates,
        radius,
        marketTrend: neighborhoodTrend,
        opportunityScore,
        proximityAnalysis: proximityData,
        schoolsAnalysis: schoolsData,
        transitAnalysis: transitData,
        crimeAnalysis: crimeData,
        developmentAnalysis: developmentData,
        propertyValuesAnalysis: propertyValuesData,
        analysisDate: new Date().toISOString()
      };
      
      // Cache the result
      await cache.set(cacheKey, JSON.stringify(spatialContext), CACHE_TTL);
      
      return spatialContext;
    } catch (error) {
      logger.error('Geospatial analysis failed:', error);
      throw new Error(`Geospatial analysis failed: ${error.message}`);
    }
  }
  
  /**
   * Analyzes proximity to important amenities
   * @param {Array} coordinates - [longitude, latitude] coordinates
   * @param {Number} radius - Radius in meters
   * @returns {Promise<Object>} Proximity analysis results
   */
  async analyzeProximity(coordinates, radius) {
    try {
      // Use Overpass API for OSM data or Mapbox API if configured
      const amenities = await this.fetchNearbyAmenities(coordinates, radius);
      
      // Calculate distances to each amenity type
      const proximityScores = {};
      const amenityCounts = {};
      
      for (const amenity of amenities) {
        const type = amenity.type;
        const distance = turf.distance(
          turf.point(coordinates),
          turf.point([amenity.lon, amenity.lat]),
          { units: 'meters' }
        );
        
        if (!proximityScores[type]) {
          proximityScores[type] = Infinity;
          amenityCounts[type] = 0;
        }
        
        // Track the closest distance to each amenity type
        proximityScores[type] = Math.min(proximityScores[type], distance);
        amenityCounts[type]++;
      }
      
      // Convert raw distances to scores (1-100, higher is better)
      const scoredProximity = {};
      for (const type in proximityScores) {
        // Different scoring weights for different amenity types
        const maxIdealDistance = this.getIdealMaxDistance(type);
        const rawScore = Math.max(0, 100 - (100 * proximityScores[type] / maxIdealDistance));
        scoredProximity[type] = {
          score: Math.round(rawScore),
          distance: Math.round(proximityScores[type]),
          count: amenityCounts[type]
        };
      }
      
      // Calculate overall proximity score (weighted average)
      const weights = {
        school: 0.25,
        grocery: 0.2,
        park: 0.15,
        restaurant: 0.1,
        transit_station: 0.1,
        hospital: 0.1,
        shopping_mall: 0.05,
        police: 0.025,
        fire_station: 0.025
      };
      
      let weightedScore = 0;
      let totalWeight = 0;
      
      for (const type in scoredProximity) {
        const weight = weights[type] || 0.05;
        weightedScore += scoredProximity[type].score * weight;
        totalWeight += weight;
      }
      
      const overallProximityScore = totalWeight > 0 
        ? Math.round(weightedScore / totalWeight) 
        : 50; // Default score if no data
      
      return {
        overallScore: overallProximityScore,
        amenities: scoredProximity,
        amenityCount: amenities.length,
        walkscore: await this.estimateWalkScore(coordinates, scoredProximity)
      };
    } catch (error) {
      logger.error('Proximity analysis failed:', error);
      return {
        overallScore: 50, // Default score
        amenities: {},
        amenityCount: 0,
        walkscore: 50
      };
    }
  }
  
  /**
   * Get ideal maximum distance for a given amenity type
   * @param {String} type - Amenity type
   * @returns {Number} Distance in meters
   */
  getIdealMaxDistance(type) {
    const distances = {
      grocery: 1000,        // 1km
      school: 1500,         // 1.5km
      park: 800,            // 800m
      restaurant: 800,      // 800m
      transit_station: 500, // 500m
      hospital: 3000,       // 3km
      shopping_mall: 2000,  // 2km
      police: 3000,         // 3km
      fire_station: 3000    // 3km
    };
    
    return distances[type] || 1000;
  }
  
  /**
   * Fetch nearby amenities using OSM or Mapbox
   * @param {Array} coordinates - [longitude, latitude] coordinates
   * @param {Number} radius - Radius in meters
   * @returns {Promise<Array>} List of amenities
   */
  async fetchNearbyAmenities(coordinates, radius) {
    if (this.mapboxApiKey) {
      return this.fetchNearbyAmenitiesMapbox(coordinates, radius);
    } else {
      return this.fetchNearbyAmenitiesOSM(coordinates, radius);
    }
  }
  
  /**
   * Fetch nearby amenities using OSM Overpass API
   * @param {Array} coordinates - [longitude, latitude] coordinates
   * @param {Number} radius - Radius in meters
   * @returns {Promise<Array>} List of amenities
   */
  async fetchNearbyAmenitiesOSM(coordinates, radius) {
    try {
      const [lon, lat] = coordinates;
      const radiusKm = radius / 1000;
      
      const query = `
        [out:json];
        (
          node["amenity"](around:${radiusKm * 1000},${lat},${lon});
          node["shop"](around:${radiusKm * 1000},${lat},${lon});
          node["leisure"](around:${radiusKm * 1000},${lat},${lon});
          node["education"](around:${radiusKm * 1000},${lat},${lon});
        );
        out body;
      `;
      
      const response = await axios.post('https://overpass-api.de/api/interpreter', query);
      
      return response.data.elements.map(element => {
        let type = 'other';
        
        if (element.tags.amenity === 'school' || element.tags.education) {
          type = 'school';
        } else if (element.tags.amenity === 'hospital') {
          type = 'hospital';
        } else if (element.tags.leisure === 'park') {
          type = 'park';
        } else if (element.tags.shop === 'supermarket' || element.tags.shop === 'convenience') {
          type = 'grocery';
        } else if (element.tags.amenity === 'restaurant') {
          type = 'restaurant';
        } else if (element.tags.shop === 'mall') {
          type = 'shopping_mall';
        } else if (element.tags.amenity === 'bus_station' || element.tags.public_transport) {
          type = 'transit_station';
        } else if (element.tags.amenity === 'police') {
          type = 'police';
        } else if (element.tags.amenity === 'fire_station') {
          type = 'fire_station';
        }
        
        return {
          id: element.id,
          type,
          name: element.tags.name,
          lat: element.lat,
          lon: element.lon
        };
      });
    } catch (error) {
      logger.error('OSM amenity fetch failed:', error);
      return [];
    }
  }
  
  /**
   * Fetch nearby amenities using Mapbox Places API
   * @param {Array} coordinates - [longitude, latitude] coordinates
   * @param {Number} radius - Radius in meters
   * @returns {Promise<Array>} List of amenities
   */
  async fetchNearbyAmenitiesMapbox(coordinates, radius) {
    const amenities = [];
    const [lon, lat] = coordinates;
    
    try {
      // Mapbox requires separate requests for each category
      for (const type of this.amenityTypes) {
        const mapboxType = this.mapAmenityTypeToMapbox(type);
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${mapboxType}.json?limit=10&proximity=${lon},${lat}&access_token=${this.mapboxApiKey}`;
        
        const response = await axios.get(url);
        
        for (const feature of response.data.features) {
          const [featureLon, featureLat] = feature.center;
          
          const distance = turf.distance(
            turf.point([lon, lat]),
            turf.point([featureLon, featureLat]),
            { units: 'meters' }
          );
          
          if (distance <= radius) {
            amenities.push({
              id: feature.id,
              type,
              name: feature.text,
              lat: featureLat,
              lon: featureLon
            });
          }
        }
      }
      
      return amenities;
    } catch (error) {
      logger.error('Mapbox amenity fetch failed:', error);
      return [];
    }
  }
  
  /**
   * Map internal amenity type to Mapbox category
   * @param {String} type - Internal amenity type
   * @returns {String} Mapbox category
   */
  mapAmenityTypeToMapbox(type) {
    const mapping = {
      school: 'school',
      hospital: 'hospital',
      park: 'park',
      grocery: 'supermarket',
      restaurant: 'restaurant',
      shopping_mall: 'mall',
      transit_station: 'bus station',
      police: 'police',
      fire_station: 'fire station'
    };
    
    return mapping[type] || type;
  }
  
  /**
   * Estimates a WalkScore-like metric based on amenity proximity
   * @param {Array} coordinates - [longitude, latitude] coordinates
   * @param {Object} proximityScores - Proximity scores by amenity type
   * @returns {Promise<Number>} Estimated walk score (0-100)
   */
  async estimateWalkScore(coordinates, proximityScores) {
    // Weights for different amenity types in walk score calculation
    const weights = {
      grocery: 0.3,
      restaurant: 0.2,
      park: 0.15,
      school: 0.1,
      transit_station: 0.15,
      shopping_mall: 0.1
    };
    
    let score = 0;
    let totalWeight = 0;
    
    for (const type in proximityScores) {
      if (weights[type]) {
        score += proximityScores[type].score * weights[type];
        totalWeight += weights[type];
      }
    }
    
    // If we don't have enough data, try to get official walk score if API key is configured
    if (totalWeight < 0.5 && config.walkscore && config.walkscore.apiKey) {
      try {
        const [lon, lat] = coordinates;
        const response = await axios.get(`https://api.walkscore.com/score?format=json&lat=${lat}&lon=${lon}&transit=1&bike=1&wsapikey=${config.walkscore.apiKey}`);
        
        if (response.data && response.data.walkscore) {
          return response.data.walkscore;
        }
      } catch (error) {
        logger.error('WalkScore API fetch failed:', error);
      }
    }
    
    return totalWeight > 0 ? Math.round(score / totalWeight) : 50;
  }
  
  /**
   * Analyzes school quality in the area
   * @param {Array} coordinates - [longitude, latitude] coordinates
   * @param {Number} radius - Radius in meters
   * @returns {Promise<Object>} School analysis results
   */
  async analyzeSchools(coordinates, radius) {
    try {
      // This is a placeholder - would need to integrate with education data APIs
      // like GreatSchools or National Center for Education Statistics
      
      // Mock implementation for now
      return {
        averageRating: 7.5,
        schoolCount: 3,
        nearestSchools: [
          { name: "Washington Elementary", distance: 800, rating: 8 },
          { name: "Lincoln Middle School", distance: 1200, rating: 7 },
          { name: "Roosevelt High School", distance: 1500, rating: 8 }
        ]
      };
    } catch (error) {
      logger.error('School analysis failed:', error);
      return {
        averageRating: 5,
        schoolCount: 0,
        nearestSchools: []
      };
    }
  }
  
  /**
   * Analyzes transit options and quality
   * @param {Array} coordinates - [longitude, latitude] coordinates
   * @param {Number} radius - Radius in meters
   * @returns {Promise<Object>} Transit analysis results
   */
  async analyzeTransit(coordinates, radius) {
    try {
      // Mock implementation - would integrate with transit APIs
      return {
        transitScore: 65,
        nearestStations: [
          { type: "bus", name: "Main St & 5th", distance: 300 },
          { type: "subway", name: "Downtown Station", distance: 1200 }
        ],
        commuteTime: {
          downtown: 22, // minutes
          majorEmployers: 35 // minutes
        }
      };
    } catch (error) {
      logger.error('Transit analysis failed:', error);
      return {
        transitScore: 50,
        nearestStations: [],
        commuteTime: { downtown: 30, majorEmployers: 45 }
      };
    }
  }
  
  /**
   * Analyzes crime rates in the area
   * @param {Array} coordinates - [longitude, latitude] coordinates
   * @param {Number} radius - Radius in meters
   * @returns {Promise<Object>} Crime analysis results
   */
  async analyzeCrime(coordinates, radius) {
    try {
      // Mock implementation - would integrate with crime data APIs
      return {
        crimeScore: 72, // higher is safer
        relativeToCity: "safer",
        crimeTypes: {
          violent: "low",
          property: "moderate",
          other: "low"
        }
      };
    } catch (error) {
      logger.error('Crime analysis failed:', error);
      return {
        crimeScore: 50,
        relativeToCity: "average",
        crimeTypes: {
          violent: "average",
          property: "average",
          other: "average"
        }
      };
    }
  }
  
  /**
   * Analyzes development and construction in the area
   * @param {Array} coordinates - [longitude, latitude] coordinates
   * @param {Number} radius - Radius in meters
   * @returns {Promise<Object>} Development analysis results
   */
  async analyzeDevelopment(coordinates, radius) {
    try {
      // Mock implementation - would integrate with permit data APIs
      return {
        developmentScore: 68,
        permits: {
          residential: 12,
          commercial: 5,
          infrastructure: 3
        },
        growth: "moderate",
        investmentLevel: "increasing"
      };
    } catch (error) {
      logger.error('Development analysis failed:', error);
      return {
        developmentScore: 50,
        permits: { residential: 0, commercial: 0, infrastructure: 0 },
        growth: "stable",
        investmentLevel: "stable"
      };
    }
  }
  
  /**
   * Analyzes property values and trends in the area
   * @param {Array} coordinates - [longitude, latitude] coordinates
   * @param {Number} radius - Radius in meters
   * @returns {Promise<Object>} Property value analysis results
   */
  async analyzePropertyValues(coordinates, radius) {
    try {
      // This would integrate with real estate data APIs like Zillow or ATTOM
      const [lon, lat] = coordinates;
      
      // Mock implementation for now
      return {
        valueScore: 73,
        medianValue: 285000,
        valueChange: {
          oneYear: 5.2, // percentage
          threeYear: 18.7,
          fiveYear: 32.1
        },
        comparisons: {
          city: "above",
          county: "above",
          state: "above"
        },
        forecast: "increasing"
      };
    } catch (error) {
      logger.error('Property value analysis failed:', error);
      return {
        valueScore: 50,
        medianValue: 0,
        valueChange: { oneYear: 0, threeYear: 0, fiveYear: 0 },
        comparisons: { city: "average", county: "average", state: "average" },
        forecast: "stable"
      };
    }
  }
  
  /**
   * Calculates neighborhood trend score based on all factors
   * @param {Object} data - All analysis data
   * @returns {Object} Neighborhood trend information
   */
  calculateNeighborhoodTrend(data) {
    const {
      proximityData,
      schoolsData,
      transitData,
      crimeData,
      developmentData,
      propertyValuesData
    } = data;
    
    // Factor weights
    const weights = {
      proximity: 0.15,
      schools: 0.15,
      transit: 0.1,
      crime: 0.2,
      development: 0.2,
      propertyValues: 0.2
    };
    
    // Get scores from each analysis
    const scores = {
      proximity: proximityData?.overallScore || 50,
      schools: schoolsData?.averageRating * 10 || 50, // convert to 0-100
      transit: transitData?.transitScore || 50,
      crime: crimeData?.crimeScore || 50,
      development: developmentData?.developmentScore || 50,
      propertyValues: propertyValuesData?.valueScore || 50
    };
    
    // Calculate weighted score
    let weightedScore = 0;
    for (const factor in weights) {
      weightedScore += scores[factor] * weights[factor];
    }
    
    // Determine trend direction
    let trendDirection;
    if (developmentData?.investmentLevel === "increasing" && 
        propertyValuesData?.forecast === "increasing") {
      trendDirection = "strong_positive";
    } else if (developmentData?.investmentLevel === "increasing" || 
               propertyValuesData?.forecast === "increasing") {
      trendDirection = "positive";
    } else if (developmentData?.investmentLevel === "decreasing" && 
               propertyValuesData?.forecast === "decreasing") {
      trendDirection = "strong_negative";
    } else if (developmentData?.investmentLevel === "decreasing" || 
               propertyValuesData?.forecast === "decreasing") {
      trendDirection = "negative";
    } else {
      trendDirection = "stable";
    }
    
    return {
      score: Math.round(weightedScore),
      direction: trendDirection,
      factorScores: scores
    };
  }
  
  /**
   * Calculates investment opportunity score
   * @param {Object} data - All analysis data including neighborhood trend
   * @returns {Object} Opportunity score information
   */
  calculateOpportunityScore(data) {
    const { neighborhoodTrend } = data;
    
    // Basic implementation - this would be more sophisticated in production
    let opportunityScore = neighborhoodTrend.score;
    
    // Adjust for trend direction
    if (neighborhoodTrend.direction === "strong_positive") {
      opportunityScore += 15;
    } else if (neighborhoodTrend.direction === "positive") {
      opportunityScore += 10;
    } else if (neighborhoodTrend.direction === "negative") {
      opportunityScore -= 10;
    } else if (neighborhoodTrend.direction === "strong_negative") {
      opportunityScore -= 15;
    }
    
    // Cap at 0-100
    opportunityScore = Math.max(0, Math.min(100, opportunityScore));
    
    // Determine opportunity level
    let opportunityLevel;
    if (opportunityScore >= 85) {
      opportunityLevel = "excellent";
    } else if (opportunityScore >= 70) {
      opportunityLevel = "good";
    } else if (opportunityScore >= 50) {
      opportunityLevel = "moderate";
    } else if (opportunityScore >= 30) {
      opportunityLevel = "fair";
    } else {
      opportunityLevel = "poor";
    }
    
    return {
      score: Math.round(opportunityScore),
      level: opportunityLevel
    };
  }
  
  /**
   * Geocodes an address to coordinates
   * @param {String} address - Property address
   * @returns {Promise<Array>} [longitude, latitude] coordinates
   */
  async geocode(address) {
    try {
      if (this.mapboxApiKey) {
        // Use Mapbox geocoding
        const encodedAddress = encodeURIComponent(address);
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${this.mapboxApiKey}`;
        
        const response = await axios.get(url);
        
        if (response.data.features && response.data.features.length > 0) {
          return response.data.features[0].center; // [longitude, latitude]
        }
      } else {
        // Use OpenStreetMap Nominatim as fallback
        const encodedAddress = encodeURIComponent(address);
        const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`;
        
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'LeadVerifyPro/1.0'
          }
        });
        
        if (response.data && response.data.length > 0) {
          const result = response.data[0];
          return [parseFloat(result.lon), parseFloat(result.lat)];
        }
      }
      
      throw new Error('Geocoding failed');
    } catch (error) {
      logger.error('Geocoding failed:', error);
      throw new Error(`Geocoding failed: ${error.message}`);
    }
  }
}

module.exports = new GeoSpatialAnalyticsService(); 