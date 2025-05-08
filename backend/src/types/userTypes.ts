/**
 * User Preferences Structure
 */
export interface UserPreferences {
  notifications?: {
    email?: boolean;
    sms?: boolean;
    marketingEmails?: boolean;
  };
  dashboard?: {
    defaultView?: string;
    theme?: string;
  };
}

/**
 * User Subscription Plan Structure (Internal - uses Date objects)
 */
export interface UserSubscription {
  plan: string; // e.g., 'free', 'basic', 'premium'
  status: 'active' | 'inactive' | 'cancelled' | 'past_due';
  startDate?: Date;
  endDate?: Date | null;
  // Add other relevant fields: paymentMethodId, nextBillingDate, etc.
}

/**
 * User Usage Statistics Structure (Internal - uses Date objects)
 */
export interface UserUsageStats {
  leadsUploadedThisMonth?: number;
  verificationsUsedThisMonth?: number;
  lastActivity?: Date;
  loginHistory?: Array<{ date: Date; ipAddress?: string; userAgent?: string }>;
  // Add other relevant usage metrics
}

// --- Storable versions (using ISO strings for dates, suitable for JSON) ---

/**
 * User Subscription Plan Structure (Storable - uses ISO Date strings)
 */
export interface UserSubscriptionStorable {
  plan: string;
  status: 'active' | 'inactive' | 'cancelled' | 'past_due';
  startDate?: string; // ISO Date string
  endDate?: string | null; // ISO Date string or null
}

/**
 * User Usage Statistics Structure (Storable - uses ISO Date strings)
 */
export interface UserUsageStatsStorable {
  leadsUploadedThisMonth?: number;
  verificationsUsedThisMonth?: number;
  lastActivity?: string; // ISO Date string
  loginHistory?: Array<{ date: string; ipAddress?: string; userAgent?: string }>; // ISO Date string
}

/**
 * Represents the complete user data structure stored in offline JSON.
 * Uses storable versions of nested objects with ISO date strings.
 */
export interface UserOfflineStorable {
  _id?: string;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  role?: string;
  emailVerified?: boolean;
  emailVerificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: string; // ISO Date string
  failedLoginAttempts?: number;
  accountLocked?: boolean;
  preferences?: UserPreferences;
  subscription?: UserSubscriptionStorable; 
  usageStats?: UserUsageStatsStorable;
}

/**
 * Represents the User object used in the application logic (in-memory).
 * Uses internal versions of nested objects with Date objects.
 */
export interface UserType extends Omit<UserOfflineStorable, 'resetPasswordExpires' | 'subscription' | 'usageStats'> {
  resetPasswordExpires?: Date; // Date object for logic
  subscription?: UserSubscription; 
  usageStats?: UserUsageStats;
  save: () => Promise<UserType>;
  comparePassword: (password: string) => Promise<boolean>;
  getProfile: () => Partial<UserOfflineStorable>; // Profile should return storable format
} 