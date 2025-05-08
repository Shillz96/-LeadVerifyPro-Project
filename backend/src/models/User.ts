import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { 
  UserType, 
  UserPreferences, 
  UserSubscription, 
  UserUsageStats,
  UserOfflineStorable 
} from '../types/userTypes';

// Define User Document interface that properly extends Document
export interface UserDocument extends Document {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  role?: string;
  emailVerified?: boolean;
  emailVerificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  failedLoginAttempts?: number;
  accountLocked?: boolean;
  preferences?: UserPreferences;
  subscription?: UserSubscription;
  usageStats?: UserUsageStats;
  team?: {
    organization?: mongoose.Types.ObjectId;
    isTeamAdmin?: boolean;
    permissions?: string[];
  };
  comparePassword(password: string): Promise<boolean>;
  getProfile(): Partial<UserOfflineStorable>;
}

// Define User Model interface
export interface UserModel extends Model<UserDocument> {
  findByEmail(email: string): Promise<UserDocument | null>;
}

// Define User Schema
const userSchema = new Schema({
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
  role: {
    type: String,
    enum: ['user', 'admin', 'superadmin'],
    default: 'user'
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  failedLoginAttempts: {
    type: Number,
    default: 0
  },
  accountLocked: {
    type: Boolean,
    default: false
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
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'past_due'],
      default: 'active'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date
  },
  usageStats: {
    leadsUploadedThisMonth: {
      type: Number,
      default: 0
    },
    verificationsUsedThisMonth: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },
    loginHistory: [{
      date: {
        type: Date,
        default: Date.now
      },
      ipAddress: String,
      userAgent: String
    }]
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
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(this: UserDocument, next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password as string, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(this: UserDocument, plainPassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(plainPassword, this.password);
};

// Method to get user profile (safe user data without sensitive info)
userSchema.methods.getProfile = function(this: UserDocument): Partial<UserOfflineStorable> {
  return {
    _id: this._id,
    email: this.email,
    firstName: this.firstName,
    lastName: this.lastName,
    company: this.company,
    role: this.role,
    emailVerified: this.emailVerified,
    preferences: this.preferences,
    subscription: this.subscription ? {
      plan: this.subscription.plan,
      status: this.subscription.status,
      startDate: this.subscription.startDate?.toISOString(),
      endDate: this.subscription.endDate?.toISOString() || null
    } : undefined,
    usageStats: this.usageStats ? {
      leadsUploadedThisMonth: this.usageStats.leadsUploadedThisMonth,
      verificationsUsedThisMonth: this.usageStats.verificationsUsedThisMonth,
      lastActivity: this.usageStats.lastActivity?.toISOString(),
      loginHistory: this.usageStats.loginHistory?.map(entry => ({
        date: entry.date.toISOString(),
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent
      }))
    } : undefined
  };
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email: string): Promise<UserDocument | null> {
  return this.findOne({ email: email.toLowerCase() });
};

// Create and export the User model
const User = mongoose.model<UserDocument, UserModel>('User', userSchema);

export default User; 