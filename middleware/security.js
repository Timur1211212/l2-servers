// middleware/security.js
const config = require('../config');

// Защита от SQL инъекций (простая проверка)
const preventSqlInjection = (req, res, next) => {
    const sqlPatterns = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b|--|;)/i;
    
    const checkValue = (value) => {
        if (typeof value === 'string' && sqlPatterns.test(value)) {
            return true;
        }
        return false;
    };
    
    const checkObject = (obj) => {
        if (!obj) return false;
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (checkValue(obj[key])) return true;
                if (typeof obj[key] === 'object' && checkObject(obj[key])) return true;
            }
        }
        return false;
    };
    
    if (req.query && checkObject(req.query)) {
        return res.status(400).json({ error: 'Invalid characters in query' });
    }
    
    if (req.body && checkObject(req.body)) {
        return res.status(400).json({ error: 'Invalid characters in request body' });
    }
    
    next();
};

// Защита от NoSQL инъекций
const preventNoSqlInjection = (req, res, next) => {
    const dangerousKeys = ['$where', '$regex', '$ne', '$gt', '$lt', '$in', '$nin', '$or', '$and'];
    
    const checkObject = (obj) => {
        if (!obj) return false;
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (dangerousKeys.includes(key)) {
                    return true;
                }
                if (typeof obj[key] === 'object' && checkObject(obj[key])) return true;
            }
        }
        return false;
    };
    
    if (req.query && checkObject(req.query)) {
        return res.status(400).json({ error: 'Invalid query parameters' });
    }
    
    if (req.body && checkObject(req.body)) {
        return res.status(400).json({ error: 'Invalid request body' });
    }
    
    next();
};

// Ограничение размера тела запроса
const bodySizeLimiter = (req, res, next) => {
    const maxSize = 1024 * 1024; // 1MB
    
    if (req.headers['content-length'] && parseInt(req.headers['content-length']) > maxSize) {
        return res.status(413).json({ error: 'Request body too large' });
    }
    
    next();
};

// Добавление security.txt
const securityTxt = (req, res, next) => {
    if (req.path === '/security.txt' || req.path === '/.well-known/security.txt') {
        res.type('text/plain');
        res.send(`
Contact: mailto:Zerokulchik@yandex.ru
Contact: https://t.me/ZerokulL2
Expires: 2026-12-31T00:00:00.000Z
Preferred-Languages: ru, en
Canonical: https://${config.DOMAIN}/security.txt
        `);
        return;
    }
    next();
};

module.exports = {
    preventSqlInjection,
    preventNoSqlInjection,
    bodySizeLimiter,
    securityTxt
};