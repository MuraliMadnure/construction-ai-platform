const { ApiError } = require('./error.middleware');

/**
 * Check if user has required role(s)
 * @param {...string} roles - Required roles
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }

    const hasRole = roles.some(role => req.user.roles.includes(role));

    if (!hasRole) {
      return next(new ApiError(403, 'Insufficient permissions'));
    }

    next();
  };
};

/**
 * Check if user has required permission(s)
 * @param {...string} permissions - Required permissions
 */
const requirePermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }

    const hasPermission = permissions.some(permission =>
      req.user.permissions.includes(permission)
    );

    if (!hasPermission) {
      return next(new ApiError(403, 'Insufficient permissions'));
    }

    next();
  };
};

/**
 * Check if user has all required permissions
 * @param {...string} permissions - Required permissions
 */
const requireAllPermissions = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }

    const hasAllPermissions = permissions.every(permission =>
      req.user.permissions.includes(permission)
    );

    if (!hasAllPermissions) {
      return next(new ApiError(403, 'Insufficient permissions'));
    }

    next();
  };
};

/**
 * Check if user is admin
 */
const requireAdmin = requireRole('admin');

/**
 * Check if user is project manager or admin
 */
const requireProjectManager = requireRole('admin', 'project_manager');

/**
 * Check if user is site engineer, project manager, or admin
 */
const requireSiteAccess = requireRole('admin', 'project_manager', 'site_engineer');

// Alias for requirePermission (for compatibility)
const authorize = requirePermission;

module.exports = {
  requireRole,
  requirePermission,
  requireAllPermissions,
  requireAdmin,
  requireProjectManager,
  requireSiteAccess,
  authorize // Added for enterprise routes compatibility
};
