// public/js/global.js - Упрощенная и надежная версия
console.log('global.js загружен');

// public/js/global.js (исправленная функция openReviewModal)

window.openReviewModal = function(serverId) {
    console.log('openReviewModal вызвана, ID сервера:', serverId);
    
    // --- НАЧАЛО: Критическая проверка для устранения ошибки 500 ---
    // Проверяем, что serverId передан и это не null/undefined
    if (!serverId || serverId === 'null' || serverId === 'undefined') {
        console.error('❌ Ошибка: передан невалидный serverId:', serverId);
        alert('Ошибка: не удалось определить сервер. Пожалуйста, обновите страницу и попробуйте снова.');
        return;
    }
    // --- КОНЕЦ ПРОВЕРКИ ---

    const modal = document.getElementById('reviewModal');
    const serverIdInput = document.getElementById('reviewServerId');
    
    if (!modal) {
        console.error('❌ Модальное окно reviewModal не найдено!');
        return;
    }
    
    if (serverIdInput) {
        // Устанавливаем значение serverId в скрытое поле
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
    
    // Показываем модальное окно
    modal.style.display = 'flex';
    document.body.classList.add('modal-open');
};

// Функция для открытия модального окна со списком отзывов
window.openReviewsModal = function(serverId, serverName) {
    console.log('openReviewsModal вызвана, сервер:', serverName, 'ID:', serverId);
    alert('Функция openReviewsModal вызвана! Сервер: ' + serverName);
    
    // Здесь будет ваша логика открытия списка отзывов
    const modal = document.getElementById('reviewsListModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
    } else {
        console.error('Модальное окно reviewsListModal не найдено!');
    }
};

// Функция для добавления в сравнение
window.addToCompare = function(serverId) {
    console.log('addToCompare вызвана, ID сервера:', serverId);
    alert('Функция addToCompare вызвана! ID сервера: ' + serverId);
};

// Вспомогательная функция для закрытия модальных окон (на всякий случай)
window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
    document.body.classList.remove('modal-open');
};