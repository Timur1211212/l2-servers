// routes/seoPages.js
const express = require('express');
const router = express.Router();
const Server = require('../models/Server');
const { baseLayout } = require('../views/layouts/baseLayout');
const { renderBreadcrumbs } = require('../views/components/breadcrumbs');
const { serverCard } = require('../views/components/serverCard');
const { generateSeoText, generateVersionH1, generateItemListSchema } = require('../utils/seoHelpers');
const cacheService = require('../middleware/cache');

// =============== Кластерные страницы для Interlude ===============

// Interlude x1
router.get('/version/interlude/x1', cacheService.cachePage(3600), async (req, res) => {
    const servers = await Server.find({ 
        active: true,
        version: /interlude/i,
        exp: 'x1'
    }).sort({ 'rating.average': -1 }).lean();
    
    const content = `
        <h1>${generateVersionH1('Interlude', 'x1')}</h1>
        <p class="subtitle">Хардкорные серверы Interlude с классическими рейтами x1</p>
        <div class="servers-grid">
            ${servers.map(s => serverCard(s)).join('')}
        </div>
        ${generateSeoText('Interlude', servers.length)}
    `;
    
    const schema = generateItemListSchema(servers, 'Серверы Interlude x1', 'Хардкорные серверы с рейтами x1');
    
    res.send(baseLayout({
        title: 'Серверы Lineage 2 Interlude x1 2026 — хардкорные проекты',
        description: 'Коллекция серверов Interlude с классическими рейтами x1. Хардкорная прокачка, честная экономика, отсутствие доната.',
        canonical: '/version/interlude/x1',
        breadcrumbs: renderBreadcrumbs([
            { name: 'Главная', url: '/' },
            { name: 'Interlude', url: '/version/interlude' },
            { name: 'x1 серверы', url: '/version/interlude/x1' }
        ]),
        content,
        schema
    }));
});

// Interlude x100
router.get('/version/interlude/x100', cacheService.cachePage(3600), async (req, res) => {
    const servers = await Server.find({ 
        active: true,
        version: /interlude/i,
        exp: { $regex: /x100/i }
    }).sort({ 'rating.average': -1 }).lean();
    
    const content = `
        <h1>${generateVersionH1('Interlude', 'x100')}</h1>
        <p class="subtitle">Серверы Interlude с рейтами x100 — оптимальный баланс</p>
        <div class="servers-grid">
            ${servers.map(s => serverCard(s)).join('')}
        </div>
        ${generateSeoText('Interlude', servers.length)}
    `;
    
    res.send(baseLayout({
        title: 'Серверы Lineage 2 Interlude x100 2026 — быстрая прокачка',
        description: 'Лучшие серверы Interlude с рейтами x100. Оптимальный баланс между временем на прокачку и удовольствием от игры.',
        canonical: '/version/interlude/x100',
        breadcrumbs: renderBreadcrumbs([
            { name: 'Главная', url: '/' },
            { name: 'Interlude', url: '/version/interlude' },
            { name: 'x100 серверы', url: '/version/interlude/x100' }
        ]),
        content
    }));
});

// Interlude x1000
router.get('/version/interlude/x1000', cacheService.cachePage(3600), async (req, res) => {
    const servers = await Server.find({ 
        active: true,
        version: /interlude/i,
        exp: { $regex: /x1000/i }
    }).sort({ 'rating.average': -1 }).lean();
    
    const content = `
        <h1>${generateVersionH1('Interlude', 'x1000')}</h1>
        <p class="subtitle">PvP серверы Interlude с максимальными рейтами x1000</p>
        <div class="servers-grid">
            ${servers.map(s => serverCard(s)).join('')}
        </div>
        ${generateSeoText('Interlude', servers.length)}
    `;
    
    res.send(baseLayout({
        title: 'Серверы Lineage 2 Interlude x1000 2026 — PvP серверы',
        description: 'Лучшие PvP серверы Interlude с рейтами x1000. Максимальная динамика, массовые сражения с первых минут.',
        canonical: '/version/interlude/x1000',
        breadcrumbs: renderBreadcrumbs([
            { name: 'Главная', url: '/' },
            { name: 'Interlude', url: '/version/interlude' },
            { name: 'x1000 серверы', url: '/version/interlude/x1000' }
        ]),
        content
    }));
});

// =============== Кластерные страницы для High Five ===============

// High Five x100
router.get('/version/high-five/x100', cacheService.cachePage(3600), async (req, res) => {
    const servers = await Server.find({ 
        active: true,
        version: /high five|hf/i,
        exp: { $regex: /x100/i }
    }).sort({ 'rating.average': -1 }).lean();
    
    const content = `
        <h1>${generateVersionH1('High Five', 'x100')}</h1>
        <p class="subtitle">Серверы High Five с рейтами x100</p>
        <div class="servers-grid">
            ${servers.map(s => serverCard(s)).join('')}
        </div>
        ${generateSeoText('High Five', servers.length)}
    `;
    
    res.send(baseLayout({
        title: 'Серверы Lineage 2 High Five x100 2026',
        description: 'Лучшие серверы High Five с рейтами x100. Оптимальный выбор для комфортной игры.',
        canonical: '/version/high-five/x100',
        breadcrumbs: renderBreadcrumbs([
            { name: 'Главная', url: '/' },
            { name: 'High Five', url: '/version/high-five' },
            { name: 'x100 серверы', url: '/version/high-five/x100' }
        ]),
        content
    }));
});

// =============== Кластерные страницы для VIP серверов ===============

// VIP серверы Interlude
router.get('/vip-servers/interlude', cacheService.cachePage(3600), async (req, res) => {
    const servers = await Server.find({ 
        active: true,
        status: 'VIP',
        version: /interlude/i
    }).sort({ 'rating.average': -1 }).lean();
    
    const content = `
        <h1>VIP серверы Lineage 2 Interlude 2026</h1>
        <p class="subtitle">Лучшие VIP проекты с высоким онлайном и стабильностью</p>
        <div class="servers-grid">
            ${servers.map(s => serverCard(s)).join('')}
        </div>
        <div class="seo-content">
            <h2>Почему стоит выбрать VIP сервер Interlude?</h2>
            <p>VIP серверы отличаются высокой стабильностью, профессиональной администрацией, регулярными обновлениями и большим онлайн-сообществом. Это лучший выбор для тех, кто ценит качество игры.</p>
            <p>На VIP серверах вы получите: быструю поддержку, отсутствие лагов, регулярные ивенты и честную игру без читеров.</p>
        </div>
    `;
    
    res.send(baseLayout({
        title: 'VIP серверы Lineage 2 Interlude 2026 — топовые проекты',
        description: 'Рейтинг VIP серверов Interlude с высоким онлайном, стабильной работой и лучшими условиями для игры.',
        canonical: '/vip-servers/interlude',
        breadcrumbs: renderBreadcrumbs([
            { name: 'Главная', url: '/' },
            { name: 'VIP серверы', url: '/vip-servers' },
            { name: 'Interlude', url: '/vip-servers/interlude' }
        ]),
        content
    }));
});

// VIP серверы High Five
router.get('/vip-servers/high-five', cacheService.cachePage(3600), async (req, res) => {
    const servers = await Server.find({ 
        active: true,
        status: 'VIP',
        version: /high five|hf/i
    }).sort({ 'rating.average': -1 }).lean();
    
    const content = `
        <h1>VIP серверы Lineage 2 High Five 2026</h1>
        <p class="subtitle">Премиальные High Five серверы</p>
        <div class="servers-grid">
            ${servers.map(s => serverCard(s)).join('')}
        </div>
        ${generateSeoText('High Five', servers.length)}
    `;
    
    res.send(baseLayout({
        title: 'VIP серверы Lineage 2 High Five 2026',
        description: 'Лучшие VIP серверы High Five с высоким качеством обслуживания и большим онлайном.',
        canonical: '/vip-servers/high-five',
        breadcrumbs: renderBreadcrumbs([
            { name: 'Главная', url: '/' },
            { name: 'VIP серверы', url: '/vip-servers' },
            { name: 'High Five', url: '/vip-servers/high-five' }
        ]),
        content
    }));
});

// =============== Кластерные страницы для PvP серверов ===============

// PvP серверы High Five
router.get('/pvp-servers/high-five', cacheService.cachePage(3600), async (req, res) => {
    const servers = await Server.find({ 
        active: true,
        version: /high five|hf/i,
        status: { $in: ['VIP', 'Почти VIP'] }
    }).sort({ 'rating.average': -1 }).lean();
    
    const content = `
        <h1>PvP серверы Lineage 2 High Five 2026</h1>
        <p class="subtitle">Лучшие проекты для массовых сражений и осад</p>
        <div class="servers-grid">
            ${servers.map(s => serverCard(s)).join('')}
        </div>
        <div class="seo-content">
            <h2>High Five — лучшая версия для PvP</h2>
            <p>High Five считается одной из самых сбалансированных версий для PvP. Уникальные классы, система олимпиад и массовые осады замков.</p>
            <p>На PvP серверах High Five вы найдете: ежедневные массовые PvP, регулярные осады, систему олимпиад и рейтинговые бои.</p>
        </div>
    `;
    
    res.send(baseLayout({
        title: 'PvP серверы Lineage 2 High Five 2026 — массовые сражения',
        description: 'Топ PvP серверов High Five для любителей массовых сражений, осад замков и олимпиад. Лучшие проекты с активным PvP.',
        canonical: '/pvp-servers/high-five',
        breadcrumbs: renderBreadcrumbs([
            { name: 'Главная', url: '/' },
            { name: 'PvP серверы', url: '/pvp-servers' },
            { name: 'High Five', url: '/pvp-servers/high-five' }
        ]),
        content
    }));
});

// =============== Кластерные страницы для новых серверов ===============

// Новые серверы 2026
router.get('/new-servers/2026', cacheService.cachePage(3600), async (req, res) => {
    const servers = await Server.find({ 
        active: true,
        openingDate: { $gte: new Date('2026-01-01') }
    }).sort({ openingDate: -1 }).lean();
    
    const content = `
        <h1>Новые серверы Lineage 2 2026</h1>
        <p class="subtitle">Свежие проекты с лучшими условиями для старта</p>
        <div class="servers-grid">
            ${servers.map(s => serverCard(s)).join('')}
        </div>
        <div class="seo-content">
            <h2>Почему стоит начать играть на новом сервере?</h2>
            <p>Новые серверы предлагают свежий старт без перекосов в экономике, равные условия для всех игроков и активное комьюнити на старте.</p>
            <p>Преимущества новых серверов: вы не будете отставать от топ-игроков, сможете войти в число лидеров, экономика только формируется, нет засилья донатных вещей.</p>
        </div>
    `;
    
    res.send(baseLayout({
        title: 'Новые серверы Lineage 2 2026 — свежие проекты',
        description: 'Актуальный список новых серверов Lineage 2, открывшихся в 2026 году. Лучшие условия для старта и активное комьюнити.',
        canonical: '/new-servers/2026',
        breadcrumbs: renderBreadcrumbs([
            { name: 'Главная', url: '/' },
            { name: 'Новые серверы', url: '/new-servers' },
            { name: '2026', url: '/new-servers/2026' }
        ]),
        content
    }));
});

// Новые серверы за последние 30 дней
router.get('/new-servers/last-30-days', cacheService.cachePage(3600), async (req, res) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const servers = await Server.find({ 
        active: true,
        openingDate: { $gte: thirtyDaysAgo }
    }).sort({ openingDate: -1 }).lean();
    
    const content = `
        <h1>Новые серверы Lineage 2 — последние 30 дней</h1>
        <p class="subtitle">Свежие проекты для быстрого старта</p>
        <div class="servers-grid">
            ${servers.map(s => serverCard(s)).join('')}
        </div>
        ${generateSeoText('новые серверы', servers.length)}
    `;
    
    res.send(baseLayout({
        title: 'Новые серверы Lineage 2 — открывшиеся за последние 30 дней',
        description: 'Свежие проекты Lineage 2, открывшиеся за последние 30 дней. Лучшие условия для старта и равные возможности.',
        canonical: '/new-servers/last-30-days',
        breadcrumbs: renderBreadcrumbs([
            { name: 'Главная', url: '/' },
            { name: 'Новые серверы', url: '/new-servers' },
            { name: 'Последние 30 дней', url: '/new-servers/last-30-days' }
        ]),
        content
    }));
});

module.exports = router;