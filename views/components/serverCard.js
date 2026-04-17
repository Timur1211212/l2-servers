// views/components/serverCard.js
const { escapeHtml, renderStars, getReviewWord, truncateText } = require('../../utils/htmlHelpers');

function serverCard(server, isInCompare = false) {
    const statusClass = server.status === 'VIP' ? 'badge-vip' : 
                       (server.status === 'Почти VIP' ? 'badge-almost' : 'badge-normal');
    const avgRating = server.rating?.average || 0;
    const reviewCount = server.rating?.count || 0;
    
    const compareBtnText = isInCompare ? '✓ В сравнении' : '📊 Сравнить';
    const compareBtnDisabled = isInCompare ? 'disabled' : '';
    
    return `
        <div class="server-card" data-server-id="${server._id}">
            <div class="server-card-content">
                ${server.logo ? `
                    <div class="server-logo">
                        <img src="${escapeHtml(server.logo)}" alt="${escapeHtml(server.name)}" loading="lazy">
                    </div>
                ` : `
                    <div class="server-logo placeholder">
                        <span>🎮</span>
                    </div>
                `}
                
                <div class="server-details">
                    <a href="/server/${server.slug || server._id}" class="server-name-link">
                        <h3 class="server-name">${escapeHtml(server.name)}</h3>
                    </a>
                    
                    <div class="server-meta">
                        <span class="badge ${statusClass}">${escapeHtml(server.status)}</span>
                        <span class="server-version">📌 ${escapeHtml(server.version || 'Interlude')}</span>
                        ${server.openingDate ? `<span class="server-date">📅 ${new Date(server.openingDate).toLocaleDateString()}</span>` : ''}
                    </div>
                    
                    <div class="server-rates">
                        ${server.exp ? `<span class="rate">⚡ ${escapeHtml(server.exp)}</span>` : ''}
                        ${server.drop ? `<span class="rate">💀 ${escapeHtml(server.drop)}</span>` : ''}
                        ${server.adena ? `<span class="rate">💰 ${escapeHtml(server.adena)}</span>` : ''}
                    </div>
                    
                    ${server.tags && server.tags.length ? `
                        <div class="server-tags">
                            ${server.tags.slice(0, 3).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                        </div>
                    ` : ''}
                    
                    <div class="review-summary">
                        <div class="rating-stars">${renderStars(avgRating)}</div>
                        <div class="review-count">${reviewCount} ${getReviewWord(reviewCount)}</div>
                        <button class="btn-write-review" onclick="openReviewModal('${server._id}')" title="Написать отзыв">✍️</button>
                    </div>
                    
                    <div class="server-actions">
                        <button class="btn-compare" onclick="addToCompare('${server._id}')" ${compareBtnDisabled}>
                            ${compareBtnText}
                        </button>
                        <a href="${escapeHtml(server.website)}" target="_blank" class="btn-play">Играть →</a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

module.exports = { serverCard };