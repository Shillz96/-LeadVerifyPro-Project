/**
 * Subscription Model
 * Defines the schema for user subscription data in MongoDB
 */
const mongoose = require('mongoose');

// Define Subscription Schema
const subscriptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['free', 'basic', 'premium', 'enterprise', 'custom'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'trial', 'expired', 'canceled'],
    default: 'active'
  },
  price: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    billingCycle: {
      type: String,
      enum: ['monthly', 'quarterly', 'annual', 'one-time'],
      default: 'monthly'
    }
  },
  features: {
    leadsPerMonth: {
      type: Number,
      default: 50
    },
    apiCallsPerDay: {
      type: Number,
      default: 100
    },
    batchSize: {
      type: Number,
      default: 10
    },
    verificationTypes: {
      type: [String],
      default: ['phone']
    },
    includesTextBlasting: {
      type: Boolean,
      default: false
    },
    includesAiScoring: {
      type: Boolean,
      default: false
    },
    maxTeamMembers: {
      type: Number,
      default: 1
    }
  },
  billing: {
    nextBillingDate: Date,
    paymentMethodId: String,
    customerId: String,
    subscriptionId: String,
    provider: {
      type: String,
      enum: ['stripe', 'paypal', 'manual', 'other'],
      default: 'stripe'
    }
  },
  usage: {
    leadsUsed: {
      type: Number,
      default: 0
    },
    apiCallsUsed: {
      type: Number,
      default: 0
    },
    lastUsageReset: {
      type: Date,
      default: Date.now
    }
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: Date,
  trialEndsAt: Date,
  canceledAt: Date,
  cancellationReason: String,
  autoRenew: {
    type: Boolean,
    default: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
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

// Method to check if subscription is active
subscriptionSchema.methods.isActive = function() {
  return this.status === 'active' || this.status === 'trial';
};

// Method to check if subscription is in trial period
subscriptionSchema.methods.isTrial = function() {
  return this.status === 'trial' && this.trialEndsAt > new Date();
};

// Method to check if usage limit has been reached
subscriptionSchema.methods.hasReachedLeadLimit = function() {
  return this.usage.leadsUsed >= this.features.leadsPerMonth;
};

// Method to reset usage stats (typically called at billing cycle renewal)
subscriptionSchema.methods.resetUsage = function() {
  this.usage.leadsUsed = 0;
  this.usage.apiCallsUsed = 0;
  this.usage.lastUsageReset = new Date();
  return this.save();
};

// Method to increment usage counters
subscriptionSchema.methods.incrementLeadUsage = function(count = 1) {
  this.usage.leadsUsed += count;
  return this.save();
};

// Create and export the Subscription model
const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription; 