const { logger } = require('../utils/logger');

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(message, statusCode = 500, code, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || this.getDefaultErrorCode(statusCode);
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  getDefaultErrorCode(statusCode) {
    const codes = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
      503: 'SERVICE_UNAVAILABLE'
    };
    return codes[statusCode] || 'UNKNOWN_ERROR';
  }
}

/**
 * Factory for common error types
 */
const ApiErrors = {
  badRequest: (message = 'Bad request', code = 'BAD_REQUEST', details = null) => 
    new ApiError(message, 400, code, details),
  
  unauthorized: (message = 'Unauthorized', code = 'UNAUTHORIZED', details = null) => 
    new ApiError(message, 401, code, details),
  
  forbidden: (message = 'Forbidden', code = 'FORBIDDEN', details = null) => 
    new ApiError(message, 403, code, details),
  
  notFound: (message = 'Resource not found', code = 'NOT_FOUND', details = null) => 
    new ApiError(message, 404, code, details),
  
  conflict: (message = 'Resource conflict', code = 'CONFLICT', details = null) => 
    new ApiError(message, 409, code, details),
  
  tooManyRequests: (message = 'Too many requests', code = 'TOO_MANY_REQUESTS', details = null) => 
    new ApiError(message, 429, code, details),
  
  internal: (message = 'Internal server error', code = 'INTERNAL_SERVER_ERROR', details = null) => 
    new ApiError(message, 500, code, details),
  
  serviceUnavailable: (message = 'Service unavailable', code = 'SERVICE_UNAVAILABLE', details = null) => 
    new ApiError(message, 503, code, details)
};

/**
 * Central error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = err;
  
  // Log error
  logger.error(`[${req.method}] ${req.path} - ${err.message}`, { 
    error: err,
    stack: err.stack,
    body: req.body,
    params: req.params,
    query: req.query,
    user: req.user ? req.user.id : null
  });

  // If not an ApiError, convert to generic error
  if (!(error instanceof ApiError)) {
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const details = Object.keys(error.errors).map(field => ({
        path: field,
        message: error.errors[field].message
      }));
      
      error = ApiErrors.badRequest('Validation error', 'VALIDATION_ERROR', details);
    } 
    // Handle MongoDB duplicate key error
    else if (error.name === 'MongoServerError' && error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      error = ApiErrors.conflict(
        `Duplicate value for ${field}`,
        'DUPLICATE_VALUE',
        { field, value: error.keyValue[field] }
      );
    } 
    // Handle JWT errors
    else if (error.name === 'JsonWebTokenError') {
      error = ApiErrors.unauthorized('Invalid token', 'INVALID_TOKEN');
    } 
    else if (error.name === 'TokenExpiredError') {
      error = ApiErrors.unauthorized('Token expired', 'TOKEN_EXPIRED');
    } 
    // Handle other errors
    else {
      // Don't expose internal errors in production
      const isProduction = process.env.NODE_ENV === 'production';
      const message = isProduction ? 'An unexpected error occurred' : error.message;
      error = ApiErrors.internal(message);
      
      // Only include stack trace in development
      if (!isProduction) {
        error.details = { stack: err.stack };
      }
    }
  }

  // Send error response
  res.status(error.statusCode).json({
    success: false,
    error: {
      code: error.code,
      message: error.message,
      ...(error.details && { details: error.details })
    }
  });
};

/**
 * 404 handler middleware
 */
const notFoundHandler = (req, res, next) => {
  const error = ApiErrors.notFound(`Route not found: ${req.method} ${req.originalUrl}`);
  next(error);
};

module.exports = {
  ApiError,
  ApiErrors,
  errorHandler,
  notFoundHandler
}; 