/**
 * Common hooks and plugins for Mongoose models
 * Provides consistent validation and data transformation
 */

const { createChildLogger } = require('./logger');
const logger = createChildLogger('modelHooks');

/**
 * Adds standardized timestamps to all models
 * @param {Object} schema - Mongoose schema
 */
const addTimestamps = (schema) => {
  // Add timestamps with createdAt and updatedAt
  schema.set('timestamps', {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });
  
  // Add automatic 'lastModified' timestamp on every update
  schema.pre('findOneAndUpdate', function() {
    this.set({ lastModified: new Date() });
  });
  
  schema.pre('updateOne', function() {
    this.set({ lastModified: new Date() });
  });
  
  schema.pre('updateMany', function() {
    this.set({ lastModified: new Date() });
  });
};

/**
 * Adds data validation hooks to schema
 * @param {Object} schema - Mongoose schema
 * @param {Object} options - Configuration options
 */
const addValidationHooks = (schema, options = {}) => {
  // Pre-save validation
  schema.pre('save', async function(next) {
    try {
      // Run model-specific validation if provided
      if (options.validate) {
        await options.validate(this);
      }
      
      // Truncate strings that exceed max length
      if (options.truncateStrings) {
        for (const [path, maxLength] of Object.entries(options.truncateStrings)) {
          if (this[path] && typeof this[path] === 'string' && this[path].length > maxLength) {
            this[path] = this[path].substring(0, maxLength);
            logger.warn(`Truncated ${this.constructor.modelName}.${path} value to ${maxLength} characters`);
          }
        }
      }
      
      // Sanitize HTML if specified
      if (options.sanitizeHtml) {
        const sanitizeHtml = require('sanitize-html');
        for (const path of options.sanitizeHtml) {
          if (this[path] && typeof this[path] === 'string') {
            const original = this[path];
            this[path] = sanitizeHtml(this[path], {
              allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
              allowedAttributes: {
                'a': ['href', 'target']
              }
            });
            
            if (original !== this[path]) {
              logger.info(`Sanitized HTML in ${this.constructor.modelName}.${path}`);
            }
          }
        }
      }
      
      next();
    } catch (error) {
      logger.error(`Validation error in ${this.constructor.modelName}`, error);
      next(error);
    }
  });
  
  // Validate updates
  const validateUpdate = async function(next) {
    try {
      const update = this.getUpdate();
      
      // Skip validation for special MongoDB operators
      const hasSpecialOperators = update && Object.keys(update).some(key => key.startsWith('$'));
      if (hasSpecialOperators && !options.validateOperators) {
        return next();
      }
      
      // Run custom update validation
      if (options.validateUpdate) {
        await options.validateUpdate(update, this);
      }
      
      next();
    } catch (error) {
      logger.error(`Update validation error in ${this.model.modelName}`, error);
      next(error);
    }
  };
  
  schema.pre('findOneAndUpdate', validateUpdate);
  schema.pre('updateOne', validateUpdate);
  schema.pre('updateMany', validateUpdate);
};

/**
 * Adds soft delete functionality to schema
 * @param {Object} schema - Mongoose schema
 */
const addSoftDelete = (schema) => {
  // Add isDeleted field
  schema.add({
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },
    deletedAt: {
      type: Date,
      default: null
    }
  });
  
  // Filter out soft-deleted documents
  schema.pre('find', function() {
    // Skip if explicitly querying for deleted items
    if (this._conditions.includeDeleted) {
      delete this._conditions.includeDeleted;
      return;
    }
    
    // Only apply if isDeleted is not already in the query
    if (!('isDeleted' in this._conditions)) {
      this._conditions.isDeleted = { $ne: true };
    }
  });
  
  // Add similar hooks for findOne, findById, etc.
  const queryMethods = ['findOne', 'findById', 'countDocuments', 'count'];
  queryMethods.forEach(method => {
    schema.pre(method, function() {
      if (this._conditions.includeDeleted) {
        delete this._conditions.includeDeleted;
        return;
      }
      
      if (!('isDeleted' in this._conditions)) {
        this._conditions.isDeleted = { $ne: true };
      }
    });
  });
  
  // Add restore method to model
  schema.statics.restore = async function(id) {
    return this.findByIdAndUpdate(
      id,
      { 
        isDeleted: false, 
        deletedAt: null,
        $inc: { __v: 1 } // Increment version
      },
      { new: true }
    );
  };
  
  // Add soft delete method to model
  schema.statics.softDelete = async function(id) {
    return this.findByIdAndUpdate(
      id,
      { 
        isDeleted: true, 
        deletedAt: new Date(),
        $inc: { __v: 1 } // Increment version
      },
      { new: true }
    );
  };
};

/**
 * Plugin for all models, combines common hooks
 * @param {Object} schema - Mongoose schema
 * @param {Object} options - Configuration options
 */
const commonModelHooks = (schema, options = {}) => {
  // Add created/updated timestamps
  addTimestamps(schema);
  
  // Add validation hooks if enabled (default: true)
  if (options.validation !== false) {
    addValidationHooks(schema, options);
  }
  
  // Add soft delete if enabled (default: false)
  if (options.softDelete === true) {
    addSoftDelete(schema);
  }
  
  // Add common methods and virtuals
  
  // Convert _id to id in JSON 
  schema.set('toJSON', {
    virtuals: true,
    transform: (doc, converted) => {
      // Convert _id to id string
      converted.id = converted._id.toString();
      // Remove _id and __v
      delete converted._id;
      delete converted.__v;
      return converted;
    }
  });
  
  // Add toPublic method to filter sensitive fields
  schema.methods.toPublic = function() {
    const obj = this.toJSON();
    
    // Remove sensitive fields specified in options
    if (options.sensitiveFields) {
      options.sensitiveFields.forEach(field => {
        delete obj[field];
      });
    }
    
    return obj;
  };
};

module.exports = {
  commonModelHooks,
  addTimestamps,
  addValidationHooks,
  addSoftDelete
}; 