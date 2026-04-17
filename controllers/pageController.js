// controllers/pageController.js
const Server = require('../models/Server');
const Review = require('../models/Review');
const { baseLayout } = require('../views/layouts/baseLayout');
const { renderBreadcrumbs } = require('../views/components/breadcrumbs');
const { serverCard } = require('../views/components/serverCard');
const { reviewsList } = require('../views/components/reviewCard');
const { 
    generateServerH1, 
    generateServerMetaDescription, 
    generateServerMetaKeywords,
    generateProductSchema,
    generateItemListSchema,
    generateSeoText,
    generateVersionH1
} = require('../utils/seoHelpers');
const { escapeHtml, renderStars, getReviewWord } = require('../utils/htmlHelpers');
const ogImageService = require('../services/ogImageService');

// =============== ГЛАВНАЯ СТРАНИЦА ===============
async function home(req, res) {
    try {
        const servers = await Server.find({ active: true })
            .sort({ createdAt: -1 })
            .limit(12)
            .lean();
        
        const content = `
            <h1>Рейтинг серверов Lineage 2 2026</h1>
            <p class="subtitle">Лучшие серверы Lineage 2 с отзывами игроков, рейтингами и полной статистикой</p>
            <div class="servers-grid">
                ${servers.map(s => serverCard(s)).join('')}
            </div>
        `;
        
        res.send(baseLayout({
            title: 'Рейтинг серверов Lineage 2 2026 — каталог L2 серверов с отзывами',
            description: 'Актуальный рейтинг серверов Lineage 2 2026. Лучшие L2 серверы: Interlude, High Five, Classic.',
            canonical: '/',
            breadcrumbs: renderBreadcrumbs([{ name: 'Главная', url: '/' }]),
            content
        }));
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
}

// =============== СТРАНИЦА СЕРВЕРА ===============
async function server(req, res) {
    try {
        const { slug } = req.params;
        let server = await Server.findOne({ slug });
        
        if (!server && require('mongoose').Types.ObjectId.isValid(slug)) {
            server = await Server.findById(slug);
            if (server && server.slug) {
                return res.redirect(301, `/server/${server.slug}`);
            }
        }
        
        if (!server) {
            return res.status(404).sendFile('404.html', { root: './public' });
        }
        
        const reviews = await Review.find({ serverId: server._id, status: 'approved' })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();
        
        const totalReviews = await Review.countDocuments({ serverId: server._id, status: 'approved' });
        
        const similarServers = await Server.find({
            _id: { $ne: server._id },
            active: true,
            version: server.version
        }).limit(3).lean();
        
        const content = `
            <div class="server-header">
                <h1>${escapeHtml(server.name)} — сервер Lineage 2 ${server.version || 'Interlude'}</h1>
                <div class="server-website">
                    <a href="${escapeHtml(server.website)}" target="_blank">🌐 ${escapeHtml(server.website)}</a>
                </div>
                <a href="${escapeHtml(server.website)}" target="_blank" class="btn-play">🎮 Играть на сервере →</a>
            </div>
            <div class="reviews-section">
                <h3>📝 Отзывы игроков (${totalReviews})</h3>
                ${reviewsList(reviews)}
            </div>
        `;
        
        res.send(baseLayout({
            title: `${server.name} — сервер Lineage 2 ${server.version} | Рейтинг, отзывы`,
            description: generateServerMetaDescription(server),
            canonical: `/server/${server.slug}`,
            breadcrumbs: renderBreadcrumbs([
                { name: 'Главная', url: '/' },
                { name: server.name, url: '' }
            ]),
            content
        }));
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
}

// =============== СТРАНИЦЫ ВЕРСИЙ ===============
async function interlude(req, res) {
    try {
        const servers = await Server.find({ active: true, version: /interlude/i })
            .sort({ 'rating.average': -1 })
            .lean();
        
        const content = `
            <h1>${generateVersionH1('Interlude')}</h1>
            <div class="servers-grid">
                ${servers.slice(0, 20).map(s => serverCard(s)).join('')}
            </div>
            ${generateSeoText('Interlude', servers.length)}
        `;
        
        res.send(baseLayout({
            title: 'Серверы Lineage 2 Interlude 2026 | Рейтинг и каталог',
            description: 'Актуальный рейтинг серверов Lineage 2 Interlude 2026. Лучшие L2 Interlude серверы.',
            canonical: '/version/interlude',
            breadcrumbs: renderBreadcrumbs([
                { name: 'Главная', url: '/' },
                { name: 'Interlude', url: '/version/interlude' }
            ]),
            content
        }));
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
}

async function highFive(req, res) {
    try {
        const servers = await Server.find({ active: true, version: /high five|hf/i })
            .sort({ 'rating.average': -1 })
            .lean();
        
        const content = `
            <h1>Серверы Lineage 2 High Five 2026</h1>
            <div class="servers-grid">
                ${servers.slice(0, 20).map(s => serverCard(s)).join('')}
            </div>
            ${generateSeoText('High Five', servers.length)}
        `;
        
        res.send(baseLayout({
            title: 'Серверы Lineage 2 High Five 2026 | Рейтинг L2 High Five серверов',
            description: 'Актуальный рейтинг серверов Lineage 2 High Five 2026.',
            canonical: '/version/high-five',
            breadcrumbs: renderBreadcrumbs([
                { name: 'Главная', url: '/' },
                { name: 'High Five', url: '/version/high-five' }
            ]),
            content
        }));
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
}

async function classic(req, res) {
    try {
        const servers = await Server.find({ active: true, version: /classic/i })
            .sort({ 'rating.average': -1 })
            .lean();
        
        const content = `
            <h1>Серверы Lineage 2 Classic 2026</h1>
            <div class="servers-grid">
                ${servers.slice(0, 20).map(s => serverCard(s)).join('')}
            </div>
            ${generateSeoText('Classic', servers.length)}
        `;
        
        res.send(baseLayout({
            title: 'Серверы Lineage 2 Classic 2026 | Рейтинг L2 Classic серверов',
            description: 'Актуальный рейтинг серверов Lineage 2 Classic 2026.',
            canonical: '/version/classic',
            breadcrumbs: renderBreadcrumbs([
                { name: 'Главная', url: '/' },
                { name: 'Classic', url: '/version/classic' }
            ]),
            content
        }));
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
}

async function essence(req, res) {
    try {
        const servers = await Server.find({ active: true, version: /essence/i })
            .sort({ 'rating.average': -1 })
            .lean();
        
        const content = `
            <h1>Серверы Lineage 2 Essence 2026</h1>
            <div class="servers-grid">
                ${servers.slice(0, 20).map(s => serverCard(s)).join('')}
            </div>
            ${generateSeoText('Essence', servers.length)}
        `;
        
        res.send(baseLayout({
            title: 'Серверы Lineage 2 Essence 2026 | Рейтинг L2 Essence серверов',
            description: 'Актуальный рейтинг серверов Lineage 2 Essence 2026.',
            canonical: '/version/essence',
            breadcrumbs: renderBreadcrumbs([
                { name: 'Главная', url: '/' },
                { name: 'Essence', url: '/version/essence' }
            ]),
            content
        }));
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
}

// =============== СТРАНИЦЫ СПИСКОВ ===============
async function topServers(req, res) {
    try {
        const servers = await Server.find({ active: true })
            .sort({ 'rating.average': -1 })
            .limit(100)
            .lean();
        
        const content = `
            <h1>🏆 Топ серверы Lineage 2</h1>
            <div class="servers-grid">
                ${servers.map(s => serverCard(s)).join('')}
            </div>
        `;
        
        res.send(baseLayout({
            title: 'Топ серверы Lineage 2 2026 | Рейтинг лучших L2 серверов',
            description: 'Лучшие серверы Lineage 2 по рейтингу игроков. Топ-100 проектов с самым высоким рейтингом.',
            canonical: '/top-servers',
            breadcrumbs: renderBreadcrumbs([
                { name: 'Главная', url: '/' },
                { name: 'Топ серверы', url: '/top-servers' }
            ]),
            content
        }));
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
}

async function newServers(req, res) {
    try {
        const servers = await Server.find({ active: true })
            .sort({ openingDate: -1, createdAt: -1 })
            .limit(100)
            .lean();
        
        const content = `
            <h1>🆕 Новые серверы Lineage 2</h1>
            <div class="servers-grid">
                ${servers.map(s => serverCard(s)).join('')}
            </div>
        `;
        
        res.send(baseLayout({
            title: 'Новые серверы Lineage 2 2026 | Свежие проекты L2',
            description: 'Свежие открытия серверов Lineage 2. Лучшие условия для старта и равные возможности.',
            canonical: '/new-servers',
            breadcrumbs: renderBreadcrumbs([
                { name: 'Главная', url: '/' },
                { name: 'Новые серверы', url: '/new-servers' }
            ]),
            content
        }));
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
}

async function allServers(req, res) {
    try {
        const servers = await Server.find({ active: true })
            .sort({ createdAt: -1 })
            .lean();
        
        const content = `
            <h1>📋 Все серверы Lineage 2</h1>
            <div class="servers-grid">
                ${servers.map(s => serverCard(s)).join('')}
            </div>
        `;
        
        res.send(baseLayout({
            title: 'Все серверы Lineage 2 | Полный каталог L2 серверов',
            description: 'Полный каталог серверов Lineage 2 с рейтингами, рейтами и отзывами.',
            canonical: '/all-servers',
            breadcrumbs: renderBreadcrumbs([
                { name: 'Главная', url: '/' },
                { name: 'Все серверы', url: '/all-servers' }
            ]),
            content
        }));
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
}

async function vipServers(req, res) {
    try {
        const servers = await Server.find({ active: true, status: 'VIP' })
            .sort({ 'rating.average': -1 })
            .lean();
        
        const content = `
            <h1>⭐ VIP серверы Lineage 2</h1>
            <div class="servers-grid">
                ${servers.map(s => serverCard(s)).join('')}
            </div>
        `;
        
        res.send(baseLayout({
            title: 'VIP серверы Lineage 2 2026 | Топовые L2 серверы',
            description: 'Лучшие VIP серверы Lineage 2 с высоким онлайном и стабильностью.',
            canonical: '/vip-servers',
            breadcrumbs: renderBreadcrumbs([
                { name: 'Главная', url: '/' },
                { name: 'VIP серверы', url: '/vip-servers' }
            ]),
            content
        }));
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
}

async function pvpServers(req, res) {
    try {
        const servers = await Server.find({ 
            active: true,
            status: { $in: ['VIP', 'Почти VIP'] }
        }).sort({ 'rating.average': -1 }).lean();
        
        const content = `
            <h1>⚔️ PvP серверы Lineage 2</h1>
            <div class="servers-grid">
                ${servers.map(s => serverCard(s)).join('')}
            </div>
        `;
        
        res.send(baseLayout({
            title: 'PvP серверы Lineage 2 2026 | Серверы для массовых сражений',
            description: 'Лучшие PvP серверы Lineage 2 для массовых сражений, осад замков и олимпиад.',
            canonical: '/pvp-servers',
            breadcrumbs: renderBreadcrumbs([
                { name: 'Главная', url: '/' },
                { name: 'PvP серверы', url: '/pvp-servers' }
            ]),
            content
        }));
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
}

// =============== SITEMAP ===============
async function sitemap(req, res) {
    try {
        const servers = await Server.find({ active: true }).select('_id updatedAt slug').lean();
        const baseUrl = `http://localhost:${process.env.PORT || 3000}`;
        const today = new Date().toISOString().split('T')[0];
        
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
        
        const mainPages = ['/', '/top-servers', '/new-servers', '/all-servers', '/vip-servers', '/pvp-servers'];
        for (const url of mainPages) {
            xml += `  <url>\n    <loc>${baseUrl}${url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
        }
        
        for (const server of servers) {
            const lastmod = server.updatedAt ? server.updatedAt.toISOString().split('T')[0] : today;
            const slug = server.slug || server._id;
            xml += `  <url>\n    <loc>${baseUrl}/server/${slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
        }
        
        xml += '</urlset>';
        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (err) {
        res.status(500).send('Error generating sitemap');
    }
}

// =============== ROBOTS.TXT ===============
function robots(req, res) {
    res.type('text/plain');
    res.send(`
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin-main
Sitemap: http://localhost:3000/sitemap.xml
    `);
}

// =============== ЭКСПОРТ ===============
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
    sitemap,
    robots
};