// routes/pages.js
const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const cacheService = require('../middleware/cache');

// =============== Основные страницы ===============

// Главная
router.get('/', cacheService.cachePage(3600), pageController.home);

// Страница сервера (кэш 5 минут)
router.get('/server/:slug', cacheService.cachePage(300), pageController.server);

// =============== Страницы версий ===============

router.get('/version/interlude', cacheService.cachePage(3600), pageController.interlude);
router.get('/version/high-five', cacheService.cachePage(3600), pageController.highFive);
router.get('/version/classic', cacheService.cachePage(3600), pageController.classic);
router.get('/version/essence', cacheService.cachePage(3600), pageController.essence);

// =============== Страницы списков ===============

router.get('/top-servers', cacheService.cachePage(1800), pageController.topServers);
router.get('/new-servers', cacheService.cachePage(1800), pageController.newServers);
router.get('/all-servers', cacheService.cachePage(3600), pageController.allServers);
router.get('/vip-servers', cacheService.cachePage(3600), pageController.vipServers);
router.get('/pvp-servers', cacheService.cachePage(3600), pageController.pvpServers);

// =============== Статические страницы ===============

router.get('/about', pageController.about);
router.get('/download', pageController.download);
router.get('/contacts', pageController.contacts);
router.get('/privacy', pageController.privacy);
router.get('/terms', pageController.terms);
router.get('/disclaimer', pageController.disclaimer);
router.get('/dmca', pageController.dmca);
router.get('/cookies', pageController.cookies);

// =============== SEO страницы ===============

router.get('/sitemap.xml', pageController.sitemap);
router.get('/robots.txt', pageController.robots);

// =============== Реддиректы ===============

// Редирект со старого формата URL на новый
router.get('/server/:id([0-9a-fA-F]{24})', async (req, res) => {
    try {
        const Server = require('../models/Server');
        const server = await Server.findById(req.params.id);
        if (server && server.slug) {
            return res.redirect(301, `/server/${server.slug}`);
        }
        res.status(404).sendFile('404.html', { root: './public' });
    } catch {
        res.status(404).sendFile('404.html', { root: './public' });
    }
});

// Редирект с index.html на /
router.get('/index.html', (req, res) => {
    res.redirect(301, '/');
});

// =============== Админ панель ===============

router.get('/admin-main', (req, res) => {
    res.sendFile('admin-main.html', { root: './public' });
});

module.exports = router;