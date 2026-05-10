const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Generate JWT access token
 * @param {Object} payload - Token payload
 * @returns {String} JWT token
 */
const generateAccessToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
    algorithm: config.jwt.algorithm
  });
};

/**
 * Generate JWT refresh token
 * @param {Object} payload - Token payload
 * @returns {String} JWT refresh token
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
    algorithm: config.jwt.algorithm
  });
};

/**
 * Generate password reset token (uses separate secret)
 * @param {Object} payload - Token payload
 * @returns {String} JWT reset token
 */
const generateResetToken = (payload) => {
  return jwt.sign(payload, config.jwt.resetSecret, {
    expiresIn: '1h',
    algorithm: config.jwt.algorithm
  });
};

/**
 * Verify JWT access token
 * @param {String} token - JWT token
 * @returns {Object} Decoded payload
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret, {
      algorithms: [config.jwt.algorithm]
    });
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Verify JWT refresh token
 * @param {String} token - JWT refresh token
 * @returns {Object} Decoded payload
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret, {
      algorithms: [config.jwt.algorithm]
    });
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

/**
 * Verify password reset token
 * @param {String} token - JWT reset token
 * @returns {Object} Decoded payload
 */
const verifyResetToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.resetSecret, {
      algorithms: [config.jwt.algorithm]
    });
  } catch (error) {
    throw new Error('Invalid or expired reset token');
  }
};

/**
 * Generate both access and refresh tokens
 * @param {Object} payload - Token payload
 * @returns {Object} Object with access and refresh tokens
 */
const generateTokens = (payload) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateResetToken,
  verifyAccessToken,
  verifyRefreshToken,
  verifyResetToken,
  generateTokens
};
