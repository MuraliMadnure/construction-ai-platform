const { ApiError } = require('./error.middleware');

/**
 * 404 Not Found middleware
 */
const notFound = (req, res, next) => {
  const error = new ApiError(404, `Route ${req.originalUrl} not found`);
  error.code = 'ROUTE_NOT_FOUND';
  next(error);
};

module.exports = { notFound };
