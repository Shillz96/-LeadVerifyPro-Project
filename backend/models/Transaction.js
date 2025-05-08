/**
 * Transaction Model
 * Defines the schema for payment and usage transactions in MongoDB
 */
const mongoose = require('mongoose');

// Define Transaction Schema
const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['subscription', 'usage', 'credit', 'refund', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  description: {
    type: String,
    trim: true
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'bank_transfer', 'paypal', 'stripe', 'other'],
    default: 'credit_card'
  },
  paymentDetails: {
    provider: String,
    transactionId: String,
    cardLast4: String,
    expiryDate: String
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  usageDetails: {
    feature: String,
    quantity: Number,
    unitPrice: Number
  },
  metadata: {
    ipAddress: String,
    userAgent: String
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// Method to generate receipt data
transactionSchema.methods.generateReceipt = function() {
  return {
    transactionId: this._id,
    date: this.createdAt,
    amount: this.amount,
    currency: this.currency,
    description: this.description,
    status: this.status,
    paymentMethod: this.paymentMethod,
    paymentDetails: {
      cardLast4: this.paymentDetails.cardLast4
    }
  };
};

// Static method to find transactions by user ID
transactionSchema.statics.findByUserId = function(userId) {
  return this.find({ user: userId }).sort({ createdAt: -1 });
};

// Static method to find transactions by organization ID
transactionSchema.statics.findByOrganizationId = function(organizationId) {
  return this.find({ organization: organizationId }).sort({ createdAt: -1 });
};

// Create and export the Transaction model
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction; 