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
const { preventSqlInjection, preventNoSqlInjection, bodySizeLimiter } = require('./middleware/security');
const { pageLimiter } = require('./middleware/rateLimit');

// Контроллеры для динамических страниц
const pageController = require('./controllers/pageController');

// Маршруты API
const apiRoutes = require('./routes/api');

const app = express();

// =============== MIDDLEWARE ===============

app.use(helmet({
    contentSecurityPolicy: false,
    xFrameOptions: { action: 'sameorigin' }
}));

app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    next();
});

app.use(preventSqlInjection);
app.use(preventNoSqlInjection);
app.use(bodySizeLimiter);
app.use(compression());
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
        secure: false,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
    },
    store: MongoStore.create({ mongoUrl: config.MONGODB_URI })
}));

app.use(pageLimiter);

// Статика
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '30d',
    immutable: true
}));

// =============== МАРШРУТЫ ===============

// API маршруты
app.use('/api', apiRoutes);

// =============== ДИНАМИЧЕСКИЕ СТРАНИЦЫ (HTML) ===============

// Главная
app.get('/', pageController.home);

// Страница сервера
app.get('/server/:slug', pageController.server);

// Страницы версий
app.get('/version/interlude', pageController.interlude);
app.get('/version/high-five', pageController.highFive);
app.get('/version/classic', pageController.classic);
app.get('/version/essence', pageController.essence);

// Страницы списков
app.get('/top-servers', pageController.topServers);
app.get('/new-servers', pageController.newServers);
app.get('/all-servers', pageController.allServers);
app.get('/vip-servers', pageController.vipServers);
app.get('/pvp-servers', pageController.pvpServers);

// Статические страницы (отдаём HTML из public)
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'public', 'about.html')));
app.get('/contacts', (req, res) => res.sendFile(path.join(__dirname, 'public', 'contacts.html')));
app.get('/privacy', (req, res) => res.sendFile(path.join(__dirname, 'public', 'privacy.html')));
app.get('/terms', (req, res) => res.sendFile(path.join(__dirname, 'public', 'terms.html')));
app.get('/disclaimer', (req, res) => res.sendFile(path.join(__dirname, 'public', 'disclaimer.html')));
app.get('/dmca', (req, res) => res.sendFile(path.join(__dirname, 'public', 'dmca.html')));
app.get('/cookies', (req, res) => res.sendFile(path.join(__dirname, 'public', 'cookies.html')));
app.get('/download', (req, res) => res.sendFile(path.join(__dirname, 'public', 'download.html')));

// Админ панель
app.get('/admin-main', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin-main.html')));

// Sitemap и robots
app.get('/sitemap.xml', pageController.sitemap);
app.get('/robots.txt', pageController.robots);

// Редиректы
app.get('/index.html', (req, res) => res.redirect(301, '/'));
app.get('/server/:id([0-9a-fA-F]{24})', async (req, res) => {
    try {
        const Server = require('./models/Server');
        const server = await Server.findById(req.params.id);
        if (server && server.slug) {
            return res.redirect(301, `/server/${server.slug}`);
        }
        res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
    } catch {
        res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
    }
});

// 404
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// 500
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