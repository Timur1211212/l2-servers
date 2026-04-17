// middleware/cache.js
const NodeCache = require('node-cache');
const config = require('../config');

// Основной кэш для страниц
const pageCache = new NodeCache({ 
    stdTTL: config.CACHE_TTL, 
    checkperiod: config.CACHE_CHECK_PERIOD,
    useClones: false
});

// Кэш для API запросов (более короткий TTL)
const apiCache = new NodeCache({ 
    stdTTL: 300, // 5 минут
    checkperiod: 60
});

// Кэш для тяжелых запросов (например, статистика)
const heavyCache = new NodeCache({ 
    stdTTL: 3600, // 1 час
    checkperiod: 300
});

// Middleware для кэширования страниц
function cachePage(ttl = config.CACHE_TTL, keyGenerator = null) {
    return (req, res, next) => {
        // Не кэшируем для авторизованных пользователей (админка)
        if (req.session && req.session.user) {
            return next();
        }
        
        // Генерируем ключ кэша
        const cacheKey = keyGenerator 
            ? keyGenerator(req) 
            : `page:${req.originalUrl}`;
        
        // Пробуем получить из кэша
        const cached = pageCache.get(cacheKey);
        if (cached) {
            console.log(`[CACHE HIT] ${cacheKey}`);
            return res.send(cached);
        }
        
        console.log(`[CACHE MISS] ${cacheKey}`);
        
        // Перехватываем отправку ответа
        const originalSend = res.send;
        res.send = function(body) {
            // Кэшируем только успешные ответы
            if (res.statusCode === 200 && typeof body === 'string') {
                pageCache.set(cacheKey, body, ttl);
            }
            originalSend.call(this, body);
        };
        next();
    };
}

// Middleware для кэширования API ответов
function cacheApi(ttl = 300) {
    return (req, res, next) => {
        const cacheKey = `api:${req.method}:${req.originalUrl}`;
        
        const cached = apiCache.get(cacheKey);
        if (cached) {
            return res.json(cached);
        }
        
        const originalJson = res.json;
        res.json = function(data) {
            if (res.statusCode === 200) {
                apiCache.set(cacheKey, data, ttl);
            }
            originalJson.call(this, data);
        };
        next();
    };
}

// Инвалидация кэша по паттерну
function invalidateCache(pattern) {
    const keys = pageCache.keys();
    const matchedKeys = keys.filter(key => key.includes(pattern));
    
    if (matchedKeys.length > 0) {
        pageCache.del(matchedKeys);
        console.log(`[CACHE INVALIDATE] Removed ${matchedKeys.length} keys matching pattern: ${pattern}`);
    }
    
    // Также инвалидируем API кэш
    const apiKeys = apiCache.keys();
    const matchedApiKeys = apiKeys.filter(key => key.includes(pattern));
    if (matchedApiKeys.length > 0) {
        apiCache.del(matchedApiKeys);
    }
}

// Инвалидация кэша сервера при его изменении
function invalidateServerCache(serverSlug) {
    // Удаляем страницу сервера
    pageCache.del(`page:/server/${serverSlug}`);
    
    // Удаляем страницы списков
    const listPatterns = ['/top-servers', '/new-servers', '/all-servers', '/vip-servers', '/pvp-servers'];
    listPatterns.forEach(pattern => {
        const keys = pageCache.keys();
        const matched = keys.filter(key => key.includes(pattern));
        if (matched.length) pageCache.del(matched);
    });
    
    // Удаляем страницы версий
    const versionPatterns = ['/version/interlude', '/version/high-five', '/version/classic', '/version/essence'];
    versionPatterns.forEach(pattern => {
        const keys = pageCache.keys();
        const matched = keys.filter(key => key.includes(pattern));
        if (matched.length) pageCache.del(matched);
    });
    
    console.log(`[CACHE INVALIDATE] Server cache invalidated for: ${serverSlug}`);
}

// Инвалидация кэша версии
function invalidateVersionCache(version) {
    const versionSlug = version.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const pattern = `/version/${versionSlug}`;
    
    const keys = pageCache.keys();
    const matched = keys.filter(key => key.includes(pattern));
    if (matched.length) {
        pageCache.del(matched);
        console.log(`[CACHE INVALIDATE] Version cache invalidated for: ${version}`);
    }
}

// Полная очистка кэша
function flushAllCache() {
    pageCache.flushAll();
    apiCache.flushAll();
    heavyCache.flushAll();
    console.log('[CACHE FLUSH] All caches cleared');
}

// Получение статистики кэша
function getCacheStats() {
    return {
        pageCache: {
            keys: pageCache.keys().length,
            hits: pageCache.getStats().hits,
            misses: pageCache.getStats().misses,
            ksize: pageCache.getStats().ksize,
            vsize: pageCache.getStats().vsize
        },
        apiCache: {
            keys: apiCache.keys().length
        },
        heavyCache: {
            keys: heavyCache.keys().length
        }
    };
}

// Middleware для добавления заголовков кэширования
function addCacheHeaders(maxAge = 3600) {
    return (req, res, next) => {
        res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
        res.setHeader('Vary', 'Accept-Encoding');
        next();
    };
}

// Middleware для кэширования с условием (только для гостей)
function cacheForGuests(ttl = 3600) {
    return (req, res, next) => {
        if (req.session && req.session.user) {
            return next();
        }
        return cachePage(ttl)(req, res, next);
    };
}

module.exports = {
    pageCache,
    apiCache,
    heavyCache,
    cache: cachePage,        // алиас для обратной совместимости
    cachePage,
    cacheApi,
    invalidateCache,
    invalidateServerCache,
    invalidateVersionCache,
    flushAllCache,
    getCacheStats,
    addCacheHeaders,
    cacheForGuests
};