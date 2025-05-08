/**
 * Organization Model
 * Defines the schema for organization data in MongoDB
 */
const mongoose = require('mongoose');

// Define Organization Schema
const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  industry: {
    type: String,
    trim: true
  },
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
    default: '1-10'
  },
  logo: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  subscription: {
    plan: {
      type: String,
      enum: ['team', 'business', 'enterprise'],
      default: 'team'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'trial', 'expired'],
      default: 'trial'
    },
    seats: {
      total: {
        type: Number,
        default: 3
      },
      used: {
        type: Number,
        default: 1
      }
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    paymentId: String,
    customerId: String
  },
  settings: {
    sharingEnabled: {
      type: Boolean,
      default: true
    },
    defaultPermissions: {
      type: [String],
      default: ['view', 'edit']
    },
    apiAccess: {
      type: Boolean,
      default: false
    },
    branding: {
      primaryColor: {
        type: String,
        default: '#3b82f6' // Tailwind blue-500
      },
      logoUrl: String,
      customDomain: String
    }
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member', 'viewer'],
      default: 'member'
    },
    permissions: {
      type: [String],
      default: ['view', 'edit']
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Method to check if a user is a member of the organization
organizationSchema.methods.isMember = function(userId) {
  return this.members.some(member => member.user.toString() === userId.toString());
};

// Method to check if a user is an admin of the organization
organizationSchema.methods.isAdmin = function(userId) {
  const member = this.members.find(member => member.user.toString() === userId.toString());
  return member && (member.role === 'admin' || member.role === 'owner');
};

// Method to get organization details
organizationSchema.methods.getDetails = function() {
  return {
    id: this._id,
    name: this.name,
    description: this.description,
    website: this.website,
    industry: this.industry,
    size: this.size,
    logo: this.logo,
    address: this.address,
    subscription: {
      plan: this.subscription.plan,
      status: this.subscription.status,
      seats: this.subscription.seats,
      endDate: this.subscription.endDate
    },
    settings: this.settings,
    owner: this.owner,
    createdAt: this.createdAt
  };
};

// Create and export the Organization model
const Organization = mongoose.model('Organization', organizationSchema);

module.exports = Organization; 