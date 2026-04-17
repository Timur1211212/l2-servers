// controllers/pageController.js - добавьте эти методы в конец файла

async function topServers(req, res) {
    try {
        const Server = require('../models/Server');
        const servers = await Server.find({ active: true })
            .sort({ 'rating.average': -1, 'rating.count': -1 })
            .limit(100)
            .lean();
        
        const { generateListPage } = require('../views/pages/listPage');
        const html = generateListPage(servers, '🏆 Топ серверы Lineage 2', 'Лучшие серверы по рейтингу и отзывам игроков', 'top');
        res.send(html);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
}

async function newServers(req, res) {
    try {
        const Server = require('../models/Server');
        const servers = await Server.find({ active: true })
            .sort({ openingDate: -1, createdAt: -1 })
            .limit(100)
            .lean();
        
        const { generateListPage } = require('../views/pages/listPage');
        const html = generateListPage(servers, '🆕 Новые серверы Lineage 2', 'Свежие открытия серверов с лучшими условиями для старта', 'new');
        res.send(html);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
}

async function allServers(req, res) {
    try {
        const Server = require('../models/Server');
        const servers = await Server.find({ active: true })
            .sort({ createdAt: -1 })
            .lean();
        
        const { generateListPage } = require('../views/pages/listPage');
        const html = generateListPage(servers, '📋 Все серверы Lineage 2', 'Полный каталог серверов Lineage 2 с рейтингами и отзывами', 'all');
        res.send(html);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
}

async function vipServers(req, res) {
    try {
        const Server = require('../models/Server');
        const servers = await Server.find({ active: true, status: 'VIP' })
            .sort({ 'rating.average': -1 })
            .lean();
        
        const { generateListPage } = require('../views/pages/listPage');
        const html = generateListPage(servers, '⭐ VIP серверы Lineage 2', 'Лучшие VIP серверы с высокой стабильностью и большим онлайном', 'vip');
        res.send(html);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
}

async function pvpServers(req, res) {
    try {
        const Server = require('../models/Server');
        const servers = await Server.find({ 
            active: true,
            status: { $in: ['VIP', 'Почти VIP'] }
        }).sort({ 'rating.average': -1 }).lean();
        
        const { generateListPage } = require('../views/pages/listPage');
        const html = generateListPage(servers, '⚔️ PvP серверы Lineage 2', 'Лучшие PvP серверы для массовых сражений и осад', 'pvp');
        res.send(html);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
}

// Экспортируем все методы
module.exports = {
    home,
    server,
    interlude,
    highFive,
    classic,
    essence,
    topServers,
    newServers,
    allServers,
    vipServers,
    pvpServers,
    about: (req, res) => res.sendFile('about.html', { root: './public' }),
    download: (req, res) => res.sendFile('download.html', { root: './public' }),
    contacts: (req, res) => res.sendFile('contacts.html', { root: './public' }),
    privacy: (req, res) => res.sendFile('privacy.html', { root: './public' }),
    terms: (req, res) => res.sendFile('terms.html', { root: './public' }),
    disclaimer: (req, res) => res.sendFile('disclaimer.html', { root: './public' }),
    dmca: (req, res) => res.sendFile('dmca.html', { root: './public' }),
    cookies: (req, res) => res.sendFile('cookies.html', { root: './public' }),
    sitemap,
    robots
};