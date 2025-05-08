/**
 * Account Helper Utilities
 * Functions for validating accounts, enforcing subscription limits, and tracking usage
 */
const User = require('../models/User');
const config = require('../config/env');

/**
 * Check if a user has exceeded their leads per month limit
 * @param {Object} user - User document from MongoDB
 * @returns {Boolean} True if limit exceeded, false otherwise
 */
const hasExceededLeadLimit = (user) => {
  if (!user || !user.subscription || !user.subscription.limits) {
    return true; // No valid subscription, assume limit reached
  }
  
  // Super admins don't have limits
  if (user.role === 'superadmin') {
    return false;
  }
  
  return user.usageStats.leadsUploaded >= user.subscription.limits.leadsPerMonth;
};

/**
 * Check if a user has exceeded their API calls per day limit
 * @param {Object} user - User document from MongoDB
 * @returns {Boolean} True if limit exceeded, false otherwise
 */
const hasExceededApiLimit = (user) => {
  if (!user || !user.subscription || !user.subscription.limits) {
    return true; // No valid subscription, assume limit reached
  }
  
  // Super admins don't have limits
  if (user.role === 'superadmin') {
    return false;
  }
  
  // If no API stats yet, initialize
  if (!user.usageStats.apiCalls) {
    return false;
  }
  
  // If last API call was before today, reset count
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (!user.usageStats.lastApiCall || user.usageStats.lastApiCall < today) {
    return false;
  }
  
  return user.usageStats.apiCalls >= user.subscription.limits.apiCallsPerDay;
};

/**
 * Check if a user's subscription is active
 * @param {Object} user - User document from MongoDB
 * @returns {Boolean} True if subscription is active, false otherwise
 */
const hasActiveSubscription = (user) => {
  if (!user || !user.subscription) {
    return false;
  }
  
  // Super admins always have active subscriptions
  if (user.role === 'superadmin') {
    return true;
  }
  
  const { status, endDate } = user.subscription;
  
  // Check if status is active or trial
  if (status !== 'active' && status !== 'trial') {
    return false;
  }
  
  // For trial or active subscriptions, check end date if exists
  if (endDate && new Date(endDate) < new Date()) {
    return false;
  }
  
  return true;
};

/**
 * Check if user can access a specific feature based on their subscription
 * @param {Object} user - User document from MongoDB
 * @param {String} feature - Feature to check access for
 * @returns {Boolean} True if user can access feature, false otherwise
 */
const canAccessFeature = (user, feature) => {
  if (!user || !user.subscription) {
    return false;
  }
  
  // Super admins can access all features
  if (user.role === 'superadmin') {
    return true;
  }
  
  // Check for active subscription first
  if (!hasActiveSubscription(user)) {
    return false;
  }
  
  // Feature-specific checks
  switch (feature) {
    case 'advancedSearch':
    case 'bulkExport':
    case 'customReports':
    case 'apiAccess':
      return user.subscription.limits.advancedFeatures === true;
      
    case 'teamAccess':
      return user.subscription.plan === 'premium' || user.subscription.plan === 'enterprise';
      
    case 'basicFeatures':
      return true; // All active subscriptions can access basic features
      
    default:
      return false;
  }
};

/**
 * Track a lead upload and update user's usage stats
 * @param {String} userId - User ID
 * @param {Number} count - Number of leads uploaded
 * @returns {Promise<Object>} Updated user object
 */
const trackLeadUpload = async (userId, count = 1) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Initialize usageStats if not exist
    if (!user.usageStats) {
      user.usageStats = {
        leadsUploaded: 0,
        leadsVerified: 0,
        lastActivity: new Date()
      };
    }
    
    // Update stats
    user.usageStats.leadsUploaded += count;
    user.usageStats.lastActivity = new Date();
    
    await user.save();
    return user;
  } catch (error) {
    console.error('Error tracking lead upload:', error);
    throw error;
  }
};

/**
 * Track an API call and update user's usage stats
 * @param {String} userId - User ID
 * @returns {Promise<Object>} Updated user object
 */
const trackApiCall = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Initialize usageStats if not exist
    if (!user.usageStats) {
      user.usageStats = {
        leadsUploaded: 0,
        leadsVerified: 0,
        apiCalls: 0,
        lastActivity: new Date()
      };
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Reset counter if last call was before today
    if (!user.usageStats.lastApiCall || user.usageStats.lastApiCall < today) {
      user.usageStats.apiCalls = 1;
    } else {
      user.usageStats.apiCalls += 1;
    }
    
    user.usageStats.lastApiCall = new Date();
    user.usageStats.lastActivity = new Date();
    
    await user.save();
    return user;
  } catch (error) {
    console.error('Error tracking API call:', error);
    throw error;
  }
};

/**
 * Reset usage stats for all users (typically run at the beginning of each month)
 * @returns {Promise<Number>} Number of users updated
 */
const resetMonthlyUsageStats = async () => {
  try {
    const result = await User.updateMany(
      {}, 
      { 
        $set: { 
          'usageStats.leadsUploaded': 0
        } 
      }
    );
    
    return result.modifiedCount;
  } catch (error) {
    console.error('Error resetting monthly usage stats:', error);
    throw error;
  }
};

// Export all utilities
module.exports = {
  hasExceededLeadLimit,
  hasExceededApiLimit,
  hasActiveSubscription,
  canAccessFeature,
  trackLeadUpload,
  trackApiCall,
  resetMonthlyUsageStats
}; 