/**
 * Geospatial Analytics Configuration
 * 
 * Configuration settings for the Geospatial Analytics Engine.
 * API keys and other sensitive information should be loaded from environment variables.
 */

const dotenv = require('dotenv');
dotenv.config();

const geoSpatialConfig = {
  // Mapbox configuration
  mapbox: {
    apiKey: process.env.MAPBOX_API_KEY,
    geocodingEndpoint: 'https://api.mapbox.com/geocoding/v5/mapbox.places',
  },
  
  // OpenStreetMap configuration
  osm: {
    overpassEndpoint: 'https://overpass-api.de/api/interpreter',
    nominatimEndpoint: 'https://nominatim.openstreetmap.org/search',
    userAgent: 'LeadVerifyPro/1.0',
  },
  
  // Census API configuration
  census: {
    apiKey: process.env.CENSUS_API_KEY,
    endpoint: 'https://api.census.gov/data',
  },
  
  // OSRM (Open Source Routing Machine) for transit calculations
  osrm: {
    endpoint: process.env.OSRM_ENDPOINT || 'https://router.project-osrm.org',
  },
  
  // Walkscore API configuration
  walkscore: {
    apiKey: process.env.WALKSCORE_API_KEY,
    endpoint: 'https://api.walkscore.com/score',
  },
  
  // Zillow API configuration
  zillow: {
    apiKey: process.env.ZILLOW_API_KEY,
    zestimateEndpoint: process.env.ZILLOW_ZESTIMATE_ENDPOINT,
  },
  
  // Crime data API configuration
  crime: {
    // Example: SpotCrime or CrimeReports API
    apiKey: process.env.CRIME_API_KEY,
    endpoint: process.env.CRIME_API_ENDPOINT,
  },
  
  // School data API configuration
  schools: {
    // Example: GreatSchools API
    apiKey: process.env.SCHOOLS_API_KEY,
    endpoint: process.env.SCHOOLS_API_ENDPOINT,
  },
  
  // Cache settings
  cache: {
    ttl: 86400, // 24 hours in seconds
    prefix: 'geo_spatial:', // Cache key prefix
  },
  
  // Analysis settings
  analysis: {
    defaultRadius: 1, // Default radius in miles
    maxRadius: 5, // Maximum radius in miles
    
    // Weights for different factors in neighborhood trend calculation
    factorWeights: {
      proximity: 0.15,
      schools: 0.15,
      transit: 0.1,
      crime: 0.2,
      development: 0.2,
      propertyValues: 0.2,
    },
    
    // Ideal maximum distances for amenity types (in meters)
    idealDistances: {
      grocery: 1000,        // 1km
      school: 1500,         // 1.5km
      park: 800,            // 800m
      restaurant: 800,      // 800m
      transit_station: 500, // 500m
      hospital: 3000,       // 3km
      shopping_mall: 2000,  // 2km
      police: 3000,         // 3km
      fire_station: 3000,   // 3km
    },
  },
};

module.exports = geoSpatialConfig; 