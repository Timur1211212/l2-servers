// config/session.js
const session = require('express-session');
const MongoStore = require('connect-mongo');
const config = require('./index');

const sessionConfig = {
    name: 'l2session',
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: config.isProd,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 часа
        domain: config.isProd ? config.DOMAIN : undefined
    },
    store: MongoStore.create({ 
        mongoUrl: config.MONGODB_URI,
        ttl: 24 * 60 * 60, // 24 часа в секундах
        touchAfter: 3600 // обновлять сессию не чаще раза в час
    })
};

// Дополнительные настройки для production
if (config.isProd) {
    sessionConfig.cookie.secure = true;
    sessionConfig.proxy = true;
}

module.exports = sessionConfig;