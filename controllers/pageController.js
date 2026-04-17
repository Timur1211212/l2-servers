// controllers/pageController.js
const Server = require('../models/Server');
const Review = require('../models/Review');
const { baseLayout } = require('../views/layouts/baseLayout');
const { renderBreadcrumbs } = require('../views/components/breadcrumbs');
const { serverCard } = require('../views/components/serverCard');
const { reviewsList } = require('../views/components/reviewCard');
const { 
    generateServerMetaDescription, 
    generateSeoText,
    generateVersionH1
} = require('../utils/seoHelpers');
const { escapeHtml } = require('../utils/htmlHelpers');
const mongoose = require('mongoose');

// =============== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===============

function renderPagination(currentPage, totalPages, baseUrl) {
    if (totalPages <= 1) return '';
    
    let html = '<div class="pagination">';
    
    // Предыдущая
    if (currentPage > 1) {
        html += `<a href="${baseUrl}?page=${currentPage - 1}" class="page-link" data-page="${currentPage - 1}">← Назад</a>`;
    }
    
    // Номера страниц
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
        html += `<a href="${baseUrl}?page=1" class="page-link" data-page="1">1</a>`;
        if (startPage > 2) html += '<span class="page-dots">...</span>';
    }
    
    for (let i = startPage; i <= endPage; i++) {
        if (i === currentPage) {
            html += `<span class="page-current">${i}</span>`;
        } else {
            html += `<a href="${baseUrl}?page=${i}" class="page-link" data-page="${i}">${i}</a>`;
        }
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) html += '<span class="page-dots">...</span>';
        html += `<a href="${baseUrl}?page=${totalPages}" class="page-link" data-page="${totalPages}">${totalPages}</a>`;
    }
    
    // Следующая
    if (currentPage < totalPages) {
        html += `<a href="${baseUrl}?page=${currentPage + 1}" class="page-link" data-page="${currentPage + 1}">Далее →</a>`;
    }
    
    html += '</div>';
    return html;
}

// =============== ГЛАВНАЯ СТРАНИЦА ===============
async function home(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 12;
        const skip = (page - 1) * limit;
        
        const [servers, total] = await Promise.all([
            Server.find({ active: true })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Server.countDocuments({ active: true })
        ]);
        
        const totalPages = Math.ceil(total / limit);
        
        const content = `
            <h1>Рейтинг серверов Lineage 2 2026</h1>
            <p class="subtitle">Лучшие серверы Lineage 2 с отзывами игроков, рейтингами и полной статистикой</p>
            
            <div class="search-bar">
                <input type="text" id="searchInput" placeholder="🔍 Поиск серверов по названию, версии или рейтам..." autocomplete="off">
            </div>
            
            <div class="filters">
                <button class="filter-btn active" data-status="all">🌐 Все серверы</button>
                <button class="filter-btn" data-status="VIP">⭐ VIP серверы</button>
                <button class="filter-btn" data-status="Почти VIP">✨ Почти VIP</button>
                <button class="filter-btn" data-status="Не VIP, но тоже неплохой сервер">🛡️ Обычные</button>
            </div>
            
            <div class="download-banner">
                <a href="/download" class="download-banner-link">📥 Скачать клиент Lineage 2 бесплатно →</a>
            </div>
            
            <div class="stats">
                <div class="stat">📊 Серверов в базе: <span id="totalServers">${total}</span></div>
            </div>
            
            <div id="serversList" class="servers-grid">
                ${servers.map(s => serverCard(s)).join('')}
            </div>
            ${renderPagination(page, totalPages, '/')}
        `;
        
        res.send(baseLayout({
            title: 'Рейтинг серверов Lineage 2 2026 — каталог L2 серверов с отзывами',
            description: 'Актуальный рейтинг серверов Lineage 2 2026. Лучшие L2 серверы: Interlude, High Five, Classic. Подробная статистика, рейты, отзывы игроков.',
            canonical: '/',
            breadcrumbs: renderBreadcrumbs([{ name: 'Главная', url: '/' }]),
            content,
            additionalScripts: '<script src="/js/main.js" defer></script>'
        }));
    } catch (err) {
        console.error('Home error:', err);
        res.status(500).send('Server error');
    }
}

// =============== СТРАНИЦА СЕРВЕРА ===============
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
        
        // Увеличиваем счётчик просмотров
        await Server.findByIdAndUpdate(server._id, { $inc: { views: 1 } });
        
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        
        const [reviews, totalReviews] = await Promise.all([
            Review.find({ serverId: server._id, status: 'approved' })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Review.countDocuments({ serverId: server._id, status: 'approved' })
        ]);
        
        const totalPages = Math.ceil(totalReviews / limit);
        
        const similarServers = await Server.find({
            _id: { $ne: server._id },
            active: true,
            version: server.version
        }).limit(3).lean();
        
        const ratingDistribution = server.rating?.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        const ratingCount = server.rating?.count || 0;
        const avgRating = server.rating?.average || 0;
        
        const content = `
            <div class="server-header">
                <h1>${escapeHtml(server.name)} — сервер Lineage 2 ${escapeHtml(server.version || 'Interlude')}</h1>
                
                <div class="server-status ${getStatusClass(server.status)}">
                    ${escapeHtml(server.status)}
                </div>
                
                <div class="server-website">
                    <a href="${escapeHtml(server.website)}" target="_blank" rel="nofollow noopener external">
                        🌐 ${escapeHtml(server.website)}
                    </a>
                </div>
                
                <div class="server-actions-header">
                    <a href="${escapeHtml(server.website)}" target="_blank" class="btn-play-large">🎮 Играть на сервере →</a>
                    <button class="btn-write-review" onclick="openReviewModal('${server._id}')">✍️ Написать отзыв</button>
                </div>
            </div>
            
            ${renderRatesTable(server)}
            
            ${server.description ? `<div class="server-description-full">${server.description}</div>` : ''}
            
            <div class="rating-section">
                <h2>⭐ Рейтинг сервера</h2>
                <div class="rating-summary">
                    <div class="rating-big">
                        <div class="rating-value">${avgRating.toFixed(1)}</div>
                        <div class="rating-stars">${renderStars(avgRating)}</div>
                        <div class="rating-count">${ratingCount} ${getReviewWord(ratingCount)}</div>
                    </div>
                    <div class="rating-distribution">
                        ${[5,4,3,2,1].map(star => `
                            <div class="dist-bar">
                                <div class="dist-label">${star} ★</div>
                                <div class="dist-bar-fill">
                                    <span style="width: ${ratingCount ? (ratingDistribution[star] / ratingCount * 100) : 0}%"></span>
                                </div>
                                <div class="dist-count">${ratingDistribution[star] || 0}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            
            <div class="reviews-section">
                <h2>📝 Отзывы игроков (${totalReviews})</h2>
                ${reviewsList(reviews)}
                ${renderPagination(page, totalPages, `/server/${server.slug}`)}
                ${totalReviews === 0 ? '<div class="empty-reviews">Пока нет отзывов. Будьте первым!</div>' : ''}
            </div>
            
            ${similarServers.length ? renderSimilarServers(similarServers) : ''}
        `;
        
        res.send(baseLayout({
            title: `${server.name} — сервер Lineage 2 ${server.version} | Рейтинг, отзывы, рейты`,
            description: generateServerMetaDescription(server),
            canonical: `/server/${server.slug}`,
            breadcrumbs: renderBreadcrumbs([
                { name: 'Главная', url: '/' },
                { name: server.version || 'Interlude', url: `/version/${(server.version || 'interlude').toLowerCase()}` },
                { name: server.name, url: '' }
            ]),
            content
        }));
    } catch (err) {
        console.error('Server page error:', err);
        res.status(500).send('Server error');
    }
}

// =============== СТРАНИЦЫ ВЕРСИЙ ===============
async function interlude(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const skip = (page - 1) * limit;
        
        const [servers, total] = await Promise.all([
            Server.find({ active: true, version: /interlude/i })
                .sort({ 'rating.average': -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Server.countDocuments({ active: true, version: /interlude/i })
        ]);
        
        const totalPages = Math.ceil(total / limit);
        
        const content = `
            <div class="version-header">
                <h1>${generateVersionH1('Interlude')}</h1>
                <p class="subtitle">Классическая версия Lineage 2 — любимая миллионами игроков</p>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card"><div class="number">${total}</div><div class="label">🎮 Серверов Interlude</div></div>
                <div class="stat-card"><div class="number">${servers.filter(s => s.status === 'VIP').length}</div><div class="label">⭐ VIP серверов</div></div>
            </div>
            
            <div class="servers-grid">
                ${servers.map(s => serverCard(s)).join('')}
            </div>
            ${renderPagination(page, totalPages, '/version/interlude')}
            ${generateSeoText('Interlude', total)}
        `;
        
        res.send(baseLayout({
            title: 'Серверы Lineage 2 Interlude 2026 | Рейтинг и каталог L2 Interlude серверов',
            description: 'Актуальный рейтинг серверов Lineage 2 Interlude 2026. Лучшие L2 Interlude серверы с высоким онлайном, честными рейтами и отзывами игроков.',
            canonical: '/version/interlude',
            breadcrumbs: renderBreadcrumbs([
                { name: 'Главная', url: '/' },
                { name: 'Interlude', url: '/version/interlude' }
            ]),
            content
        }));
    } catch (err) {
        console.error('Interlude page error:', err);
        res.status(500).send('Server error');
    }
}

async function highFive(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const skip = (page - 1) * limit;
        
        const [servers, total] = await Promise.all([
            Server.find({ active: true, version: /high five|hf/i })
                .sort({ 'rating.average': -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Server.countDocuments({ active: true, version: /high five|hf/i })
        ]);
        
        const totalPages = Math.ceil(total / limit);
        
        const content = `
            <div class="version-header">
                <h1>Серверы Lineage 2 High Five 2026</h1>
                <p class="subtitle">High Five — самая популярная версия с улучшенной графикой и сбалансированным PvP</p>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card"><div class="number">${total}</div><div class="label">🎮 Серверов High Five</div></div>
            </div>
            
            <div class="servers-grid">
                ${servers.map(s => serverCard(s)).join('')}
            </div>
            ${renderPagination(page, totalPages, '/version/high-five')}
            ${generateSeoText('High Five', total)}
        `;
        
        res.send(baseLayout({
            title: 'Серверы Lineage 2 High Five 2026 | Рейтинг L2 High Five серверов',
            description: 'Актуальный рейтинг серверов Lineage 2 High Five 2026. Лучшие L2 High Five серверы с улучшенной графикой.',
            canonical: '/version/high-five',
            breadcrumbs: renderBreadcrumbs([
                { name: 'Главная', url: '/' },
                { name: 'High Five', url: '/version/high-five' }
            ]),
            content
        }));
    } catch (err) {
        console.error('High Five page error:', err);
        res.status(500).send('Server error');
    }
}

async function classic(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const skip = (page - 1) * limit;
        
        const [servers, total] = await Promise.all([
            Server.find({ active: true, version: /classic/i })
                .sort({ 'rating.average': -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Server.countDocuments({ active: true, version: /classic/i })
        ]);
        
        const totalPages = Math.ceil(total / limit);
        
        const content = `
            <div class="version-header">
                <h1>Серверы Lineage 2 Classic 2026</h1>
                <p class="subtitle">Classic — возвращение к истокам игры, хардкорная прокачка и честная экономика</p>
            </div>
            
            <div class="servers-grid">
                ${servers.map(s => serverCard(s)).join('')}
            </div>
            ${renderPagination(page, totalPages, '/version/classic')}
            ${generateSeoText('Classic', total)}
        `;
        
        res.send(baseLayout({
            title: 'Серверы Lineage 2 Classic 2026 | Рейтинг L2 Classic серверов',
            description: 'Актуальный рейтинг серверов Lineage 2 Classic 2026. Лучшие Classic серверы с x1 рейтами.',
            canonical: '/version/classic',
            breadcrumbs: renderBreadcrumbs([
                { name: 'Главная', url: '/' },
                { name: 'Classic', url: '/version/classic' }
            ]),
            content
        }));
    } catch (err) {
        console.error('Classic page error:', err);
        res.status(500).send('Server error');
    }
}

async function essence(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const skip = (page - 1) * limit;
        
        const [servers, total] = await Promise.all([
            Server.find({ active: true, version: /essence/i })
                .sort({ 'rating.average': -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Server.countDocuments({ active: true, version: /essence/i })
        ]);
        
        const totalPages = Math.ceil(total / limit);
        
        const content = `
            <div class="version-header">
                <h1>Серверы Lineage 2 Essence 2026</h1>
                <p class="subtitle">Essence — современная версия с быстрой прокачкой и динамичным PvP</p>
            </div>
            
            <div class="servers-grid">
                ${servers.map(s => serverCard(s)).join('')}
            </div>
            ${renderPagination(page, totalPages, '/version/essence')}
            ${generateSeoText('Essence', total)}
        `;
        
        res.send(baseLayout({
            title: 'Серверы Lineage 2 Essence 2026 | Рейтинг L2 Essence серверов',
            description: 'Актуальный рейтинг серверов Lineage 2 Essence 2026. Лучшие Essence серверы с быстрой прокачкой.',
            canonical: '/version/essence',
            breadcrumbs: renderBreadcrumbs([
                { name: 'Главная', url: '/' },
                { name: 'Essence', url: '/version/essence' }
            ]),
            content
        }));
    } catch (err) {
        console.error('Essence page error:', err);
        res.status(500).send('Server error');
    }
}

// =============== СТРАНИЦЫ СПИСКОВ ===============
async function topServers(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const skip = (page - 1) * limit;
        
        const [servers, total] = await Promise.all([
            Server.find({ active: true })
                .sort({ 'rating.average': -1, 'rating.count': -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Server.countDocuments({ active: true })
        ]);
        
        const totalPages = Math.ceil(total / limit);
        
        const content = `
            <h1>🏆 Топ серверы Lineage 2</h1>
            <p class="subtitle">Лучшие серверы по рейтингу и отзывам игроков</p>
            <div class="servers-grid">
                ${servers.map(s => serverCard(s)).join('')}
            </div>
            ${renderPagination(page, totalPages, '/top-servers')}
            <div class="seo-content">
                <h2>Как формируется топ серверов?</h2>
                <p>Топ серверов составляется на основе рейтинга игроков, количества отзывов и активности проектов.</p>
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
        console.error('Top servers error:', err);
        res.status(500).send('Server error');
    }
}

async function newServers(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const skip = (page - 1) * limit;
        
        const [servers, total] = await Promise.all([
            Server.find({ active: true })
                .sort({ openingDate: -1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Server.countDocuments({ active: true })
        ]);
        
        const totalPages = Math.ceil(total / limit);
        
        const content = `
            <h1>🆕 Новые серверы Lineage 2</h1>
            <p class="subtitle">Свежие открытия серверов с лучшими условиями для старта</p>
            <div class="servers-grid">
                ${servers.map(s => serverCard(s)).join('')}
            </div>
            ${renderPagination(page, totalPages, '/new-servers')}
            <div class="seo-content">
                <h2>Почему стоит играть на новых серверах?</h2>
                <p>Новые серверы предлагают свежий старт без перекосов в экономике, равные условия для всех игроков.</p>
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
        console.error('New servers error:', err);
        res.status(500).send('Server error');
    }
}

async function allServers(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const skip = (page - 1) * limit;
        
        const [servers, total] = await Promise.all([
            Server.find({ active: true })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Server.countDocuments({ active: true })
        ]);
        
        const totalPages = Math.ceil(total / limit);
        
        const content = `
            <h1>📋 Все серверы Lineage 2</h1>
            <p class="subtitle">Полный каталог серверов Lineage 2 с рейтингами и отзывами</p>
            <div class="servers-grid">
                ${servers.map(s => serverCard(s)).join('')}
            </div>
            ${renderPagination(page, totalPages, '/all-servers')}
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
        console.error('All servers error:', err);
        res.status(500).send('Server error');
    }
}

async function vipServers(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const skip = (page - 1) * limit;
        
        const [servers, total] = await Promise.all([
            Server.find({ active: true, status: 'VIP' })
                .sort({ 'rating.average': -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Server.countDocuments({ active: true, status: 'VIP' })
        ]);
        
        const totalPages = Math.ceil(total / limit);
        
        const content = `
            <h1>⭐ VIP серверы Lineage 2</h1>
            <p class="subtitle">Лучшие VIP серверы с высокой стабильностью и большим онлайном</p>
            <div class="servers-grid">
                ${servers.map(s => serverCard(s)).join('')}
            </div>
            ${renderPagination(page, totalPages, '/vip-servers')}
            <div class="seo-content">
                <h2>Преимущества VIP серверов</h2>
                <p>VIP серверы отличаются высокой стабильностью, профессиональной администрацией и большим онлайн-сообществом.</p>
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
        console.error('VIP servers error:', err);
        res.status(500).send('Server error');
    }
}

async function pvpServers(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const skip = (page - 1) * limit;
        
        const [servers, total] = await Promise.all([
            Server.find({ 
                active: true,
                status: { $in: ['VIP', 'Почти VIP'] }
            }).sort({ 'rating.average': -1 }).skip(skip).limit(limit).lean(),
            Server.countDocuments({ 
                active: true,
                status: { $in: ['VIP', 'Почти VIP'] }
            })
        ]);
        
        const totalPages = Math.ceil(total / limit);
        
        const content = `
            <h1>⚔️ PvP серверы Lineage 2</h1>
            <p class="subtitle">Лучшие PvP серверы для массовых сражений и осад</p>
            <div class="servers-grid">
                ${servers.map(s => serverCard(s)).join('')}
            </div>
            ${renderPagination(page, totalPages, '/pvp-servers')}
            <div class="seo-content">
                <h2>Лучшие серверы для PvP</h2>
                <p>PvP серверы созданы для тех, кто любит массовые сражения, осады замков и олимпиады.</p>
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
        console.error('PvP servers error:', err);
        res.status(500).send('Server error');
    }
}

// =============== СТАТИЧЕСКИЕ СТРАНИЦЫ ===============
function about(req, res) {
    res.sendFile('about.html', { root: './public' });
}

function download(req, res) {
    res.sendFile('download.html', { root: './public' });
}

function contacts(req, res) {
    res.sendFile('contacts.html', { root: './public' });
}

function privacy(req, res) {
    res.sendFile('privacy.html', { root: './public' });
}

function terms(req, res) {
    res.sendFile('terms.html', { root: './public' });
}

function disclaimer(req, res) {
    res.sendFile('disclaimer.html', { root: './public' });
}

function dmca(req, res) {
    res.sendFile('dmca.html', { root: './public' });
}

function cookies(req, res) {
    res.sendFile('cookies.html', { root: './public' });
}

// =============== SITEMAP ===============
async function sitemap(req, res) {
    try {
        const servers = await Server.find({ active: true }).select('slug updatedAt').lean();
        const baseUrl = `http://localhost:${process.env.PORT || 3000}`;
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
            xml += `  <url>\n    <loc>${baseUrl}/server/${server.slug}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
        }
        
        xml += '</urlset>';
        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (err) {
        console.error('Sitemap error:', err);
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

// =============== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===============
function getStatusClass(status) {
    if (status === 'VIP') return 'vip';
    if (status === 'Почти VIP') return 'almost';
    return 'normal';
}

function renderStars(rating) {
    if (!rating || rating === 0) return '☆☆☆☆☆';
    const full = Math.floor(rating);
    let stars = '';
    for (let i = 0; i < full; i++) stars += '★';
    for (let i = stars.length; i < 5; i++) stars += '☆';
    return stars;
}

function getReviewWord(count) {
    if (count % 10 === 1 && count % 100 !== 11) return 'отзыв';
    if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'отзыва';
    return 'отзывов';
}

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
            <h3>📊 Характеристики сервера</h3>
            <div class="rates-container">
                ${allRates.map(rate => `
                    <div class="rate-item">
                        <span class="rate-label">${rate.label}:</span>
                        <span class="rate-value">${escapeHtml(rate.value)}</span>
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
    robots,
    about,
    download,
    contacts,
    privacy,
    terms,
    disclaimer,
    dmca,
    cookies
};