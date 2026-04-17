// public/js/global.js
console.log('global.js загружен');

// Функция для открытия модального окна отзыва
window.openReviewModal = function(serverId) {
    console.log('openReviewModal вызвана, ID сервера:', serverId);
    
    // Проверка валидности serverId
    if (!serverId || serverId === 'null' || serverId === 'undefined' || serverId === '') {
        console.error('❌ Ошибка: передан невалидный serverId:', serverId);
        alert('Ошибка: не удалось определить сервер. Пожалуйста, обновите страницу и попробуйте снова.');
        return;
    }
    
    const modal = document.getElementById('reviewModal');
    const serverIdInput = document.getElementById('reviewServerId');
    
    if (!modal) {
        console.error('❌ Модальное окно reviewModal не найдено!');
        return;
    }
    
    if (serverIdInput) {
        serverIdInput.value = serverId;
        console.log('✅ serverId установлен в поле формы:', serverId);
    } else {
        console.error('❌ Поле #reviewServerId не найдено в форме!');
        return;
    }
    
    // Очистка формы
    const form = document.getElementById('reviewForm');
    if (form) form.reset();
    
    // Сброс звезд рейтинга
    const stars = document.querySelectorAll('#reviewModal .stars span');
    stars.forEach(star => {
        star.classList.remove('active');
        star.textContent = '☆';
    });
    
    // Сброс скрытого поля рейтинга
    const reviewRating = document.getElementById('reviewRating');
    if (reviewRating) reviewRating.value = '';
    
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
};

// Функция для открытия модального окна со списком отзывов
window.openReviewsModal = function(serverId, serverName) {
    console.log('openReviewsModal вызвана, сервер:', serverName, 'ID:', serverId);
    
    if (!serverId || serverId === 'null') {
        console.error('❌ Ошибка: невалидный serverId');
        return;
    }
    
    const modal = document.getElementById('reviewsListModal');
    const title = document.getElementById('reviewsModalTitle');
    
    if (!modal) {
        console.error('❌ Модальное окно reviewsListModal не найдено!');
        return;
    }
    
    if (title) title.innerHTML = `📝 Отзывы о сервере "${escapeHtml(serverName)}"`;
    
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
    
    window.loadReviewsList(serverId, 1);
};

// Функция для загрузки списка отзывов
window.loadReviewsList = async function(serverId, page) {
    const container = document.getElementById('reviewsModalList');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Загрузка отзывов...</div>';
    
    try {
        const response = await fetch(`/api/servers/${serverId}/reviews?page=${page}`);
        const data = await response.json();
        
        if (!data.reviews || !data.reviews.length) {
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

// Функция для добавления в сравнение
window.addToCompare = function(serverId) {
    console.log('addToCompare вызвана, ID сервера:', serverId);
    
    if (!serverId || serverId === 'null') {
        console.error('❌ Ошибка: невалидный serverId');
        return;
    }
    
    // TODO: добавить логику сравнения
    alert('Функция сравнения будет добавлена позже. Сервер ID: ' + serverId);
};

// Вспомогательная функция для закрытия модальных окон
window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
    document.body.classList.remove('modal-open');
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