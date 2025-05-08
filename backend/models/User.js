/**
 * User Model
 * Defines the schema for user data in MongoDB
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'superadmin'],
    default: 'user'
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'trial', 'expired'],
      default: 'trial'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    paymentId: String,
    customerId: String,
    limits: {
      leadsPerMonth: {
        type: Number,
        default: 50 // Default limit for free plan
      },
      apiCallsPerDay: {
        type: Number,
        default: 100
      },
      batchSize: {
        type: Number,
        default: 10
      },
      advancedFeatures: {
        type: Boolean,
        default: false
      }
    },
    billingInfo: {
      address: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      taxId: String
    }
  },
  usageStats: {
    leadsUploaded: {
      type: Number,
      default: 0
    },
    leadsVerified: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },
    apiCalls: {
      type: Number,
      default: 0
    },
    lastApiCall: Date,
    loginHistory: [{
      date: {
        type: Date,
        default: Date.now
      },
      ipAddress: String,
      userAgent: String
    }]
  },
  preferences: {
    notifications: {
      email: {
        type: Boolean, 
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      marketingEmails: {
        type: Boolean,
        default: true
      }
    },
    dashboard: {
      defaultView: {
        type: String,
        default: 'summary'
      },
      theme: {
        type: String,
        default: 'light'
      }
    }
  },
  team: {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization'
    },
    isTeamAdmin: {
      type: Boolean,
      default: false
    },
    permissions: {
      type: [String],
      default: ['view', 'edit']
    }
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  accountLocked: {
    type: Boolean,
    default: false
  },
  failedLoginAttempts: {
    type: Number,
    default: 0
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

// Pre-save hook to hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it's modified or new
  if (!this.isModified('password')) return next();
  
  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords for login
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to generate user profile (without sensitive data)
userSchema.methods.getProfile = function() {
  return {
    id: this._id,
    email: this.email,
    firstName: this.firstName,
    lastName: this.lastName,
    company: this.company,
    role: this.role,
    subscription: {
      plan: this.subscription.plan,
      status: this.subscription.status,
      endDate: this.subscription.endDate,
      limits: this.subscription.limits
    },
    usageStats: this.usageStats,
    preferences: this.preferences,
    team: this.team,
    createdAt: this.createdAt,
    emailVerified: this.emailVerified
  };
};

// Method to check if user has admin privileges
userSchema.methods.isAdmin = function() {
  return this.role === 'admin' || this.role === 'superadmin';
};

// Method to check if user is a super admin
userSchema.methods.isSuperAdmin = function() {
  return this.role === 'superadmin';
};

// Method to check if the user's subscription is active
userSchema.methods.hasActiveSubscription = function() {
  return this.subscription.status === 'active' || this.subscription.status === 'trial';
};

// Method to check if user has reached their subscription limits
userSchema.methods.hasReachedLeadLimit = function() {
  return this.usageStats.leadsUploaded >= this.subscription.limits.leadsPerMonth;
};

// Create and export the User model
const User = mongoose.model('User', userSchema);

module.exports = User; 