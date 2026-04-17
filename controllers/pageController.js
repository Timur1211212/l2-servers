// controllers/pageController.js
const Server = require('../models/Server');
const Review = require('../models/Review');
const { baseLayout } = require('../views/layouts/baseLayout');
const { renderBreadcrumbs } = require('../views/components/breadcrumbs');
const { serverCard } = require('../views/components/serverCard');
const { reviewsList } = require('../views/components/reviewCard');
const { 
    generateServerH1, 
    generateServerH2, 
    generateServerMetaDescription, 
    generateServerMetaKeywords,
    generateSeoText,
    generateVersionH1,
    generateVersionH2,
    generateProductSchema,
    generateItemListSchema,
    generateBreadcrumbSchema
} = require('../utils/seoHelpers');
const { escapeHtml, renderStars, getReviewWord, formatDate } = require('../utils/htmlHelpers');
const ogImageService = require('../services/ogImageService');
const cacheService = require('../services/cacheService');

// Главная страница
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
            <div class="seo-content">
                <h2>Лучшие серверы Lineage 2 2026 — Полный каталог</h2>
                <p><strong>База серверов Lineage 2</strong> — это крупнейший русскоязычный каталог частных серверов L2. Мы собираем актуальную информацию о всех популярных проектах.</p>
            </div>
        `;
        
        const schema = generateItemListSchema(servers, 'Рейтинг серверов Lineage 2 2026', 'Лучшие серверы L2');
        
        res.send(baseLayout({
            title: 'Рейтинг серверов Lineage 2 2026 — каталог L2 серверов с отзывами',
            description: 'Актуальный рейтинг серверов Lineage 2 2026. Лучшие L2 серверы: Interlude, High Five, Classic. Подробная статистика, рейты, отзывы игроков.',
            keywords: 'lineage 2 серверы, l2 серверы, рейтинг серверов lineage 2',
            canonical: '/',
            breadcrumbs: renderBreadcrumbs([{ name: 'Главная', url: '/' }]),
            content,
            schema,
            ogImage: '/og-image.jpg'
        }));
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
}

// Страница сервера
async function server(req, res) {
    try {
        const { slug } = req.params;
        
        let server = await Server.findOne({ slug });
        
        if (!server && mongoose.Types.ObjectId.isValid(slug)) {
            server = await Server.findById(slug);
            if (server && server.slug) {
                return res.redirect(301, `/server/${server.slug}`);
            }
        }
        
        if (!server) {
            return res.status(404).sendFile('404.html', { root: './public' });
        }
        
        // Увеличиваем счетчик просмотров
        await Server.findByIdAndUpdate(server._id, { $inc: { views: 1 } });
        
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
        
        const ogImage = await ogImageService.generateServerImage(server);
        
        const breadcrumbs = renderBreadcrumbs([
            { name: 'Главная', url: '/' },
            { name: server.version || 'Interlude', url: `/version/${(server.version || 'interlude').toLowerCase()}` },
            { name: server.name, url: '' }
        ]);
        
        const content = `
            <div class="server-header">
                <h1>${generateServerH1(server)}</h1>
                ${generateServerH2(server)}
                <div class="server-website">
                    <a href="${escapeHtml(server.website)}" target="_blank" rel="nofollow">🌐 ${escapeHtml(server.website)}</a>
                </div>
                <a href="${escapeHtml(server.website)}" target="_blank" class="btn-play">🎮 Играть на сервере →</a>
            </div>
            
            ${renderRatesTable(server)}
            
            ${server.description ? `<div class="server-description">${escapeHtml(server.description)}</div>` : ''}
            
            <div class="rating-section">
                <h3>⭐ Рейтинг сервера</h3>
                ${renderRatingDistribution(server)}
            </div>
            
            <div class="reviews-section">
                <h3>📝 Отзывы игроков (${totalReviews})</h3>
                ${reviewsList(reviews)}
                ${totalReviews > 5 ? `<button class="btn-reviews" onclick="openReviewsModal('${server._id}', '${escapeHtml(server.name)}')">📖 Показать все ${totalReviews} отзывов →</button>` : ''}
            </div>
            
            ${similarServers.length ? renderSimilarServers(similarServers) : ''}
        `;
        
        const schema = generateProductSchema(server);
        
        res.send(baseLayout({
            title: `${server.name} — сервер Lineage 2 ${server.version} | Рейтинг, отзывы, рейты`,
            description: generateServerMetaDescription(server),
            keywords: generateServerMetaKeywords(server),
            canonical: `/server/${server.slug}`,
            breadcrumbs,
            content,
            schema,
            ogImage
        }));
    } catch (err) {
        console.error(err);
        res.status(500).sendFile('50x.html', { root: './public' });
    }
}

// Страница версии Interlude
async function interlude(req, res) {
    try {
        const servers = await Server.find({ 
            active: true,
            version: { $regex: /interlude/i }
        }).sort({ 'rating.average': -1 }).lean();
        
        const vipServers = servers.filter(s => s.status === 'VIP');
        const newServers = servers.filter(s => {
            if (!s.openingDate) return false;
            const daysOld = (Date.now() - new Date(s.openingDate)) / (1000 * 60 * 60 * 24);
            return daysOld <= 30;
        }).slice(0, 6);
        
        const topServers = servers.slice(0, 10);
        const totalCount = servers.length;
        
        const breadcrumbs = renderBreadcrumbs([
            { name: 'Главная', url: '/' },
            { name: 'Interlude', url: '/version/interlude' }
        ]);
        
        const content = `
            <h1>${generateVersionH1('Interlude')}</h1>
            ${generateVersionH2('Interlude', totalCount)}
            
            <div class="stats-grid">
                <div class="stat-card"><div class="number">${totalCount}</div><div class="label">🎮 Серверов Interlude</div></div>
                <div class="stat-card"><div class="number">${vipServers.length}</div><div class="label">⭐ VIP серверов</div></div>
                <div class="stat-card"><div class="number">${newServers.length}</div><div class="label">🆕 Новых (до 30 дней)</div></div>
            </div>
            
            <h2>🏆 Топ 10 серверов Interlude</h2>
            <div class="servers-grid">
                ${topServers.map(s => serverCard(s)).join('')}
            </div>
            
            ${generateSeoText('Interlude', totalCount)}
        `;
        
        const schema = generateItemListSchema(topServers, 'Топ серверов Interlude', 'Лучшие серверы Interlude по рейтингу');
        
        const ogImage = await ogImageService.generateVersionImage('Interlude');
        
        res.send(baseLayout({
            title: 'Серверы Lineage 2 Interlude 2026 | Рейтинг и каталог L2 Interlude серверов',
            description: 'Актуальный рейтинг серверов Lineage 2 Interlude 2026. Лучшие L2 Interlude серверы с высоким онлайном, честными рейтами и отзывами игроков.',
            keywords: 'lineage 2 interlude, l2 interlude серверы, сервера л2 интерлюд',
            canonical: '/version/interlude',
            breadcrumbs,
            content,
            schema,
            ogImage
        }));
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
}

// Вспомогательные функции для рендеринга
function renderRatesTable(server) {
    const allRates = [
        { label: 'Exp', value: server.exp },
        { label: 'Adena', value: server.adena },
        { label: 'Drop', value: server.drop },
        { label: 'Spoil', value: server.spoil },
        { label: 'Spoil Chance', value: server.spoilChance },
        { label: 'Sealstone', value: server.sealstone },
        { label: 'Raid Boss Exp', value: server.raidBossExp },
        { label: 'Raid Boss Drop', value: server.raidBossDrop },
        { label: 'Epic Raid Boss Drop', value: server.epicRaidBossDrop },
        { label: 'Quest Adena', value: server.questAdena },
        { label: 'Quest', value: server.quest },
        { label: 'Quest Exp', value: server.questExp }
    ].filter(rate => rate.value && rate.value.trim());
    
    if (allRates.length === 0) return '';
    
    return `
        <div class="rates-grid">
            ${allRates.map(rate => `
                <div class="rate-item">
                    <span class="rate-label">${rate.label}:</span>
                    <span class="rate-value">${escapeHtml(rate.value)}</span>
                </div>
            `).join('')}
        </div>
    `;
}

function renderRatingDistribution(server) {
    const avgRating = server.rating?.average || 0;
    const ratingCount = server.rating?.count || 0;
    const distribution = server.rating?.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    return `
        <div class="rating-summary">
            <div class="rating-big">
                <div class="score">${avgRating.toFixed(1)}</div>
                <div class="stars">${renderStars(avgRating)}</div>
                <div>${ratingCount} ${getReviewWord(ratingCount)}</div>
            </div>
            <div class="rating-distribution">
                ${[5,4,3,2,1].map(star => `
                    <div class="dist-bar">
                        <div class="dist-label">${star} ★</div>
                        <div class="dist-bar-fill">
                            <span style="width: ${ratingCount ? (distribution[star] / ratingCount * 100) : 0}%"></span>
                        </div>
                        <div class="dist-count">${distribution[star] || 0}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderSimilarServers(similarServers) {
    return `
        <div class="similar-section">
            <h3>🔗 Похожие серверы</h3>
            <div class="similar-grid">
                ${similarServers.map(s => `
                    <div class="similar-card">
                        <a href="/server/${s.slug || s._id}">${escapeHtml(s.name)}</a>
                        <div class="rating">⭐ ${(s.rating?.average || 0).toFixed(1)}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Заглушки для остальных страниц (быстрое создание)
async function highFive(req, res) { /* аналогично interlude */ res.send('High Five page - to be implemented'); }
async function classic(req, res) { res.send('Classic page - to be implemented'); }
async function essence(req, res) { res.send('Essence page - to be implemented'); }
async function topServers(req, res) { res.send('Top servers page - to be implemented'); }
async function newServers(req, res) { res.send('New servers page - to be implemented'); }
async function allServers(req, res) { res.send('All servers page - to be implemented'); }
async function vipServers(req, res) { res.send('VIP servers page - to be implemented'); }
async function pvpServers(req, res) { res.send('PvP servers page - to be implemented'); }
async function about(req, res) { res.sendFile('about.html', { root: './public' }); }
async function download(req, res) { res.sendFile('download.html', { root: './public' }); }
async function contacts(req, res) { res.sendFile('contacts.html', { root: './public' }); }
async function privacy(req, res) { res.sendFile('privacy.html', { root: './public' }); }
async function terms(req, res) { res.sendFile('terms.html', { root: './public' }); }
async function disclaimer(req, res) { res.sendFile('disclaimer.html', { root: './public' }); }
async function dmca(req, res) { res.sendFile('dmca.html', { root: './public' }); }
async function cookies(req, res) { res.sendFile('cookies.html', { root: './public' }); }

// Sitemap
async function sitemap(req, res) {
    try {
        const servers = await Server.find({ active: true }).select('_id updatedAt slug').lean();
        const baseUrl = `https://${process.env.DOMAIN || 'zerokulasite.ru'}`;
        const today = new Date().toISOString().split('T')[0];
        
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
        
        const mainPages = ['/', '/top-servers', '/new-servers', '/all-servers', '/vip-servers', '/pvp-servers'];
        for (const url of mainPages) {
            xml += `  <url>\n    <loc>${baseUrl}${url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
        }
        
        const versionPages = ['/version/interlude', '/version/high-five', '/version/classic', '/version/essence'];
        for (const url of versionPages) {
            xml += `  <url>\n    <loc>${baseUrl}${url}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
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

// robots.txt
function robots(req, res) {
    const domain = process.env.DOMAIN || 'zerokulasite.ru';
    res.type('text/plain');
    res.send(`
User-agent: Yandex
Allow: /
Disallow: /api/
Disallow: /admin-main
Host: https://${domain}
Sitemap: https://${domain}/sitemap.xml

User-agent: Googlebot
Allow: /
Disallow: /api/
Disallow: /admin-main
Sitemap: https://${domain}/sitemap.xml

User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin-main
Sitemap: https://${domain}/sitemap.xml
    `);
}

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
    about,
    download,
    contacts,
    privacy,
    terms,
    disclaimer,
    dmca,
    cookies,
    sitemap,
    robots
};