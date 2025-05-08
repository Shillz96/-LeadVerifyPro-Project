/**
 * Cache Utility
 * 
 * Provides caching functionality using Redis or in-memory cache.
 * Used to improve performance by caching expensive operations like geospatial analysis.
 */

const Redis = require('ioredis');
const { logger } = require('./logger');

// Configuration
const REDIS_URL = process.env.REDIS_URL;
const DEFAULT_TTL = 86400; // 24 hours in seconds
const CACHE_PREFIX = 'lvp:';

// In-memory cache (fallback if Redis is not available)
class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.logger = logger;
    this.logger.info('Using in-memory cache');
  }

  async get(key) {
    const prefixedKey = `${CACHE_PREFIX}${key}`;
    const item = this.cache.get(prefixedKey);
    
    if (!item) return null;
    
    // Check if item is expired
    if (item.expiry && item.expiry < Date.now()) {
      this.cache.delete(prefixedKey);
      return null;
    }
    
    return item.value;
  }

  async set(key, value, ttl = DEFAULT_TTL) {
    const prefixedKey = `${CACHE_PREFIX}${key}`;
    const expiry = ttl > 0 ? Date.now() + (ttl * 1000) : null;
    
    this.cache.set(prefixedKey, {
      value,
      expiry
    });
    
    return true;
  }

  async del(key) {
    const prefixedKey = `${CACHE_PREFIX}${key}`;
    return this.cache.delete(prefixedKey);
  }

  async flush() {
    this.cache.clear();
    return true;
  }
}

// Redis cache
class RedisCache {
  constructor(redisUrl) {
    this.client = new Redis(redisUrl);
    this.logger = logger;
    
    this.client.on('error', (err) => {
      this.logger.error('Redis error:', err);
    });
    
    this.client.on('connect', () => {
      this.logger.info('Connected to Redis cache');
    });
  }

  async get(key) {
    const prefixedKey = `${CACHE_PREFIX}${key}`;
    try {
      return await this.client.get(prefixedKey);
    } catch (error) {
      this.logger.error(`Redis GET error: ${error.message}`);
      return null;
    }
  }

  async set(key, value, ttl = DEFAULT_TTL) {
    const prefixedKey = `${CACHE_PREFIX}${key}`;
    try {
      if (ttl > 0) {
        return await this.client.set(prefixedKey, value, 'EX', ttl);
      } else {
        return await this.client.set(prefixedKey, value);
      }
    } catch (error) {
      this.logger.error(`Redis SET error: ${error.message}`);
      return false;
    }
  }

  async del(key) {
    const prefixedKey = `${CACHE_PREFIX}${key}`;
    try {
      return await this.client.del(prefixedKey);
    } catch (error) {
      this.logger.error(`Redis DEL error: ${error.message}`);
      return false;
    }
  }

  async flush() {
    try {
      // Only delete keys with our prefix
      const keys = await this.client.keys(`${CACHE_PREFIX}*`);
      if (keys.length > 0) {
        return await this.client.del(keys);
      }
      return true;
    } catch (error) {
      this.logger.error(`Redis FLUSH error: ${error.message}`);
      return false;
    }
  }
}

// Create cache instance based on configuration
let cacheInstance;

if (REDIS_URL) {
  try {
    cacheInstance = new RedisCache(REDIS_URL);
  } catch (error) {
    logger.error(`Failed to initialize Redis cache: ${error.message}`);
    logger.info('Falling back to in-memory cache');
    cacheInstance = new MemoryCache();
  }
} else {
  cacheInstance = new MemoryCache();
}

module.exports = cacheInstance; 