const Joi = require('joi');

/**
 * Create a validation middleware using Joi schema
 * @param {Object} schema - Joi validation schema
 * @param {string} property - Request property to validate (body, params, query)
 * @returns {Function} Express middleware
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    // Skip validation if schema is not defined
    if (!schema) return next();

    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true, // Remove unknown properties
      errors: { label: 'key' } // Return the property name in errors
    });

    if (error) {
      // Format validation errors
      const errorDetails = error.details.map(err => ({
        path: err.path,
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: errorDetails
        }
      });
    }

    // Replace the validated object
    req[property] = value;
    return next();
  };
};

/**
 * Common validation schemas
 */
const schemas = {
  // User schemas
  createUser: Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid('user', 'admin').default('user')
  }),

  updateUser: Joi.object({
    name: Joi.string().trim().min(2).max(100),
    email: Joi.string().email(),
    password: Joi.string().min(8),
    role: Joi.string().valid('user', 'admin')
  }).min(1), // At least one field must be provided

  // Authentication schemas
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  // Lead schemas
  createLead: Joi.object({
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipCode: Joi.string().pattern(/^\d{5}(-\d{4})?$/).required(),
    propertyType: Joi.string().valid('residential', 'commercial', 'vacant_land').required(),
    ownerName: Joi.string(),
    ownerContact: Joi.string(),
    notes: Joi.string().max(1000),
    status: Joi.string().valid('new', 'verified', 'contacted', 'negotiating', 'closed', 'dead').default('new'),
    tags: Joi.array().items(Joi.string())
  }),

  updateLead: Joi.object({
    address: Joi.string(),
    city: Joi.string(),
    state: Joi.string(),
    zipCode: Joi.string().pattern(/^\d{5}(-\d{4})?$/),
    propertyType: Joi.string().valid('residential', 'commercial', 'vacant_land'),
    ownerName: Joi.string(),
    ownerContact: Joi.string(),
    notes: Joi.string().max(1000),
    status: Joi.string().valid('new', 'verified', 'contacted', 'negotiating', 'closed', 'dead'),
    tags: Joi.array().items(Joi.string())
  }).min(1), // At least one field must be provided

  // Common ID parameter schema
  idParam: Joi.object({
    id: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
  }),

  // Pagination schema
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().default('-createdAt')
  })
};

module.exports = { validate, schemas }; 