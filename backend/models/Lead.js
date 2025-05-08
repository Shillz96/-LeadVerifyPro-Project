/**
 * Lead Model
 * Defines the schema for lead data in MongoDB
 */
const mongoose = require('mongoose');

// Define Lead Schema
const leadSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['new', 'verified', 'rejected', 'pending'],
    default: 'new'
  },
  score: {
    type: Number,
    default: 0
  },
  verificationResults: {
    type: Object,
    default: {}
  },
  // New computer vision fields for property condition assessment
  propertyCondition: {
    condition: {
      score: Number,
      rating: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor', 'very_poor']
      },
      confidence: Number
    },
    vacancyIndicators: {
      probability: {
        type: String,
        enum: ['low', 'medium', 'high']
      },
      confidence: Number,
      indicators: [String]
    },
    repairNeeds: {
      items: [String],
      estimatedCost: {
        min: Number,
        max: Number,
        currency: String
      },
      priorityLevel: {
        type: String,
        enum: ['low', 'medium', 'high']
      }
    },
    improvementPotential: {
      score: Number,
      roi: {
        low: Number,
        high: Number
      }
    },
    imageUrls: [String],
    analysisDate: Date,
    visuallyVerified: {
      type: Boolean,
      default: false
    }
  },
  // New document analysis fields for NLP insights
  documentAnalysis: {
    legalStatus: {
      type: Object,
      default: null
    },
    financialSituation: {
      indicators: [Object],
      summary: String
    },
    motivationKeywords: [Object],
    documentSentiment: Number,
    motivationScore: Number,
    legalIssuesProbability: Number,
    confidence: Number,
    documentCount: Number,
    documentTypes: [String],
    documentIds: [String],
    analysisDate: Date,
    textuallyAnalyzed: {
      type: Boolean,
      default: false
    }
  },
  source: {
    type: String,
    default: 'manual'
  },
  // Add reference to user who owns this lead
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// Add static method to find leads by user ID
leadSchema.statics.findByUserId = function(userId) {
  return this.find({ user: userId });
};

// Create and export the Lead model
const Lead = mongoose.model('Lead', leadSchema);

module.exports = Lead; 