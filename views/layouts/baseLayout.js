// views/layouts/baseLayout.js
const { escapeHtml } = require('../../utils/htmlHelpers');
const { renderHeader } = require('../components/header');
const { renderFooter } = require('../components/footer');
const { generateOpenGraphTags } = require('../../utils/seoHelpers');

function baseLayout({ 
    title, 
    description, 
    keywords = '', 
    canonical, 
    breadcrumbs = '', 
    content, 
    schema = null,
    ogImage = '/og-image.jpg',
    ogType = 'website',
    noIndex = false,
    additionalStyles = '',
    additionalScripts = ''
}) {
    const schemaTags = schema ? `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>` : '';
    
    return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    ${keywords ? `<meta name="keywords" content="${escapeHtml(keywords)}">` : ''}
    ${noIndex ? '<meta name="robots" content="noindex, nofollow">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
    <link rel="canonical" href="https://zerokulasite.ru${canonical}">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    
    <!-- CSS -->
    <link rel="stylesheet" href="/css/style.css">
    
    ${generateOpenGraphTags({
        type: ogType,
        url: canonical,
        title,
        description,
        image: ogImage
    })}
    ${schemaTags}
    ${additionalStyles}
</head>
<body>
    ${renderHeader()}
    
    <main class="main-content">
        <div class="container">
            ${breadcrumbs}
            ${content}
        </div>
    </main>
    
    ${renderFooter()}
    
    <button id="backToTop" class="back-to-top" aria-label="Наверх">↑</button>
    
    <script src="/js/main.js" defer></script>
    <script src="/js/main.js" defer></script>
    <script src="/js/global.js" defer></script>
    ${additionalScripts}
    <!-- Модальное окно для написания отзыва -->
<div id="reviewModal" class="modal" style="display: none;">
    <div class="modal-content">
        <span class="close" onclick="window.closeModal('reviewModal')">&times;</span>
        <h3>✍️ Написать отзыв о сервере</h3>
        <form id="reviewForm">
            <input type="hidden" id="reviewServerId">
            <div class="form-group">
                <label>Ваше имя *</label>
                <input type="text" id="reviewAuthor" required placeholder="Как вас называть?" maxlength="50">
            </div>
            <div class="form-group">
                <label>Оценка *</label>
                <div class="stars">
                    <span data-rating="1">☆</span>
                    <span data-rating="2">☆</span>
                    <span data-rating="3">☆</span>
                    <span data-rating="4">☆</span>
                    <span data-rating="5">☆</span>
                </div>
                <input type="hidden" id="reviewRating" required>
            </div>
            <div class="form-group">
                <label>Заголовок отзыва *</label>
                <input type="text" id="reviewTitle" required placeholder="Кратко о вашем опыте" maxlength="100">
            </div>
            <div class="form-group">
                <label>Текст отзыва *</label>
                <textarea id="reviewContent" rows="4" required placeholder="Расскажите подробнее о сервере..." maxlength="1520"></textarea>
            </div>
            <div class="form-group">
                <label>Плюсы</label>
                <textarea id="reviewPros" rows="2" placeholder="Что вам понравилось?" maxlength="300"></textarea>
            </div>
            <div class="form-group">
                <label>Минусы</label>
                <textarea id="reviewCons" rows="2" placeholder="Что можно улучшить?" maxlength="300"></textarea>
            </div>
            <button type="submit" class="btn-submit">📨 Отправить отзыв</button>
        </form>
    </div>
</div>

<!-- Модальное окно для просмотра отзывов -->
<div id="reviewsListModal" class="modal" style="display: none;">
    <div class="modal-content modal-reviews">
        <span class="close-reviews" onclick="window.closeModal('reviewsListModal')">&times;</span>
        <h3 id="reviewsModalTitle">📝 Отзывы о сервере</h3>
        <div id="reviewsModalList" class="reviews-modal-list"></div>
        <div id="reviewsModalPagination" class="pagination"></div>
    </div>
</div>
</body>
</html>`;
}

module.exports = { baseLayout };