// views/components/popularSearches.js
const { escapeHtml } = require('../../utils/htmlHelpers');

const popularSearches = [
    { query: 'серверы интерлюд с высоким онлайном', url: '/version/interlude', icon: '🔥' },
    { query: 'l2 high five x1000', url: '/version/high-five', icon: '⚡' },
    { query: 'классик сервер без доната', url: '/version/classic', icon: '🏛️' },
    { query: 'пвп серверы lineage 2', url: '/pvp-servers', icon: '⚔️' },
    { query: 'новые серверы l2 2026', url: '/new-servers', icon: '🆕' },
    { query: 'vip серверы lineage 2', url: '/vip-servers', icon: '⭐' },
    { query: 'interlude x1 хардкор', url: '/version/interlude?filter=x1', icon: '🎯' },
    { query: 'high five с расой камаэль', url: '/version/high-five', icon: '🧝' },
    { query: 'лучший сервер l2 для новичков', url: '/all-servers?sort=rating', icon: '🌟' },
    { query: 'сервер с автоматическим лутом', url: '/version/essence', icon: '🤖' }
];

function renderPopularSearches() {
    return `
        <div class="popular-searches">
            <div class="container">
                <div class="popular-searches-inner">
                    <div class="popular-searches-title">
                        <span class="title-icon">🔍</span>
                        <span>Часто ищут:</span>
                    </div>
                    <div class="popular-searches-list">
                        ${popularSearches.map(s => `
                            <a href="${escapeHtml(s.url)}" class="popular-search-link">
                                <span class="search-icon">${s.icon}</span>
                                <span class="search-text">${escapeHtml(s.query)}</span>
                            </a>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

module.exports = { renderPopularSearches, popularSearches };