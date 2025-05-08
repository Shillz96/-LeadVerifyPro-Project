/**
 * Central configuration index file
 * Exports all configuration modules for easy import
 */

const env = require('./env');
const database = require('./database');
const geoSpatialConfig = require('./geoSpatialConfig');

// Default configuration for external services
const defaultExternalConfig = {
  mapbox: {
    apiKey: process.env.MAPBOX_API_KEY || ''
  },
  census: {
    apiKey: process.env.CENSUS_API_KEY || ''
  },
  osrm: {
    endpoint: process.env.OSRM_ENDPOINT || 'https://router.project-osrm.org'
  },
  zillow: {
    apiKey: process.env.ZILLOW_API_KEY || ''
  }
};

// Combine all configurations
const config = {
  ...env,
  db: database,
  geoSpatial: geoSpatialConfig,
  
  // External service credentials
  mapbox: defaultExternalConfig.mapbox,
  census: defaultExternalConfig.census,
  osrm: defaultExternalConfig.osrm,
  zillow: defaultExternalConfig.zillow
};

module.exports = config; 