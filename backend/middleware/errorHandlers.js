/**
 * Error handling middleware for Express application
 */

// Setup global error handlers for the Express app
const setupErrorHandlers = (app) => {
  // Handle multer/file upload errors
  app.use((err, req, res, next) => {
    if (err.message === 'Only CSV files are allowed') {
      return res.status(400).json({ 
        error: 'Invalid file type', 
        message: 'Only CSV files are allowed'
      });
    }
    
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'File size exceeds the maximum allowed limit'
      });
    }
    
    // For other Multer errors
    if (err.name === 'MulterError') {
      return res.status(400).json({
        error: 'File upload error',
        message: err.message
      });
    }
    
    // Pass to next error handler if not a file upload error
    next(err);
  });

  // Generic error handler - should be last
  app.use((err, req, res, next) => {
    console.error('Server error:', err);
    
    // Don't expose stack traces in production
    const errorResponse = {
      error: 'Server error',
      message: process.env.NODE_ENV === 'production' 
        ? 'An unexpected error occurred' 
        : err.message
    };
    
    if (process.env.NODE_ENV !== 'production') {
      errorResponse.stack = err.stack;
    }
    
    res.status(500).json(errorResponse);
  });
};

module.exports = { setupErrorHandlers }; 