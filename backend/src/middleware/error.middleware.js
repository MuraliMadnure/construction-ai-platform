const logger = require('../utils/logger');
const config = require('../config');

/**
 * Custom API Error class
 */
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  // Default to 500 if no status code
  statusCode = statusCode || 500;

  // Log error
  logger.error({
    statusCode,
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id
  });

  // Prepare error response
  const response = {
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: message,
      ...(config.server.env === 'development' && { stack: err.stack })
    }
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    response.error.code = 'VALIDATION_ERROR';
    response.error.details = err.errors;
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    response.error.code = 'INVALID_TOKEN';
    response.error.message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    response.error.code = 'TOKEN_EXPIRED';
    response.error.message = 'Token expired';
  }

  if (err.code === 'P2002') {
    // Prisma unique constraint error
    statusCode = 409;
    response.error.code = 'DUPLICATE_ENTRY';
    response.error.message = 'Duplicate entry';
  }

  if (err.code === 'P2025') {
    // Prisma record not found
    statusCode = 404;
    response.error.code = 'NOT_FOUND';
    response.error.message = 'Resource not found';
  }

  // Send error response
  res.status(statusCode).json(response);
};

/**
 * Async handler wrapper to catch errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  ApiError,
  errorHandler,
  asyncHandler
};
