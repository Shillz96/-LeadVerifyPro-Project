/**
 * Rate limiting middleware using express-rate-limit
 */
import rateLimit from 'express-rate-limit';

// Default rate limiter settings
const defaultOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Maximum 100 requests per window
  standardHeaders: true, // Return rate limit info in the 'RateLimit-*' headers
  legacyHeaders: false, // Don't use deprecated 'X-RateLimit-*' headers
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later.'
    }
  }
};

// General API rate limiter
export const apiLimiter = rateLimit({
  ...defaultOptions,
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 300 // 300 requests per 5 minutes
});

// More strict rate limiter for authentication routes
export const authLimiter = rateLimit({
  ...defaultOptions,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 login attempts per hour
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many login attempts, please try again later.'
    }
  }
});

// Rate limiter for verification endpoints
export const verificationLimiter = rateLimit({
  ...defaultOptions,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 verification requests per hour
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Verification limit reached, please try again later.'
    }
  }
});

export default {
  apiLimiter,
  authLimiter,
  verificationLimiter
}; 