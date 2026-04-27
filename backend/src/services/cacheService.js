const cache = new Map();

/**
 * Simple in-memory cache with TTL support.
 * Used for high-traffic read operations to reduce DB load.
 */
class CacheService {
    constructor(defaultTtl = 300000) { // Default 5 minutes
        this.defaultTtl = defaultTtl;
    }

    set(key, value, ttl = this.defaultTtl) {
        const expiry = Date.now() + ttl;
        cache.set(key, { value, expiry });
    }

    get(key) {
        const item = cache.get(key);
        if (!item) return null;

        if (Date.now() > item.expiry) {
            cache.delete(key);
            return null;
        }

        return item.value;
    }

    del(key) {
        cache.delete(key);
    }

    flush() {
        cache.clear();
    }
}

module.exports = new CacheService();
