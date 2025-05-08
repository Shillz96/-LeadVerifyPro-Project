/**
 * Verification Model
 * Defines the schema for verification data in MongoDB
 */
const mongoose = require('mongoose');

// Define Verification Schema
const verificationSchema = new mongoose.Schema({
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
    required: true
  },
  phoneVerification: {
    status: {
      type: String,
      enum: ['pending', 'valid', 'invalid', 'unknown'],
      default: 'pending'
    },
    provider: String,
    verifiedAt: Date,
    details: {
      carrier: String,
      lineType: String,
      countryCode: String
    },
    confidence: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  addressVerification: {
    status: {
      type: String,
      enum: ['pending', 'valid', 'invalid', 'unknown'],
      default: 'pending'
    },
    provider: String,
    verifiedAt: Date,
    details: {
      standardizedAddress: String,
      zipCode: String,
      city: String,
      state: String,
      country: String
    },
    confidence: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  ownershipVerification: {
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'unconfirmed', 'unknown'],
      default: 'pending'
    },
    provider: String,
    verifiedAt: Date,
    details: {
      ownerName: String,
      matchConfidence: Number,
      ownershipStartDate: Date,
      propertyType: String
    },
    confidence: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
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

// Method to calculate overall verification score
verificationSchema.methods.calculateScore = function() {
  const phoneScore = this.phoneVerification.status === 'valid' ? this.phoneVerification.confidence : 0;
  const addressScore = this.addressVerification.status === 'valid' ? this.addressVerification.confidence : 0;
  const ownershipScore = this.ownershipVerification.status === 'confirmed' ? this.ownershipVerification.confidence : 0;
  
  // Weight the scores (can be adjusted as needed)
  const weightedScore = (phoneScore * 0.3) + (addressScore * 0.3) + (ownershipScore * 0.4);
  return Math.round(weightedScore);
};

// Create and export the Verification model
const Verification = mongoose.model('Verification', verificationSchema);

module.exports = Verification; 