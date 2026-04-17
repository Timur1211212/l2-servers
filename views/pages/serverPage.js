// views/pages/serverPage.js
const { baseLayout } = require('../layouts/baseLayout');
const { renderBreadcrumbs } = require('../components/breadcrumbs');
const { serverCard } = require('../components/serverCard');
const { reviewsList } = require('../components/reviewCard');
const { 
    escapeHtml, 
    renderStars, 
    getReviewWord, 
    formatDate 
} = require('../../utils/htmlHelpers');
const { 
    generateServerH1, 
    generateServerH2, 
    generateServerMetaDescription, 
    generateServerMetaKeywords,
    generateProductSchema 
} = require('../../utils/seoHelpers');

function generateServerPage(server, reviews, totalReviews, similarServers, ogImage) {
    const avgRating = server.rating?.average || 0;
    const ratingCount = server.rating?.count || 0;
    const distribution = server.rating?.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    const breadcrumbs = renderBreadcrumbs([
        { name: 'Главная', url: '/' },
        { name: server.version || 'Interlude', url: `/version/${(server.version || 'interlude').toLowerCase()}` },
        { name: server.name, url: '' }
    ]);
    
    const content = `
        <div class="server-header">
            <h1>${generateServerH1(server)}</h1>
            ${generateServerH2(server)}
            
            <div class="server-status ${getStatusClass(server.status)}">
                ${escapeHtml(server.status)} — ${getStatusText(server.status)}
            </div>
            
            <div class="server-website">
                <a href="${escapeHtml(server.website)}" target="_blank" rel="nofollow noopener external">
                    🌐 ${escapeHtml(server.website)}
                </a>
            </div>
            
            <div class="server-actions-header">
                <a href="${escapeHtml(server.website)}" target="_blank" class="btn-play">🎮 Играть на сервере →</a>
                <button class="btn-write-review" onclick="openReviewModal('${server._id}')">✍️ Написать отзыв</button>
            </div>
        </div>
        
        ${renderRatesTable(server)}
        
        ${server.description ? `<div class="server-description">${escapeHtml(server.description)}</div>` : ''}
        
        <div class="rating-section">
            <h3>⭐ Рейтинг сервера</h3>
            <div class="rating-summary">
                <div class="rating-big">
                    <div class="score">${avgRating.toFixed(1)}</div>
                    <div class="stars">${renderStars(avgRating)}</div>
                    <div class="review-count">${ratingCount} ${getReviewWord(ratingCount)}</div>
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
        </div>
        
        <div class="reviews-section">
            <h3>📝 Отзывы игроков (${totalReviews})</h3>
            ${reviewsList(reviews)}
            ${totalReviews > 5 ? `
                <div class="reviews-more">
                    <button class="btn-reviews" onclick="openReviewsModal('${server._id}', '${escapeHtml(server.name)}')">
                        📖 Показать все ${totalReviews} отзывов →
                    </button>
                </div>
            ` : ''}
        </div>
        
        ${similarServers.length ? renderSimilarServers(similarServers) : ''}
        
        <div class="version-links-footer">
            <h3>📌 Другие версии Lineage 2</h3>
            <div class="version-links">
                <a href="/version/interlude" class="version-link">Interlude</a>
                <a href="/version/high-five" class="version-link">High Five</a>
                <a href="/version/classic" class="version-link">Classic</a>
                <a href="/version/essence" class="version-link">Essence</a>
                <a href="/top-servers" class="version-link">🏆 Топ серверы</a>
            </div>
        </div>
    `;
    
    const schema = generateProductSchema(server);
    
    return baseLayout({
        title: `${server.name} — сервер Lineage 2 ${server.version} | Рейтинг, отзывы, рейты`,
        description: generateServerMetaDescription(server),
        keywords: generateServerMetaKeywords(server),
        canonical: `/server/${server.slug || server._id}`,
        breadcrumbs,
        content,
        schema,
        ogImage
    });
}

function getStatusClass(status) {
    if (status === 'VIP') return 'vip';
    if (status === 'Почти VIP') return 'almost';
    return 'normal';
}

function getStatusText(status) {
    if (status === 'VIP') return 'VIP сервер — лучшие условия, высокий онлайн';
    if (status === 'Почти VIP') return 'Почти VIP — отличный сервер с хорошими условиями';
    return 'Обычный сервер — стабильная игра без накруток';
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
                        <div class="version">${escapeHtml(s.version || 'Interlude')}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

module.exports = { generateServerPage };