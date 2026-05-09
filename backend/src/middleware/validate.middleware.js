const { ApiError } = require('./error.middleware');

/**
 * Validate request using Zod schema
 * @param {Object} schema - Zod schema object with body, params, query
 */
const validate = (schema) => {
  return (req, res, next) => {
    try {
      // Validate request body
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }

      // Validate request params
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }

      // Validate request query
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }

      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));

        return next(new ApiError(400, 'Validation failed', true, {
          code: 'VALIDATION_ERROR',
          details: errors
        }));
      }

      next(error);
    }
  };
};

module.exports = { validate };
