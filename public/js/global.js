// public/js/global.js
// Глобальные функции для работы кнопок на сайте

window.openReviewModal = function(serverId) {
    console.log('openReviewModal called with serverId:', serverId);
    const modal = document.getElementById('reviewModal');
    const serverIdInput = document.getElementById('reviewServerId');
    
    if (!modal) {
        console.error('Modal element not found!');
        return;
    }
    
    if (serverIdInput) serverIdInput.value = serverId;
    
    // Очистка формы
    const form = document.getElementById('reviewForm');
    if (form) form.reset();
    
    // Сброс звезд рейтинга
    const stars = document.querySelectorAll('#reviewModal .stars span');
    stars.forEach(star => {
        star.classList.remove('active');
        star.textContent = '☆';
    });
    
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
};

window.closeReviewModal = function() {
    const modal = document.getElementById('reviewModal');
    if (modal) modal.style.display = 'none';
    document.body.classList.remove('modal-open');
};

window.openReviewsModal = function(serverId, serverName) {
    console.log('openReviewsModal called:', serverId, serverName);
    const modal = document.getElementById('reviewsListModal');
    const title = document.getElementById('reviewsModalTitle');
    
    if (!modal) return;
    if (title) title.innerHTML = `📝 Отзывы о сервере "${escapeHtml(serverName)}"`;
    
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
    
    // Загрузка отзывов
    window.loadReviewsList(serverId, 1);
};

window.closeReviewsModal = function() {
    const modal = document.getElementById('reviewsListModal');
    if (modal) modal.style.display = 'none';
    document.body.classList.remove('modal-open');
};

window.loadReviewsList = async function(serverId, page) {
    const container = document.getElementById('reviewsModalList');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Загрузка отзывов...</div>';
    
    try {
        const response = await fetch(`/api/servers/${serverId}/reviews?page=${page}`);
        const data = await response.json();
        
        if (!data.reviews.length) {
            container.innerHTML = '<div class="empty">📝 Пока нет отзывов. Будьте первым!</div>';
            return;
        }
        
        container.innerHTML = data.reviews.map(review => `
            <div class="review-card">
                <div class="review-header">
                    <span class="review-author">${escapeHtml(review.authorName)}</span>
                    <span class="review-rating">${renderStarsGlobal(review.rating)}</span>
                    <span class="review-date">${new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <div class="review-title">${escapeHtml(review.title)}</div>
                <div class="review-content">${escapeHtml(review.content)}</div>
                ${review.pros ? `<div class="review-pros">✅ Плюсы: ${escapeHtml(review.pros)}</div>` : ''}
                ${review.cons ? `<div class="review-cons">❌ Минусы: ${escapeHtml(review.cons)}</div>` : ''}
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading reviews:', error);
        container.innerHTML = '<div class="empty">❌ Ошибка загрузки отзывов</div>';
    }
};

window.addToCompare = function(serverId) {
    console.log('addToCompare called with serverId:', serverId);
    // Здесь будет логика добавления в сравнение
    alert('Функция сравнения будет добавлена позже. Сервер ID: ' + serverId);
};

// Вспомогательные функции
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function renderStarsGlobal(rating) {
    if (!rating || rating === 0) return '☆☆☆☆☆';
    const full = Math.floor(rating);
    let stars = '';
    for (let i = 0; i < full; i++) stars += '★';
    for (let i = stars.length; i < 5; i++) stars += '☆';
    return stars;
}