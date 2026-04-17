// middleware/rateLimit.js
const rateLimit = require('express-rate-limit');
const config = require('../config');

// Общий лимит для API
const apiLimiter = rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW,
    limit: config.RATE_LIMIT_MAX, // используем 'limit' вместо 'max' для новых версий
    message: { error: 'Слишком много запросов, попробуйте позже' },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    // Убираем кастомный keyGenerator, чтобы использовать безопасный стандартный
    skip: (req) => {
        return req.session && req.session.user && req.session.user.role === 'admin';
    },
    // Отключаем конкретную проверку, которая вызывала ошибку
    validate: { keyGeneratorIpFallback: false }
});

// Лимит для отправки отзывов (строгий)
const reviewLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    message: { error: 'Вы слишком часто оставляете отзывы. Попробуйте через час.' },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    validate: { keyGeneratorIpFallback: false }
});

// Лимит для DMCA жалоб
const dmcaLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    limit: 3,
    message: { error: 'Вы слишком часто отправляете DMCA жалобы. Попробуйте завтра.' },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    validate: { keyGeneratorIpFallback: false }
});

// Строгий лимит для чувствительных операций (логин, регистрация)
const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    message: { error: 'Слишком много попыток. Подождите 15 минут.' },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    validate: { keyGeneratorIpFallback: false }
});

// Лимит для поиска
const searchLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 100,
    message: { error: 'Слишком много поисковых запросов. Попробуйте позже.' },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    validate: { keyGeneratorIpFallback: false }
});

// Лимит для админки (более строгий)
const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    message: { error: 'Слишком много запросов к админке' },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: (req) => {
        return req.session && req.session.user && req.session.user.role === 'admin';
    },
    validate: { keyGeneratorIpFallback: false }
});

// Лимит для создания серверов
const createServerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 20,
    message: { error: 'Слишком много попыток создания серверов' },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    validate: { keyGeneratorIpFallback: false }
});

// Лимит для статических страниц (мягкий)
const pageLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 500,
    message: { error: 'Слишком много запросов' },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: (req) => {
        const userAgent = req.headers['user-agent'] || '';
        const bots = ['Googlebot', 'YandexBot', 'YandexAccessibilityBot', 'bingbot', 'Baiduspider'];
        return bots.some(bot => userAgent.includes(bot));
    },
    validate: { keyGeneratorIpFallback: false }
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