/**
 * Subscription Checks Middleware
 * Enforces subscription limits and feature access
 */
const User = require('../models/User');
const { 
  hasActiveSubscription, 
  hasExceededLeadLimit, 
  hasExceededApiLimit,
  canAccessFeature
} = require('../utils/accountHelpers');

/**
 * Middleware to check if user has an active subscription
 * Must be used after authenticate middleware
 */
const requireActiveSubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    // Super admins bypass subscription checks
    if (user.role === 'superadmin') {
      return next();
    }
    
    if (!hasActiveSubscription(user)) {
      return res.status(402).json({
        error: 'Payment Required',
        message: 'Your subscription is inactive or has expired',
        subscriptionStatus: user.subscription.status
      });
    }
    
    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Error checking subscription status'
    });
  }
};

/**
 * Middleware to check if user has not exceeded their lead limit
 * Must be used after authenticate middleware
 */
const checkLeadLimit = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    // Super admins bypass limit checks
    if (user.role === 'superadmin') {
      return next();
    }
    
    if (hasExceededLeadLimit(user)) {
      return res.status(403).json({
        error: 'Limit Exceeded',
        message: 'You have reached your monthly lead limit',
        limit: user.subscription.limits.leadsPerMonth,
        current: user.usageStats.leadsUploaded
      });
    }
    
    next();
  } catch (error) {
    console.error('Lead limit check error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Error checking lead limits'
    });
  }
};

/**
 * Middleware to check if user has not exceeded their API call limit
 * Must be used after authenticate middleware
 */
const checkApiLimit = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    // Super admins bypass limit checks
    if (user.role === 'superadmin') {
      return next();
    }
    
    if (hasExceededApiLimit(user)) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'You have reached your daily API call limit',
        limit: user.subscription.limits.apiCallsPerDay,
        current: user.usageStats.apiCalls
      });
    }
    
    next();
  } catch (error) {
    console.error('API limit check error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Error checking API limits'
    });
  }
};

/**
 * Factory function to create middleware that checks access to specific features
 * @param {String} featureName - Name of the feature to check access for
 * @returns {Function} Middleware function
 */
const requireFeatureAccess = (featureName) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.userId);
      
      if (!user) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'User not found'
        });
      }

      // Super admins bypass feature access checks
      if (user.role === 'superadmin') {
        return next();
      }
      
      if (!canAccessFeature(user, featureName)) {
        return res.status(403).json({
          error: 'Forbidden',
          message: `Your subscription plan does not include access to ${featureName}`,
          requiredPlan: featureName === 'teamAccess' ? 'premium or enterprise' : 'premium or enterprise with advanced features'
        });
      }
      
      next();
    } catch (error) {
      console.error('Feature access check error:', error);
      res.status(500).json({
        error: 'Server Error',
        message: 'Error checking feature access'
      });
    }
  };
};

module.exports = {
  requireActiveSubscription,
  checkLeadLimit,
  checkApiLimit,
  requireFeatureAccess
}; 