// views/components/serverCard.js
const { escapeHtml, renderStars, getReviewWord, truncateText } = require('../../utils/htmlHelpers');

function serverCard(server, isInCompare = false) {
    const statusClass = server.status === 'VIP' ? 'badge-vip' : 
                       (server.status === 'Почти VIP' ? 'badge-almost' : 'badge-normal');
    const avgRating = server.rating?.average || 0;
    const reviewCount = server.rating?.count || 0;
    
    // Основные рейты
    const mainRates = [
        { label: 'Exp', value: server.exp },
        { label: 'Adena', value: server.adena },
        { label: 'Drop', value: server.drop }
    ].filter(r => r.value && r.value.trim());
    
    const extraRates = [
        { label: 'Spoil', value: server.spoil },
        { label: 'Spoil Chance', value: server.spoilChance },
        { label: 'Sealstone', value: server.sealstone }
    ].filter(r => r.value && r.value.trim());
    
    const compareBtnText = isInCompare ? '✓ В сравнении' : '📊 Сравнить';
    const compareBtnDisabled = isInCompare ? 'disabled' : '';
    
    return `
        <div class="server-card" data-server-id="${server._id}" itemscope itemtype="https://schema.org/VideoGame">
            <meta itemprop="name" content="${escapeHtml(server.name)}">
            <meta itemprop="url" content="${escapeHtml(server.website)}">
            
            <a href="/server/${server.slug || server._id}" class="server-name-link">
                <h3 class="server-name">${escapeHtml(server.name)}</h3>
            </a>
            
            <div class="server-website">
                <a href="${escapeHtml(server.website)}" target="_blank" rel="nofollow noopener external">
                    🌐 ${escapeHtml(server.website)}
                </a>
            </div>
            
            <div class="server-meta">
                <span class="badge ${statusClass}">${escapeHtml(server.status)}</span>
                <span class="server-version">📌 ${escapeHtml(server.version || 'Interlude')}</span>
                ${server.openingDate ? `<span class="server-version">📅 ${new Date(server.openingDate).toLocaleDateString()}</span>` : ''}
            </div>
            
            ${mainRates.length ? `
                <div class="server-rates">
                    ${mainRates.map(r => `
                        <div class="rate-item">
                            <span class="rate-label">${r.label}:</span>
                            <span class="rate-value">${escapeHtml(r.value)}</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            ${extraRates.length ? `
                <div id="extra-rates-${server._id}" class="server-rates extra-rates" style="display: none;">
                    ${extraRates.map(r => `
                        <div class="rate-item">
                            <span class="rate-label">${r.label}:</span>
                            <span class="rate-value">${escapeHtml(r.value)}</span>
                        </div>
                    `).join('')}
                </div>
                <button class="btn-show-all" onclick="toggleAllRates('${server._id}', this)">
                    📊 Показать все характеристики (${extraRates.length})
                </button>
            ` : ''}
            
            ${server.description ? `
                <div class="server-description" itemprop="description">
                    📝 ${escapeHtml(truncateText(server.description, 100))}
                </div>
            ` : ''}
            
            <div class="review-summary">
                <div class="rating-stars" itemprop="aggregateRating" itemscope itemtype="https://schema.org/AggregateRating">
                    <meta itemprop="ratingValue" content="${avgRating}">
                    <meta itemprop="reviewCount" content="${reviewCount}">
                    ${renderStars(avgRating)}
                </div>
                <div class="review-count">${reviewCount} ${getReviewWord(reviewCount)}</div>
                <button class="btn-write-review" onclick="openReviewModal('${server._id}')">✍️ Написать отзыв</button>
            </div>
            
            <div class="server-actions">
                <button class="btn-compare" onclick="addToCompare('${server._id}')" ${compareBtnDisabled}>
                    ${compareBtnText}
                </button>
                <a href="${escapeHtml(server.website)}" target="_blank" rel="nofollow noopener external" class="btn-play">
                    🎮 Играть
                </a>
            </div>
            
            <button class="btn-reviews" onclick="openReviewsModal('${server._id}', '${escapeHtml(server.name)}')">
                📝 Читать отзывы
            </button>
        </div>
    `;
}

module.exports = { serverCard };