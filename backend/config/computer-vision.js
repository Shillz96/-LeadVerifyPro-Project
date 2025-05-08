/**
 * Computer Vision Configuration
 * Configuration settings for computer vision services used for property analysis
 */

const computerVisionConfig = {
  // The default provider to use
  provider: process.env.COMPUTER_VISION_PROVIDER || 'mock',
  
  // API configurations for different providers
  providers: {
    // FoxyAI configuration
    foxyai: {
      apiUrl: process.env.FOXYAI_API_URL || 'https://api.foxyai.com',
      apiKey: process.env.FOXYAI_API_KEY,
      version: 'v1',
      models: {
        propertyCondition: 'property_condition_v2',
        vacancy: 'vacancy_detection_v1',
        repairNeeds: 'repair_estimate_v2'
      }
    },
    
    // CAPE Analytics configuration
    cape: {
      apiUrl: process.env.CAPE_API_URL || 'https://api.capeanalytics.com',
      apiKey: process.env.CAPE_API_KEY,
      version: 'v1',
    },
    
    // Google Cloud Vision configuration
    google: {
      apiUrl: 'https://vision.googleapis.com',
      keyFilePath: process.env.GOOGLE_VISION_KEY_FILE,
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    },
    
    // Azure Computer Vision configuration
    azure: {
      apiUrl: process.env.AZURE_VISION_ENDPOINT,
      apiKey: process.env.AZURE_VISION_KEY,
      region: process.env.AZURE_VISION_REGION || 'eastus',
    },
    
    // Mock provider for development and testing
    mock: {
      simulateLatency: true,
      latencyMs: 1500,
      cacheTtl: 86400, // 24 hours
    }
  },
  
  // General settings
  cache: {
    enabled: process.env.CACHE_VISION_RESULTS !== 'false',
    ttl: parseInt(process.env.VISION_CACHE_TTL || '86400', 10), // Default 24 hours
  },
  
  // Image acquisition settings
  imageAcquisition: {
    sources: [
      {
        name: 'county_records',
        enabled: true,
        priority: 1,
      },
      {
        name: 'mls',
        enabled: true,
        priority: 2,
      },
      {
        name: 'street_view',
        enabled: process.env.USE_STREET_VIEW !== 'false',
        priority: 3,
        apiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
      {
        name: 'user_uploads',
        enabled: true,
        priority: 0, // Highest priority
      }
    ],
    maxImages: parseInt(process.env.MAX_PROPERTY_IMAGES || '5', 10),
  }
};

module.exports = computerVisionConfig; 