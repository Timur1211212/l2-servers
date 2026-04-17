// views/components/stars.js

// Рендер звезд рейтинга (★ и ☆)
function renderStars(rating) {
    if (!rating || rating === 0) return '☆☆☆☆☆';
    const full = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < full; i++) stars += '★';
    if (hasHalf) stars += '½';
    for (let i = stars.length; i < 5; i++) stars += '☆';
    
    return stars;
}

// Рендер звезд с числовым значением (для Schema.org)
function renderStarsWithMeta(rating) {
    const starsHtml = renderStars(rating);
    return `
        <div class="rating-stars" itemprop="aggregateRating" itemscope itemtype="https://schema.org/AggregateRating">
            <meta itemprop="ratingValue" content="${rating}">
            <meta itemprop="bestRating" content="5">
            <meta itemprop="worstRating" content="1">
            ${starsHtml}
        </div>
    `;
}

// Рендер интерактивных звезд для формы отзыва
function renderInteractiveStars(name = 'rating') {
    return `
        <div class="stars" data-rating-name="${name}">
            <span data-rating="1" class="star">☆</span>
            <span data-rating="2" class="star">☆</span>
            <span data-rating="3" class="star">☆</span>
            <span data-rating="4" class="star">☆</span>
            <span data-rating="5" class="star">☆</span>
        </div>
        <input type="hidden" id="${name}" name="${name}" value="">
    `;
}

// Рендер распределения рейтинга (для страницы сервера)
function renderRatingDistribution(rating) {
    const avgRating = rating?.average || 0;
    const count = rating?.count || 0;
    const distribution = rating?.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    if (count === 0) {
        return `
            <div class="rating-distribution-empty">
                <p>⭐ Пока нет оценок. Будьте первым, кто оценит этот сервер!</p>
            </div>
        `;
    }
    
    return `
        <div class="rating-distribution">
            ${[5, 4, 3, 2, 1].map(star => {
                const percent = (distribution[star] / count) * 100;
                return `
                    <div class="dist-bar">
                        <div class="dist-label">${star} ★</div>
                        <div class="dist-bar-fill">
                            <span style="width: ${percent}%" class="dist-fill"></span>
                        </div>
                        <div class="dist-count">${distribution[star]}</div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

// Рендер краткой сводки рейтинга (для карточки сервера)
function renderRatingSummary(rating) {
    const avgRating = rating?.average || 0;
    const count = rating?.count || 0;
    
    if (count === 0) {
        return `
            <div class="review-summary">
                <div class="rating-stars">☆☆☆☆☆</div>
                <div class="review-count">Нет отзывов</div>
                <button class="btn-write-review-small">✍️ Оценить</button>
            </div>
        `;
    }
    
    return `
        <div class="review-summary">
            <div class="rating-stars">${renderStars(avgRating)}</div>
            <div class="review-count">${count} ${getReviewWord(count)}</div>
            <button class="btn-write-review-small" onclick="openReviewModal(this.dataset.serverId)" data-server-id="${serverId}">✍️ Написать отзыв</button>
        </div>
    `;
}

// Вспомогательная функция для склонения слова "отзыв"
function getReviewWord(count) {
    if (count % 10 === 1 && count % 100 !== 11) return 'отзыв';
    if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'отзыва';
    return 'отзывов';
}

// Рендер большой звезды для страницы сервера
function renderBigStar(rating) {
    const avgRating = rating?.average || 0;
    const count = rating?.count || 0;
    
    return `
        <div class="rating-big">
            <div class="rating-value">${avgRating.toFixed(1)}</div>
            <div class="rating-stars-big">${renderStars(avgRating)}</div>
            <div class="rating-count">${count} ${getReviewWord(count)}</div>
        </div>
    `;
}

module.exports = {
    renderStars,
    renderStarsWithMeta,
    renderInteractiveStars,
    renderRatingDistribution,
    renderRatingSummary,
    renderBigStar,
    getReviewWord
};