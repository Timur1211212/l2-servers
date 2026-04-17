// views/components/reviewCard.js
const { escapeHtml, renderStars, formatDate } = require('../../utils/htmlHelpers');

function reviewCard(review, showHelpful = true) {
    return `
        <div class="review-card" data-review-id="${review._id}" itemscope itemtype="https://schema.org/Review">
            <meta itemprop="datePublished" content="${review.createdAt}">
            <div class="review-header">
                <span class="review-author" itemprop="author" itemscope itemtype="https://schema.org/Person">
                    <span itemprop="name">${escapeHtml(review.authorName)}</span>
                </span>
                <span class="review-rating" itemprop="reviewRating" itemscope itemtype="https://schema.org/Rating">
                    <meta itemprop="ratingValue" content="${review.rating}">
                    ${renderStars(review.rating)}
                </span>
                <span class="review-date">${formatDate(review.createdAt)}</span>
            </div>
            <div class="review-title" itemprop="name">${escapeHtml(review.title)}</div>
            <div class="review-content" itemprop="reviewBody">${escapeHtml(review.content)}</div>
            ${review.pros ? `<div class="review-pros">✅ Плюсы: ${escapeHtml(review.pros)}</div>` : ''}
            ${review.cons ? `<div class="review-cons">❌ Минусы: ${escapeHtml(review.cons)}</div>` : ''}
            ${showHelpful ? `
                <div class="review-helpful">
                    <button class="helpful-btn ${review.userVotedHelpful ? 'active' : ''}" 
                            onclick="markHelpful('${review._id}', true, this)">
                        👍 Полезно (<span class="helpful-count">${review.helpful}</span>)
                    </button>
                    <button class="helpful-btn ${review.userVotedNotHelpful ? 'active' : ''}" 
                            onclick="markHelpful('${review._id}', false, this)">
                        👎 Бесполезно (<span class="nothelpful-count">${review.notHelpful}</span>)
                    </button>
                </div>
            ` : ''}
        </div>
    `;
}

function reviewsList(reviews, showHelpful = true) {
    if (!reviews || reviews.length === 0) {
        return '<div class="empty">📝 Пока нет отзывов. Будьте первым!</div>';
    }
    return reviews.map(review => reviewCard(review, showHelpful)).join('');
}

module.exports = { reviewCard, reviewsList };