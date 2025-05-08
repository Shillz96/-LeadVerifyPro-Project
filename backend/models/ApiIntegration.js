/**
 * ApiIntegration Model
 * Defines the schema for third-party API integrations data in MongoDB
 */
const mongoose = require('mongoose');

// Define ApiIntegration Schema
const apiIntegrationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  provider: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['phoneVerification', 'addressVerification', 'propertyData', 'skipTracing', 'other'],
    required: true
  },
  apiKey: {
    type: String,
    required: true
  },
  baseUrl: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  rateLimits: {
    requestsPerSecond: {
      type: Number,
      default: 10
    },
    requestsPerDay: {
      type: Number,
      default: 1000
    }
  },
  usageStats: {
    callsToday: {
      type: Number,
      default: 0
    },
    totalCalls: {
      type: Number,
      default: 0
    },
    lastReset: {
      type: Date,
      default: Date.now
    },
    lastCall: Date
  },
  settings: {
    timeout: {
      type: Number,
      default: 5000 // ms
    },
    retryAttempts: {
      type: Number,
      default: 3
    },
    headers: {
      type: Object,
      default: {}
    }
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Method to check if rate limit has been exceeded
apiIntegrationSchema.methods.isRateLimited = function() {
  const currentDate = new Date();
  const lastReset = new Date(this.usageStats.lastReset);
  
  // Check if a day has passed since the last reset
  if (currentDate.getDate() !== lastReset.getDate() || 
      currentDate.getMonth() !== lastReset.getMonth() || 
      currentDate.getFullYear() !== lastReset.getFullYear()) {
    // Reset daily counter
    this.usageStats.callsToday = 0;
    this.usageStats.lastReset = currentDate;
  }
  
  return this.usageStats.callsToday >= this.rateLimits.requestsPerDay;
};

// Method to increment API call counters
apiIntegrationSchema.methods.logApiCall = async function() {
  this.usageStats.callsToday += 1;
  this.usageStats.totalCalls += 1;
  this.usageStats.lastCall = new Date();
  return this.save();
};

// Create and export the ApiIntegration model
const ApiIntegration = mongoose.model('ApiIntegration', apiIntegrationSchema);

module.exports = ApiIntegration; 