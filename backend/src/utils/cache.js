const Redis = require('ioredis');
const config = require('../config');
const logger = require('./logger');

let redis = null;

try {
  redis = new Redis({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password || undefined,
    db: config.redis.db,
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) return null; // Stop retrying
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true
  });

  redis.connect().catch((err) => {
    logger.warn('Redis connection failed, caching disabled:', err.message);
    redis = null;
  });

  redis.on('error', (err) => {
    logger.warn('Redis error:', err.message);
  });
} catch (err) {
  logger.warn('Redis initialization failed, caching disabled:', err.message);
  redis = null;
}

/**
 * Get cached value or compute and cache it
 * @param {string} key - Cache key
 * @param {Function} computeFn - Async function to compute value if not cached
 * @param {number} ttlSeconds - Time to live in seconds (default 5 minutes)
 * @returns {*} Cached or computed value
 */
async function cacheGet(key, computeFn, ttlSeconds = 300) {
  // If Redis is not available, just compute
  if (!redis) {
    return computeFn();
  }

  try {
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (err) {
    logger.warn(`Cache read error for key ${key}:`, err.message);
  }

  // Compute value
  const value = await computeFn();

  // Store in cache (don't await, fire-and-forget)
  if (redis && value !== undefined && value !== null) {
    redis.setex(key, ttlSeconds, JSON.stringify(value)).catch((err) => {
      logger.warn(`Cache write error for key ${key}:`, err.message);
    });
  }

  return value;
}

/**
 * Invalidate cache key(s)
 * @param {string|string[]} keys - Key or keys to invalidate
 */
async function cacheInvalidate(keys) {
  if (!redis) return;

  try {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    if (keyArray.length > 0) {
      await redis.del(...keyArray);
    }
  } catch (err) {
    logger.warn('Cache invalidation error:', err.message);
  }
}

/**
 * Invalidate all keys matching a pattern
 * @param {string} pattern - Pattern to match (e.g., "project:*")
 */
async function cacheInvalidatePattern(pattern) {
  if (!redis) return;

  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    logger.warn('Cache pattern invalidation error:', err.message);
  }
}

module.exports = {
  redis,
  cacheGet,
  cacheInvalidate,
  cacheInvalidatePattern
};
