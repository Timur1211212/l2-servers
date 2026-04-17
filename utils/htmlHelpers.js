// utils/htmlHelpers.js
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
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

function formatDate(date) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('ru-RU');
}

function truncateText(text, maxLength = 100) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

module.exports = {
    escapeHtml,
    renderStars,
    getReviewWord,
    formatDate,
    truncateText
};