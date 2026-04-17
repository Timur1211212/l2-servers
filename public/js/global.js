// public/js/global.js
console.log('✅ global.js загружен');

// =============== ОТКРЫТИЕ МОДАЛЬНОГО ОКНА ОТЗЫВА ===============
window.openReviewModal = function(serverId) {
    console.log('📝 openReviewModal вызвана, ID сервера:', serverId);
    
    if (!serverId || serverId === 'null' || serverId === 'undefined') {
        console.error('❌ Ошибка: невалидный serverId:', serverId);
        alert('Ошибка: не удалось определить сервер. Пожалуйста, обновите страницу.');
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
        console.log('✅ serverId установлен:', serverId);
    } else {
        console.error('❌ Поле reviewServerId не найдено!');
        return;
    }
    
    // Очистка формы
    const form = document.getElementById('reviewForm');
    if (form) form.reset();
    
    // Сброс скрытого поля рейтинга
    const ratingInput = document.getElementById('reviewRating');
    if (ratingInput) ratingInput.value = '';
    
    // Сброс звёзд
    const stars = document.querySelectorAll('#reviewModal .stars span');
    stars.forEach(star => {
        star.classList.remove('active');
        star.textContent = '☆';
    });
    
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
};

// =============== ЗАКРЫТИЕ МОДАЛЬНОГО ОКНА ОТЗЫВА ===============
window.closeReviewModal = function() {
    const modal = document.getElementById('reviewModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        console.log('✅ Модальное окно отзыва закрыто');
    }
};

// =============== ОТКРЫТИЕ МОДАЛЬНОГО ОКНА СПИСКА ОТЗЫВОВ ===============
window.openReviewsModal = function(serverId, serverName) {
    console.log('📖 openReviewsModal вызвана, сервер:', serverName, 'ID:', serverId);
    
    if (!serverId || serverId === 'null' || serverId === 'undefined') {
        console.error('❌ Ошибка: невалидный serverId');
        return;
    }
    
    const modal = document.getElementById('reviewsListModal');
    const title = document.getElementById('reviewsModalTitle');
    
    if (!modal) {
        console.error('❌ Модальное окно reviewsListModal не найдено!');
        return;
    }
    
    if (title) {
        title.innerHTML = `📝 Отзывы о сервере "${escapeHtml(serverName)}"`;
    }
    
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
    
    // Загружаем отзывы
    window.loadReviewsList(serverId, 1);
};

// =============== ЗАКРЫТИЕ МОДАЛЬНОГО ОКНА СПИСКА ОТЗЫВОВ ===============
window.closeReviewsModal = function() {
    const modal = document.getElementById('reviewsListModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        console.log('✅ Модальное окно списка отзывов закрыто');
    }
};

// =============== ЗАГРУЗКА СПИСКА ОТЗЫВОВ ===============
window.loadReviewsList = async function(serverId, page) {
    console.log('🔄 Загрузка отзывов для сервера:', serverId, 'страница:', page);
    
    const container = document.getElementById('reviewsModalList');
    if (!container) return;
    
    container.innerHTML = '<div class="loading"><div class="loading-spinner"></div><div>Загрузка отзывов...</div></div>';
    
    try {
        const response = await fetch(`/api/servers/${serverId}/reviews?page=${page}`);
        const data = await response.json();
        
        if (!data.reviews || data.reviews.length === 0) {
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
        
        // Пагинация
        const paginationContainer = document.getElementById('reviewsModalPagination');
        if (paginationContainer && data.pagination && data.pagination.pages > 1) {
            let pagesHtml = '<div class="pagination">';
            for (let i = 1; i <= data.pagination.pages; i++) {
                pagesHtml += `<button class="page-btn ${i === page ? 'active' : ''}" onclick="window.loadReviewsList('${serverId}', ${i})">${i}</button>`;
            }
            pagesHtml += '</div>';
            paginationContainer.innerHTML = pagesHtml;
        } else if (paginationContainer) {
            paginationContainer.innerHTML = '';
        }
        
        console.log('✅ Отзывы загружены, количество:', data.reviews.length);
    } catch (error) {
        console.error('❌ Ошибка загрузки отзывов:', error);
        container.innerHTML = '<div class="empty">❌ Ошибка загрузки отзывов</div>';
    }
};

// =============== ДОБАВЛЕНИЕ В СРАВНЕНИЕ ===============
window.addToCompare = function(serverId) {
    console.log('📊 addToCompare вызвана, ID сервера:', serverId);
    
    if (!serverId || serverId === 'null' || serverId === 'undefined') {
        console.error('❌ Ошибка: невалидный serverId');
        return;
    }
    
    // TODO: добавить логику сравнения
    alert('Функция сравнения будет добавлена позже. Сервер ID: ' + serverId);
};

// =============== ЗАКРЫТИЕ ЛЮБОГО МОДАЛЬНОГО ОКНА ===============
window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
        console.log(`✅ Модальное окно ${modalId} закрыто`);
    }
};

// =============== ОТПРАВКА ОТЗЫВА ===============
// Ждём загрузки DOM перед привязкой обработчика
document.addEventListener('DOMContentLoaded', function() {
    const reviewForm = document.getElementById('reviewForm');
    
    if (reviewForm) {
        console.log('✅ Форма отзыва найдена, привязываем обработчик');
        
        // Удаляем старые обработчики, чтобы избежать дублирования
        const newForm = reviewForm.cloneNode(true);
        reviewForm.parentNode.replaceChild(newForm, reviewForm);
        
        newForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('📨 Отправка отзыва...');
            
            const serverId = document.getElementById('reviewServerId')?.value;
            console.log('📌 serverId из формы:', serverId);
            
            if (!serverId || serverId === 'null' || serverId === 'undefined' || serverId === '') {
                alert('Ошибка: не удалось определить сервер. Пожалуйста, обновите страницу.');
                return;
            }
            
            const rating = document.getElementById('reviewRating')?.value;
            if (!rating) {
                alert('Поставьте оценку серверу!');
                return;
            }
            
            const authorName = document.getElementById('reviewAuthor')?.value.trim();
            if (!authorName || authorName.length < 2) {
                alert('Укажите ваше имя (минимум 2 символа)');
                return;
            }
            
            const title = document.getElementById('reviewTitle')?.value.trim();
            if (!title || title.length < 3) {
                alert('Укажите заголовок отзыва (минимум 3 символа)');
                return;
            }
            
            const content = document.getElementById('reviewContent')?.value.trim();
            if (!content || content.length < 10) {
                alert('Напишите текст отзыва (минимум 10 символов)');
                return;
            }
            
            const data = {
                authorName: authorName,
                rating: parseInt(rating),
                title: title,
                content: content,
                pros: document.getElementById('reviewPros')?.value.trim() || '',
                cons: document.getElementById('reviewCons')?.value.trim() || ''
            };
            
            console.log('📤 Отправка данных:', data);
            
            try {
                const response = await fetch(`/api/servers/${serverId}/reviews`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                console.log('📥 Ответ сервера:', result);
                
                if (result.success) {
                    alert('✅ Спасибо за отзыв! Он будет опубликован после модерации.');
                    window.closeReviewModal();
                    setTimeout(() => location.reload(), 1000);
                } else {
                    alert('❌ Ошибка: ' + (result.error || 'Неизвестная ошибка'));
                }
            } catch (error) {
                console.error('❌ Ошибка отправки:', error);
                alert('❌ Ошибка соединения с сервером');
            }
        });
    } else {
        console.warn('⚠️ Форма отзыва #reviewForm не найдена на странице');
    }
});

// =============== ИНИЦИАЛИЗАЦИЯ ЗВЁЗД В ФОРМЕ ОТЗЫВА ===============
document.addEventListener('click', function(e) {
    const star = e.target.closest('#reviewModal .stars span');
    if (!star) return;
    
    const rating = parseInt(star.dataset.rating);
    const ratingInput = document.getElementById('reviewRating');
    if (ratingInput) ratingInput.value = rating;
    
    const allStars = document.querySelectorAll('#reviewModal .stars span');
    allStars.forEach((s, i) => {
        if (i < rating) {
            s.classList.add('active');
            s.textContent = '★';
        } else {
            s.classList.remove('active');
            s.textContent = '☆';
        }
    });
    
    console.log('⭐ Выбрана оценка:', rating);
});

// =============== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===============
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

console.log('✅ global.js полностью загружен и готов к работе');