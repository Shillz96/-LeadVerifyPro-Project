/**
 * Logger Utility
 * 
 * Provides consistent logging across the application using pino.
 * Supports different log levels based on environment.
 */

const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Ensure logs directory exists
const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

/**
 * Custom log format with timestamp, level, and message
 */
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

/**
 * Console format for development environment
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(
    ({ timestamp, level, message, ...meta }) => 
      `${timestamp} ${level}: ${message} ${
        Object.keys(meta).length ? '\n' + JSON.stringify(meta, null, 2) : ''
      }`
  )
);

/**
 * Create transport configuration based on environment
 */
const getTransports = () => {
  const transports = [
    // Always log errors to file
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Combined logs
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  ];

  // Add console logger in development
  if (process.env.NODE_ENV !== 'production') {
    transports.push(
      new winston.transports.Console({
        format: consoleFormat,
        level: process.env.LOG_LEVEL || 'debug'
      })
    );
  } else {
    // Optional: Add specialized production transports here
    // like sending critical errors to a notification service
  }

  return transports;
};

/**
 * Create the Winston logger
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  defaultMeta: { service: 'leadverifypro-api' },
  transports: getTransports(),
  // Don't exit on error
  exitOnError: false
});

/**
 * Stream for Morgan HTTP request logger middleware
 */
const httpLogStream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

/**
 * Create a child logger with additional metadata
 * @param {string} module - Module name
 * @param {Object} meta - Additional metadata 
 * @returns {Object} Child logger
 */
const createChildLogger = (module, meta = {}) => {
  return logger.child({
    module,
    ...meta
  });
};

module.exports = {
  logger,
  httpLogStream,
  createChildLogger
}; 