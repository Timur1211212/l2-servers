// services/cacheService.js
const NodeCache = require('node-cache');
const config = require('../config');

// Основной кэш для страниц
const pageCache = new NodeCache({ 
    stdTTL: config.CACHE_TTL, 
    checkperiod: config.CACHE_CHECK_PERIOD,
    useClones: false
});

// Кэш для API запросов
const apiCache = new NodeCache({ 
    stdTTL: 300,
    checkperiod: 60
});

// Middleware для кэширования страниц
function cachePage(ttl = config.CACHE_TTL) {
    return (req, res, next) => {
        if (req.session && req.session.user) {
            return next();
        }
        
        const cacheKey = `page:${req.originalUrl}`;
        const cached = pageCache.get(cacheKey);
        
        if (cached) {
            return res.send(cached);
        }
        
        const originalSend = res.send;
        res.send = function(body) {
            if (res.statusCode === 200 && typeof body === 'string') {
                pageCache.set(cacheKey, body, ttl);
            }
            originalSend.call(this, body);
        };
        next();
    };
}

// Функция инвалидации кэша по паттерну
function invalidateCache(pattern) {
    const keys = pageCache.keys();
    const matchedKeys = keys.filter(key => key.includes(pattern));
    
    if (matchedKeys.length > 0) {
        pageCache.del(matchedKeys);
        console.log(`[CACHE] Invalidated ${matchedKeys.length} keys matching: ${pattern}`);
    }
    
    // Также инвалидируем API кэш
    const apiKeys = apiCache.keys();
    const matchedApiKeys = apiKeys.filter(key => key.includes(pattern));
    if (matchedApiKeys.length > 0) {
        apiCache.del(matchedApiKeys);
    }
}

// Функция инвалидации кэша сервера
function invalidateServerCache(slug) {
    invalidateCache(`/server/${slug}`);
    invalidateCache('/top-servers');
    invalidateCache('/new-servers');
    invalidateCache('/all-servers');
    invalidateCache('/vip-servers');
    invalidateCache('/pvp-servers');
    invalidateCache('/version/interlude');
    invalidateCache('/version/high-five');
    invalidateCache('/version/classic');
    invalidateCache('/version/essence');
}

// Полная очистка кэша
function flushCache() {
    pageCache.flushAll();
    apiCache.flushAll();
    console.log('[CACHE] Full cache flushed');
}

module.exports = {
    cachePage,
    invalidateCache,
    invalidateServerCache,
    flushCache,
    pageCache,
    apiCache
};