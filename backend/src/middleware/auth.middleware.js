const { verifyAccessToken } = require('../utils/jwt');
const { ApiError } = require('./error.middleware');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Authenticate user middleware
 * Verifies JWT token and attaches user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    // Verify token
    const decoded = verifyAccessToken(token);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    if (user.status !== 'ACTIVE') {
      throw new ApiError(401, 'User account is not active');
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.userRoles.map(ur => ur.role.name),
      permissions: user.userRoles.flatMap(ur =>
        ur.role.rolePermissions.map(rp => rp.permission.name)
      )
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(401, 'Invalid token'));
    }
  }
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't throw error if not
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyAccessToken(token);

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  rolePermissions: {
                    include: {
                      permission: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (user && user.status === 'ACTIVE') {
        req.user = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.userRoles.map(ur => ur.role.name),
          permissions: user.userRoles.flatMap(ur =>
            ur.role.rolePermissions.map(rp => rp.permission.name)
          )
        };
      }
    }

    next();
  } catch (error) {
    // Silently fail for optional authentication
    next();
  }
};

module.exports = {
  authenticate,
  optionalAuthenticate
};
