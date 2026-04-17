// services/cacheService.js
const NodeCache = require('node-cache');
const config = require('../config');

class CacheService {
    constructor() {
        this.cache = new NodeCache({ 
            stdTTL: config.CACHE_TTL, 
            checkperiod: config.CACHE_CHECK_PERIOD 
        });
    }
    
    get(key) {
        return this.cache.get(key);
    }
    
    set(key, value, ttl = config.CACHE_TTL) {
        this.cache.set(key, value, ttl);
    }
    
    delete(key) {
        this.cache.del(key);
    }
    
    flush() {
        this.cache.flushAll();
    }
    
    // Инвалидация по паттерну
    deletePattern(pattern) {
        const keys = this.cache.keys();
        const matchedKeys = keys.filter(key => key.includes(pattern));
        this.cache.del(matchedKeys);
    }
    
    // Middleware для кэширования ответов
    cache(ttl = config.CACHE_TTL) {
        return (req, res, next) => {
            const key = `page:${req.originalUrl}`;
            const cached = this.get(key);
            
            if (cached) {
                return res.send(cached);
            }
            
            const originalSend = res.send;
            res.send = (body) => {
                if (res.statusCode === 200) {
                    this.set(key, body, ttl);
                }
                originalSend.call(res, body);
            };
            next();
        };
    }
}

module.exports = new CacheService();