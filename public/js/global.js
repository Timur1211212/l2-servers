// public/js/global.js - Упрощенная и надежная версия
console.log('global.js загружен');

// Функция для открытия модального окна отзыва
window.openReviewModal = function(serverId) {
    console.log('openReviewModal вызвана, ID сервера:', serverId);
    alert('Функция openReviewModal вызвана! ID сервера: ' + serverId);
    
    // Здесь будет ваша логика открытия модального окна
    const modal = document.getElementById('reviewModal');
    if (modal) {
        const serverIdInput = document.getElementById('reviewServerId');
        if (serverIdInput) serverIdInput.value = serverId;
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
    } else {
        console.error('Модальное окно reviewModal не найдено!');
    }
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