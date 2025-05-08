/**
 * Rate Limiting Middleware
 * Provides protection against abuse and DoS attacks by limiting request rates
 * 
 * NOTE: This file is being phased out in favor of the TypeScript version (src/middleware/rateLimit.ts).
 * This JavaScript version is kept for compatibility during migration.
 */

// Try to use the compiled TypeScript version if available
try {
  const tsRateLimit = require('../dist/middleware/rateLimit');
  // Export all limiters from the TypeScript version
  module.exports = {
    apiLimiter: tsRateLimit.apiLimiter,
    authLimiter: tsRateLimit.authLimiter,
    verificationLimiter: tsRateLimit.verificationLimiter,
    // Include createUserBasedLimiter if it exists in TS, otherwise define it here
    createUserBasedLimiter: tsRateLimit.createUserBasedLimiter || createUserBasedLimiterJS
  };
  console.log('Using TypeScript compiled rate limit middleware');
} catch (err) {
  // Fallback to JavaScript implementation
  console.log('Using JavaScript rate limit middleware fallback:', err.message);
  
  const rateLimit = require('express-rate-limit');
  const mongoose = require('mongoose');
  const User = require('../models/User');

  // Create a memory store for rate limiting (for JS fallback)
  const limiterStore = new Map();

  // Helper to get dynamic limit based on user subscription (JS fallback)
  const getUserRateLimitJS = async (userId) => {
    if (!userId) return 100; // Default limit for non-authenticated requests
    
    try {
      const user = await User.findById(userId);
      if (!user) return 100;
      
      // Check subscription tier
      switch (user.subscription?.plan) {
        case 'premium':
        case 'enterprise':
          return 1000; // Higher limit for premium users
        case 'basic':
          return 300; // Medium limit for basic users
        case 'free':
        default:
          return 100; // Low limit for free users
      }
    } catch (error) {
      console.error('Error getting user rate limit (JS fallback):', error);
      return 100; // Default fallback
    }
  };
  
  // General API rate limiter (JS fallback)
  const apiLimiterJS = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minute window
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later.'
      }
    },
    skip: (req) => {
      return req.ip === '127.0.0.1' || req.path.startsWith('/health');
    }
  });

  // Auth endpoint limiter - more strict (JS fallback)
  const authLimiterJS = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 30, // Limit each IP to 30 login attempts per hour
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        message: 'Too many login attempts, please try again later.'
      }
    }
  });

  // Verification endpoint limiter (JS fallback)
  const verificationLimiterJS = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 50, // Limit each IP to 50 verifications per hour
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: 'VERIFICATION_RATE_LIMIT_EXCEEDED',
        message: 'Verification rate limit exceeded. Please try again later or upgrade your plan.'
      }
    }
  });

  // Dynamic limiter based on user subscription (JS fallback)
  const createUserBasedLimiterJS = (windowMs = 15 * 60 * 1000) => {
    return async (req, res, next) => {
      try {
        const userId = req.userId; // Assumes auth middleware has set this
        const limit = await getUserRateLimitJS(userId);
        const key = `${req.ip}-${userId || 'anonymous'}`;
        
        if (!limiterStore.has(key)) {
          limiterStore.set(key, {
            count: 1,
            resetTime: Date.now() + windowMs
          });
          return next();
        }
        
        const userData = limiterStore.get(key);
        
        if (Date.now() > userData.resetTime) {
          userData.count = 1;
          userData.resetTime = Date.now() + windowMs;
          return next();
        }
        
        if (userData.count >= limit) {
          return res.status(429).json({
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: 'Rate limit exceeded. Please try again later.',
              retryAfter: Math.ceil((userData.resetTime - Date.now()) / 1000)
            }
          });
        }
        
        userData.count += 1;
        return next();
      } catch (error) {
        console.error('User-based rate limiting error (JS fallback):', error);
        next(); // Allow request in case of error
      }
    };
  };

  // Clean up old entries periodically (for JS fallback store)
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of limiterStore.entries()) {
      if (now > value.resetTime) {
        limiterStore.delete(key);
      }
    }
  }, 60 * 60 * 1000); // Clean up every hour

  module.exports = {
    apiLimiter: apiLimiterJS,
    authLimiter: authLimiterJS,
    verificationLimiter: verificationLimiterJS,
    createUserBasedLimiter: createUserBasedLimiterJS
  };
} 