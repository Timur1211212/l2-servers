// server.js
const express = require('express');
const path = require('path');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const helmet = require('helmet');
require('dotenv').config();

const config = require('./config');
const { connectDB } = require('./config/database');
const { preventSqlInjection, preventNoSqlInjection, bodySizeLimiter, securityTxt } = require('./middleware/security');
const { pageLimiter } = require('./middleware/rateLimit');

// Маршруты
const apiRoutes = require('./routes/api');
const pageRoutes = require('./routes/pages');
const seoRoutes = require('./routes/seoPages');

const app = express();

// =============== MIDDLEWARE ===============

// Helmet - безопасность (должен быть первым)
app.use(helmet({
    contentSecurityPolicy: false,
    xFrameOptions: { action: 'sameorigin' }
}));

// Дополнительные заголовки безопасности
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    res.setHeader('X-DNS-Prefetch-Control', 'off');
    next();
});

// Защита от инъекций
app.use(preventSqlInjection);
app.use(preventNoSqlInjection);
app.use(bodySizeLimiter);

// Security.txt
app.use(securityTxt);

// Компрессия
app.use(compression());

// Парсеры
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Сессии
app.use(session({
    name: 'l2session',
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: config.isProd,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
    },
    store: MongoStore.create({ 
        mongoUrl: config.MONGODB_URI,
        ttl: 24 * 60 * 60
    })
}));

// Лимит запросов для страниц
app.use(pageLimiter);

// Статика
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '30d',
    immutable: true,
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'public, max-age=3600');
        }
        if (filePath.match(/\.(css|js)$/)) {
            res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
        }
        if (filePath.match(/\.(jpg|jpeg|png|gif|ico|svg|webp)$/)) {
            res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
        }
    }
}));

// =============== МАРШРУТЫ ===============
app.use('/api', apiRoutes);
app.use('/', pageRoutes);
app.use('/', seoRoutes);

// =============== 404 ===============
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// =============== 500 ===============
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).sendFile(path.join(__dirname, 'public', '50x.html'));
});

// =============== ЗАПУСК ===============
const startServer = async () => {
    try {
        await connectDB();
        
        // Создаем админа если нет
        const User = require('./models/User');
        const bcrypt = require('bcryptjs');
        const adminExists = await User.findOne({ username: 'admin' });
        if (!adminExists) {
            const hash = await bcrypt.hash(config.ADMIN_PASSWORD, 10);
            await User.create({ username: 'admin', password: hash });
            console.log('✅ Admin user created');
        }
        
        // Обновляем рейтинги
        const { updateAllRatings } = require('./services/ratingService');
        await updateAllRatings();
        
        app.listen(config.PORT, () => {
            console.log(`🚀 Server running on port ${config.PORT}`);
            console.log(`📍 http://localhost:${config.PORT}`);
        });
        
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();