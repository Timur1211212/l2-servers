// server.js
const express = require('express');
const path = require('path');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const helmet = require('helmet');
const http = require('http');
const https = require('https');
require('dotenv').config();

const config = require('./config');
const { connectDB } = require('./config/database');
const sessionConfig = require('./config/session');
const { preventSqlInjection, preventNoSqlInjection, bodySizeLimiter, securityTxt } = require('./middleware/security');
const { pageLimiter } = require('./middleware/rateLimit');

// Маршруты
const apiRoutes = require('./routes/api');
const pageRoutes = require('./routes/pages');
const seoRoutes = require('./routes/seoPages');

const app = express();

// =============== MIDDLEWARE ===============

// Helmet
app.use(helmet({
    contentSecurityPolicy: false,
    xFrameOptions: { action: 'sameorigin' }
}));

// Заголовки безопасности
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
});

// Защита
app.use(preventSqlInjection);
app.use(preventNoSqlInjection);
app.use(bodySizeLimiter);
app.use(securityTxt);

// Компрессия
app.use(compression());

// Парсеры
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Сессии
app.use(session(sessionConfig));

// Rate limiting
app.use(pageLimiter);

// Статика - ВАЖНО: должна быть до маршрутов, но после middleware
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '30d',
    immutable: true
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
        
        const User = require('./models/User');
        const bcrypt = require('bcryptjs');
        const adminExists = await User.findOne({ username: 'admin' });
        if (!adminExists) {
            const hash = await bcrypt.hash(config.ADMIN_PASSWORD, 10);
            await User.create({ username: 'admin', password: hash });
            console.log('✅ Admin user created');
        }
        
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