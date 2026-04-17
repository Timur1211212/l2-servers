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

// Interlude x10
router.get('/version/interlude/x10', cacheService.cachePage(3600), async (req, res) => {
    const servers = await Server.find({ 
        active: true,
        version: /interlude/i,
        exp: 'x10'
    }).sort({ 'rating.average': -1 }).lean();
    
    const content = `
        <h1>${generateVersionH1('Interlude', 'x10')}</h1>
        <p class="subtitle">Серверы Interlude с рейтами x10 — комфортная прокачка</p>
        <div class="servers-grid">
            ${servers.map(s => serverCard(s)).join('')}
        </div>
        ${generateSeoText('Interlude', servers.length)}
    `;
    
    res.send(baseLayout({
        title: 'Серверы Lineage 2 Interlude x10 2026',
        description: 'Лучшие серверы Interlude с рейтами x10. Комфортная прокачка без хардкора.',
        canonical: '/version/interlude/x10',
        breadcrumbs: renderBreadcrumbs([
            { name: 'Главная', url: '/' },
            { name: 'Interlude', url: '/version/interlude' },
            { name: 'x10 серверы', url: '/version/interlude/x10' }
        ]),
        content
    }));
});

// Interlude x30
router.get('/version/interlude/x30', cacheService.cachePage(3600), async (req, res) => {
    const servers = await Server.find({ 
        active: true,
        version: /interlude/i,
        exp: 'x30'
    }).sort({ 'rating.average': -1 }).lean();
    
    const content = `
        <h1>${generateVersionH1('Interlude', 'x30')}</h1>
        <p class="subtitle">Серверы Interlude с рейтами x30 — золотая середина</p>
        <div class="servers-grid">
            ${servers.map(s => serverCard(s)).join('')}
        </div>
        ${generateSeoText('Interlude', servers.length)}
    `;
    
    res.send(baseLayout({
        title: 'Серверы Lineage 2 Interlude x30 2026',
        description: 'Оптимальные серверы Interlude с рейтами x30. Баланс между временем на прокачку и удовольствием.',
        canonical: '/version/interlude/x30',
        breadcrumbs: renderBreadcrumbs([
            { name: 'Главная', url: '/' },
            { name: 'Interlude', url: '/version/interlude' },
            { name: 'x30 серверы', url: '/version/interlude/x30' }
        ]),
        content
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
        <p class="subtitle">Серверы Interlude с рейтами x100 — быстрая прокачка</p>
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

// High Five x1000
router.get('/version/high-five/x1000', cacheService.cachePage(3600), async (req, res) => {
    const servers = await Server.find({ 
        active: true,
        version: /high five|hf/i,
        exp: { $regex: /x1000/i }
    }).sort({ 'rating.average': -1 }).lean();
    
    const content = `
        <h1>${generateVersionH1('High Five', 'x1000')}</h1>
        <p class="subtitle">PvP серверы High Five с рейтами x1000</p>
        <div class="servers-grid">
            ${servers.map(s => serverCard(s)).join('')}
        </div>
        ${generateSeoText('High Five', servers.length)}
    `;
    
    res.send(baseLayout({
        title: 'Серверы Lineage 2 High Five x1000 2026 — PvP серверы',
        description: 'Лучшие PvP серверы High Five с рейтами x1000. Максимальная динамика и массовые сражения.',
        canonical: '/version/high-five/x1000',
        breadcrumbs: renderBreadcrumbs([
            { name: 'Главная', url: '/' },
            { name: 'High Five', url: '/version/high-five' },
            { name: 'x1000 серверы', url: '/version/high-five/x1000' }
        ]),
        content
    }));
});

// =============== Кластерные страницы для Classic ===============

// Classic x1
router.get('/version/classic/x1', cacheService.cachePage(3600), async (req, res) => {
    const servers = await Server.find({ 
        active: true,
        version: /classic/i,
        exp: 'x1'
    }).sort({ 'rating.average': -1 }).lean();
    
    const content = `
        <h1>${generateVersionH1('Classic', 'x1')}</h1>
        <p class="subtitle">Хардкорные серверы Classic с оригинальными рейтами x1</p>
        <div class="servers-grid">
            ${servers.map(s => serverCard(s)).join('')}
        </div>
        ${generateSeoText('Classic', servers.length)}
    `;
    
    res.send(baseLayout({
        title: 'Серверы Lineage 2 Classic x1 2026 — хардкорные проекты',
        description: 'Коллекция серверов Classic с оригинальными рейтами x1. Полное погружение в атмосферу старой школы.',
        canonical: '/version/classic/x1',
        breadcrumbs: renderBreadcrumbs([
            { name: 'Главная', url: '/' },
            { name: 'Classic', url: '/version/classic' },
            { name: 'x1 серверы', url: '/version/classic/x1' }
        ]),
        content
    }));
});

// Classic x5
router.get('/version/classic/x5', cacheService.cachePage(3600), async (req, res) => {
    const servers = await Server.find({ 
        active: true,
        version: /classic/i,
        exp: 'x5'
    }).sort({ 'rating.average': -1 }).lean();
    
    const content = `
        <h1>${generateVersionH1('Classic', 'x5')}</h1>
        <p class="subtitle">Серверы Classic с рейтами x5</p>
        <div class="servers-grid">
            ${servers.map(s => serverCard(s)).join('')}
        </div>
        ${generateSeoText('Classic', servers.length)}
    `;
    
    res.send(baseLayout({
        title: 'Серверы Lineage 2 Classic x5 2026',
        description: 'Лучшие серверы Classic с рейтами x5. Умеренная прокачка и классический геймплей.',
        canonical: '/version/classic/x5',
        breadcrumbs: renderBreadcrumbs([
            { name: 'Главная', url: '/' },
            { name: 'Classic', url: '/version/classic' },
            { name: 'x5 серверы', url: '/version/classic/x5' }
        ]),
        content
    }));
});

// Classic без доната
router.get('/version/classic/no-donate', cacheService.cachePage(3600), async (req, res) => {
    const servers = await Server.find({ 
        active: true,
        version: /classic/i,
        description: { $regex: /без доната|no donate/i }
    }).sort({ 'rating.average': -1 }).lean();
    
    const content = `
        <h1>Серверы Lineage 2 Classic без доната 2026</h1>
        <p class="subtitle">Честные Classic серверы без донатных вещей</p>
        <div class="servers-grid">
            ${servers.map(s => serverCard(s)).join('')}
        </div>
        <div class="seo-content">
            <h2>Почему стоит играть на серверах без доната?</h2>
            <p>Серверы без доната предлагают честную игру, где успех зависит только от вашего времени и умения. Никаких донатных мечей и крыльев — только честный PvP и PvE.</p>
        </div>
    `;
    
    res.send(baseLayout({
        title: 'Серверы Lineage 2 Classic без доната 2026',
        description: 'Честные Classic серверы без донатных вещей. Равные условия для всех игроков.',
        canonical: '/version/classic/no-donate',
        breadcrumbs: renderBreadcrumbs([
            { name: 'Главная', url: '/' },
            { name: 'Classic', url: '/version/classic' },
            { name: 'Без доната', url: '/version/classic/no-donate' }
        ]),
        content
    }));
});

// =============== Кластерные страницы для Essence ===============

// Essence высокие рейты
router.get('/version/essence/high-rate', cacheService.cachePage(3600), async (req, res) => {
    const servers = await Server.find({ 
        active: true,
        version: /essence/i,
        exp: { $regex: /x100|x500|x1000/i }
    }).sort({ 'rating.average': -1 }).lean();
    
    const content = `
        <h1>Серверы Lineage 2 Essence с высокими рейтами 2026</h1>
        <p class="subtitle">Максимальная динамика и быстрый старт</p>
        <div class="servers-grid">
            ${servers.map(s => serverCard(s)).join('')}
        </div>
        ${generateSeoText('Essence', servers.length)}
    `;
    
    res.send(baseLayout({
        title: 'Серверы Lineage 2 Essence с высокими рейтами 2026',
        description: 'Быстрая прокачка на Essence серверах с рейтами x100-x1000. Идеально для PvP и массовых сражений.',
        canonical: '/version/essence/high-rate',
        breadcrumbs: renderBreadcrumbs([
            { name: 'Главная', url: '/' },
            { name: 'Essence', url: '/version/essence' },
            { name: 'Высокие рейты', url: '/version/essence/high-rate' }
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

// VIP серверы Classic
router.get('/vip-servers/classic', cacheService.cachePage(3600), async (req, res) => {
    const servers = await Server.find({ 
        active: true,
        status: 'VIP',
        version: /classic/i
    }).sort({ 'rating.average': -1 }).lean();
    
    const content = `
        <h1>VIP серверы Lineage 2 Classic 2026</h1>
        <p class="subtitle">Премиальные Classic серверы</p>
        <div class="servers-grid">
            ${servers.map(s => serverCard(s)).join('')}
        </div>
        ${generateSeoText('Classic', servers.length)}
    `;
    
    res.send(baseLayout({
        title: 'VIP серверы Lineage 2 Classic 2026',
        description: 'Лучшие VIP серверы Classic с высоким качеством обслуживания и стабильностью.',
        canonical: '/vip-servers/classic',
        breadcrumbs: renderBreadcrumbs([
            { name: 'Главная', url: '/' },
            { name: 'VIP серверы', url: '/vip-servers' },
            { name: 'Classic', url: '/vip-servers/classic' }
        ]),
        content
    }));
});

// =============== Кластерные страницы для PvP серверов ===============

// PvP серверы Interlude
router.get('/pvp-servers/interlude', cacheService.cachePage(3600), async (req, res) => {
    const servers = await Server.find({ 
        active: true,
        version: /interlude/i,
        status: { $in: ['VIP', 'Почти VIP'] }
    }).sort({ 'rating.average': -1 }).lean();
    
    const content = `
        <h1>PvP серверы Lineage 2 Interlude 2026</h1>
        <p class="subtitle">Лучшие проекты для массовых сражений</p>
        <div class="servers-grid">
            ${servers.map(s => serverCard(s)).join('')}
        </div>
        <div class="seo-content">
            <h2>Interlude — классика для PvP</h2>
            <p>Interlude считается одной из самых сбалансированных версий для PvP. Классическая система классов, массовые осады замков и олимпиады.</p>
        </div>
    `;
    
    res.send(baseLayout({
        title: 'PvP серверы Lineage 2 Interlude 2026',
        description: 'Топ PvP серверов Interlude для массовых сражений и олимпиад.',
        canonical: '/pvp-servers/interlude',
        breadcrumbs: renderBreadcrumbs([
            { name: 'Главная', url: '/' },
            { name: 'PvP серверы', url: '/pvp-servers' },
            { name: 'Interlude', url: '/pvp-servers/interlude' }
        ]),
        content
    }));
});

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

// Новые серверы за последние 7 дней
router.get('/new-servers/last-7-days', cacheService.cachePage(3600), async (req, res) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const servers = await Server.find({ 
        active: true,
        openingDate: { $gte: sevenDaysAgo }
    }).sort({ openingDate: -1 }).lean();
    
    const content = `
        <h1>Новые серверы Lineage 2 — последние 7 дней</h1>
        <p class="subtitle">Самые свежие проекты для быстрого старта</p>
        <div class="servers-grid">
            ${servers.map(s => serverCard(s)).join('')}
        </div>
        <div class="seo-content">
            <h2>Преимущества игры на новых серверах</h2>
            <p>На новых серверах вы не будете отставать от топ-игроков, экономика только формируется, а администрация наиболее активна.</p>
        </div>
    `;
    
    res.send(baseLayout({
        title: 'Новые серверы Lineage 2 — открывшиеся за последние 7 дней',
        description: 'Самые свежие проекты Lineage 2. Лучшие условия для старта и равные возможности.',
        canonical: '/new-servers/last-7-days',
        breadcrumbs: renderBreadcrumbs([
            { name: 'Главная', url: '/' },
            { name: 'Новые серверы', url: '/new-servers' },
            { name: 'Последние 7 дней', url: '/new-servers/last-7-days' }
        ]),
        content
    }));
});

// =============== Поисковые кластерные страницы ===============

// Серверы с высоким рейтингом (4.5+)
router.get('/servers/top-rated', cacheService.cachePage(1800), async (req, res) => {
    const servers = await Server.find({ 
        active: true,
        'rating.average': { $gte: 4.5 }
    }).sort({ 'rating.average': -1 }).limit(50).lean();
    
    const content = `
        <h1>Серверы Lineage 2 с высоким рейтингом 4.5+ 2026</h1>
        <p class="subtitle">Лучшие проекты по оценкам игроков</p>
        <div class="servers-grid">
            ${servers.map(s => serverCard(s)).join('')}
        </div>
        <div class="seo-content">
            <h2>Почему стоит выбирать серверы с высоким рейтингом?</h2>
            <p>Высокий рейтинг — это показатель качества сервера. Такие проекты имеют хорошую репутацию, честную администрацию и довольных игроков.</p>
        </div>
    `;
    
    res.send(baseLayout({
        title: 'Серверы Lineage 2 с высоким рейтингом 4.5+ 2026',
        description: 'Лучшие серверы L2 по оценкам игроков. Только проверенные проекты с высоким рейтингом.',
        canonical: '/servers/top-rated',
        breadcrumbs: renderBreadcrumbs([
            { name: 'Главная', url: '/' },
            { name: 'С высоким рейтингом', url: '/servers/top-rated' }
        ]),
        content
    }));
});

// Серверы с большим количеством отзывов
router.get('/servers/most-reviewed', cacheService.cachePage(1800), async (req, res) => {
    const servers = await Server.find({ 
        active: true,
        'rating.count': { $gte: 10 }
    }).sort({ 'rating.count': -1 }).limit(50).lean();
    
    const content = `
        <h1>Серверы Lineage 2 с большим количеством отзывов 2026</h1>
        <p class="subtitle">Самые обсуждаемые проекты</p>
        <div class="servers-grid">
            ${servers.map(s => serverCard(s)).join('')}
        </div>
        <div class="seo-content">
            <h2>Почему важны отзывы игроков?</h2>
            <p>Большое количество отзывов говорит о популярности сервера и даёт более объективную картину о его качестве.</p>
        </div>
    `;
    
    res.send(baseLayout({
        title: 'Серверы Lineage 2 с большим количеством отзывов 2026',
        description: 'Самые популярные серверы L2 с большим количеством отзывов игроков.',
        canonical: '/servers/most-reviewed',
        breadcrumbs: renderBreadcrumbs([
            { name: 'Главная', url: '/' },
            { name: 'С отзывами', url: '/servers/most-reviewed' }
        ]),
        content
    }));
});

module.exports = router;