// middleware/rateLimit.js
const rateLimit = require('express-rate-limit');
const config = require('../config');

// Общий лимит для API
const apiLimiter = rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW,
    max: config.RATE_LIMIT_MAX,
    message: { error: 'Слишком много запросов, попробуйте позже' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Правильная обработка IPv6
        return req.ip;
    },
    skip: (req) => {
        // Пропускаем лимит для админов
        return req.session && req.session.user && req.session.user.role === 'admin';
    }
});

// Лимит для отправки отзывов (строгий)
const reviewLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 час
    max: 5,
    message: { error: 'Вы слишком часто оставляете отзывы. Попробуйте через час.' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.ip;
    }
});

// Лимит для DMCA жалоб
const dmcaLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 часа
    max: 3,
    message: { error: 'Вы слишком часто отправляете DMCA жалобы. Попробуйте завтра.' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.ip;
    }
});

// Строгий лимит для чувствительных операций (логин, регистрация)
const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 10,
    message: { error: 'Слишком много попыток. Подождите 15 минут.' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.ip;
    }
});

// Лимит для поиска
const searchLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 час
    max: 100,
    message: { error: 'Слишком много поисковых запросов. Попробуйте позже.' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.ip;
    }
});

// Лимит для админки (более строгий)
const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { error: 'Слишком много запросов к админке' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.ip;
    },
    skip: (req) => {
        // Пропускаем для админов
        return req.session && req.session.user && req.session.user.role === 'admin';
    }
});

// Лимит для создания серверов (только для админов, но все равно лимит)
const createServerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 20,
    message: { error: 'Слишком много попыток создания серверов' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.ip;
    }
});

// Лимит для статических страниц (мягкий)
const pageLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 500,
    message: { error: 'Слишком много запросов' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.ip;
    },
    skip: (req) => {
        // Пропускаем поисковых ботов
        const userAgent = req.headers['user-agent'] || '';
        const bots = ['Googlebot', 'YandexBot', 'YandexAccessibilityBot', 'bingbot', 'Baiduspider'];
        return bots.some(bot => userAgent.includes(bot));
    }
});

module.exports = {
    apiLimiter,
    reviewLimiter,
    dmcaLimiter,
    strictLimiter,
    searchLimiter,
    adminLimiter,
    createServerLimiter,
    pageLimiter
};