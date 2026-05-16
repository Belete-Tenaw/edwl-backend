/**
 * Redis Cache Service (GAP 4 Fix)
 * Replaces the in-memory Map cache with a Redis-backed distributed cache.
 * Uses ioredis with Upstash-compatible URL format.
 * Falls back gracefully to the in-memory cache if Redis is unavailable.
 */
const Redis = require('ioredis');

let redisClient = null;
let useInMemoryFallback = false;
const fallbackCache = new Map();

// Connect to Redis if URL is provided
if (process.env.REDIS_URL) {
    try {
        redisClient = new Redis(process.env.REDIS_URL, {
            maxRetriesPerRequest: 3,
            lazyConnect: false,
            connectTimeout: 5000,
        });

        redisClient.on('connect', () => {
            console.log('[RedisCache] ✅ Connected to Redis successfully.');
        });

        redisClient.on('error', (err) => {
            console.warn('[RedisCache] ⚠️ Redis connection error. Falling back to in-memory cache.', err.message);
            useInMemoryFallback = true;
        });
    } catch (err) {
        console.warn('[RedisCache] ⚠️ Failed to init Redis. Using in-memory cache.', err.message);
        useInMemoryFallback = true;
    }
} else {
    console.warn('[RedisCache] ℹ️ REDIS_URL not set. Using in-memory cache (not suitable for multi-instance deployments).');
    useInMemoryFallback = true;
}

class RedisCacheService {
    /**
     * Set a value in cache with TTL in seconds
     * @param {string} key 
     * @param {*} value 
     * @param {number} ttlSeconds - TTL in seconds (default 300 = 5 min)
     */
    async set(key, value, ttlSeconds = 300) {
        const serialized = JSON.stringify(value);
        if (!useInMemoryFallback && redisClient) {
            await redisClient.set(key, serialized, 'EX', ttlSeconds);
        } else {
            fallbackCache.set(key, { value: serialized, expiry: Date.now() + ttlSeconds * 1000 });
        }
    }

    /**
     * Get a value from cache
     * @param {string} key 
     * @returns {*} parsed value or null
     */
    async get(key) {
        if (!useInMemoryFallback && redisClient) {
            const data = await redisClient.get(key);
            return data ? JSON.parse(data) : null;
        } else {
            const item = fallbackCache.get(key);
            if (!item) return null;
            if (Date.now() > item.expiry) {
                fallbackCache.delete(key);
                return null;
            }
            return JSON.parse(item.value);
        }
    }

    /**
     * Delete a key from cache
     * @param {string} key 
     */
    async del(key) {
        if (!useInMemoryFallback && redisClient) {
            await redisClient.del(key);
        } else {
            fallbackCache.delete(key);
        }
    }

    /**
     * Flush the entire cache (use with caution in production)
     */
    async flush() {
        if (!useInMemoryFallback && redisClient) {
            await redisClient.flushdb();
        } else {
            fallbackCache.clear();
        }
    }

    /**
     * Check if Redis is healthy
     */
    async ping() {
        if (!useInMemoryFallback && redisClient) {
            return await redisClient.ping();
        }
        return 'PONG (in-memory)';
    }
}

module.exports = new RedisCacheService();
