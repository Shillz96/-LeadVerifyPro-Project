/**
 * Rate limiting middleware using express-rate-limit
 */
import rateLimit from 'express-rate-limit';
import { Request } from 'express';

// Helper function to get client IP with fallbacks
const getClientIP = (req: Request): string => {
  // For Render, prefer X-Forwarded-For if available
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    // Take the leftmost (client) IP from X-Forwarded-For
    const ips = Array.isArray(forwardedFor) 
      ? forwardedFor[0] 
      : forwardedFor.split(',')[0].trim();
    return ips;
  }
  
  // Fallback to standard request IP
  return req.ip || req.connection.remoteAddress || '0.0.0.0';
};

// Default rate limiter settings
const defaultOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Maximum 100 requests per window
  standardHeaders: true, // Return rate limit info in the 'RateLimit-*' headers
  legacyHeaders: false, // Don't use deprecated 'X-RateLimit-*' headers
  // Use a more secure IP extraction method
  keyGenerator: (req: Request) => getClientIP(req),
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