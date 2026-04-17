// =============== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ===============
let allServers = [];
let currentFilter = 'all';
let currentSearch = '';
let currentPage = 1;
const perPage = 12;

// Для модального окна отзывов
let currentReviewsServerId = null;
let currentReviewsPage = 1;

// Для отслеживания просмотренных карточек
const observedCards = new Set();

// =============== СРАВНЕНИЕ СЕРВЕРОВ ===============
let compareServers = [];

// =============== DOM ЭЛЕМЕНТЫ ===============
const serversList = document.getElementById('serversList');
const searchInput = document.getElementById('searchInput');
const totalServersSpan = document.getElementById('totalServers');

// Модальное окно для отзывов
const reviewsModal = document.getElementById('reviewsListModal');
const reviewsModalTitle = document.getElementById('reviewsModalTitle');
const reviewsModalList = document.getElementById('reviewsModalList');
const reviewsModalPagination = document.getElementById('reviewsModalPagination');

// =============== ФУНКЦИЯ ДЛЯ ОТПРАВКИ ЦЕЛЕЙ В ЯНДЕКС.МЕТРИКУ ===============
function sendYandexGoal(goalName, params = {}) {
    if (typeof ym !== 'undefined') {
        ym(106160512, 'reachGoal', goalName, params);
        console.log(`📊 Yandex Metrika goal: ${goalName}`, params);
    }
}

// =============== ПОКАЗАТЬ ЗАГРУЗКУ ===============
function showLoading() {
    if (serversList) {
        serversList.innerHTML = '<div class="loading"><div class="loading-spinner"></div><div>Загрузка серверов...</div></div>';
    }
}

// =============== ЗАГРУЗКА СЕРВЕРОВ ===============
async function loadServers() {
    showLoading();
    
    try {
        const response = await fetch('/api/servers');
        allServers = await response.json();
        if (totalServersSpan) totalServersSpan.textContent = allServers.length;
        render();
    } catch (error) {
        console.error('Error:', error);
        if (serversList) {
            serversList.innerHTML = '<div class="empty">❌ Ошибка загрузки серверов. Пожалуйста, обновите страницу.</div>';
        }
    }
}

// =============== ПОИСК СЕРВЕРОВ (НОВАЯ ФУНКЦИЯ) ===============
async function searchServers() {
    const searchQuery = document.getElementById('searchInput')?.value || '';
    const statusFilter = document.querySelector('.filter-btn.active')?.dataset.status || 'all';
    
    showLoading();
    
    try {
        let url = `/api/search?q=${encodeURIComponent(searchQuery)}&status=${statusFilter}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            allServers = data.servers;
            if (totalServersSpan) totalServersSpan.textContent = allServers.length;
            currentPage = 1;
            render();
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Search error:', error);
        if (serversList) {
            serversList.innerHTML = '<div class="empty">❌ Ошибка поиска. Попробуйте позже.</div>';
        }
    }
}

// =============== ФИЛЬТРАЦИЯ ===============
function getFilteredServers() {
    let filtered = [...allServers];
    
    if (currentFilter !== 'all') {
        filtered = filtered.filter(s => s.status === currentFilter);
    }
    
    if (currentSearch) {
        const search = currentSearch.toLowerCase();
        filtered = filtered.filter(s => 
            s.name.toLowerCase().includes(search) ||
            (s.version && s.version.toLowerCase().includes(search)) ||
            (s.description && s.description.toLowerCase().includes(search)) ||
            (s.tags && s.tags.some(tag => tag.toLowerCase().includes(search)))
        );
    }
    
    return filtered;
}

function getPaginatedServers(servers) {
    const start = (currentPage - 1) * perPage;
    return servers.slice(start, start + perPage);
}

// =============== ОТОБРАЖЕНИЕ ===============
function renderStars(rating) {
    if (rating === 0 || !rating) return '☆☆☆☆☆';
    const full = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    let stars = '';
    for (let i = 0; i < full; i++) stars += '★';
    if (hasHalf) stars += '½';
    for (let i = stars.length; i < 5; i++) stars += '☆';
    return stars;
}

function getStatusClass(status) {
    if (status === 'VIP') return 'badge-vip';
    if (status === 'Почти VIP') return 'badge-almost';
    return 'badge-normal';
}

function getReviewWord(count) {
    if (count % 10 === 1 && count % 100 !== 11) return 'отзыв';
    if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'отзыва';
    return 'отзывов';
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Обновление мета-тегов для SEO
function updateMetaTags() {
    let title = 'База серверов Lineage 2 2026 | Рейтинг лучших L2 серверов';
    let description = 'Актуальная база серверов Lineage 2 2026. Рейтинг лучших L2 серверов: Interlude, High Five, Classic. Подробная статистика, рейты, отзывы игроков.';
    
    if (currentFilter === 'VIP') {
        title = 'VIP серверы Lineage 2 2026 | Топовые L2 серверы с высоким рейтингом';
        description = 'Лучшие VIP серверы Lineage 2 2026. Высокая стабильность, большой онлайн, лучшие условия для игры.';
    } else if (currentFilter === 'Почти VIP') {
        title = 'Почти VIP серверы Lineage 2 2026 | Качественные L2 серверы';
        description = 'Качественные серверы Lineage 2 с отличными условиями. Рейтинг и отзывы игроков.';
    }
    
    if (currentSearch) {
        title = `Поиск серверов Lineage 2: ${currentSearch} | База L2 серверов`;
        description = `Результаты поиска серверов Lineage 2 по запросу "${currentSearch}". Актуальная информация, рейтинги и отзывы игроков.`;
    }
    
    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', description);
}

// =============== ФУНКЦИИ СРАВНЕНИЯ ===============
function addToCompare(serverId) {
    const server = allServers.find(s => s._id === serverId);
    if (!server) return;
    
    if (compareServers.some(s => s._id === serverId)) {
        showToast('Этот сервер уже в списке сравнения', 'info');
        return;
    }
    
    if (compareServers.length >= 3) {
        showToast('Можно сравнить не более 3 серверов', 'error');
        return;
    }
    
    compareServers.push(server);
    updateComparePanel();
    showToast(`✅ ${server.name} добавлен в сравнение`, 'success');
    sendYandexGoal('compare_add', { server_name: server.name });
}

function removeFromCompare(serverId) {
    compareServers = compareServers.filter(s => s._id !== serverId);
    updateComparePanel();
    
    const comparePanel = document.getElementById('comparePanel');
    if (comparePanel && compareServers.length === 0) {
        comparePanel.style.display = 'none';
    }
}

function updateComparePanel() {
    const panel = document.getElementById('comparePanel');
    const list = document.getElementById('compareList');
    
    if (!panel || !list) return;
    
    if (compareServers.length === 0) {
        panel.style.display = 'none';
        return;
    }
    
    panel.style.display = 'block';
    
    list.innerHTML = compareServers.map(server => `
        <div class="compare-item">
            <span class="compare-name">${escapeHtml(server.name)}</span>
            <button class="compare-remove" onclick="removeFromCompare('${server._id}')">✖</button>
        </div>
    `).join('');
}

function showCompareModal() {
    if (compareServers.length < 2) {
        showToast('Выберите минимум 2 сервера для сравнения', 'error');
        return;
    }
    
    const modal = document.getElementById('compareModal');
    const table = document.getElementById('compareTable');
    
    if (!modal || !table) return;
    
    const fields = [
        { label: '📌 Название', key: 'name', isLink: true },
        { label: '📌 Версия', key: 'version', default: 'Interlude' },
        { label: '🏷️ Статус', key: 'status' },
        { label: '⭐ Рейтинг', key: 'rating', isRating: true },
        { label: '📅 Открытие', key: 'openingDate', isDate: true },
        { label: '⚡ Exp', key: 'exp', default: 'x1' },
        { label: '💰 Adena', key: 'adena', default: 'x1' },
        { label: '💀 Drop', key: 'drop', default: 'x1' }
    ];
    
    let tableHtml = `
        <table class="compare-table">
            <thead>
                <tr>
                    <th>Характеристика</th>
                    ${compareServers.map(s => `<th>${escapeHtml(s.name)}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
    `;
    
    for (const field of fields) {
        tableHtml += `<tr><td class="field-label">${field.label}</td>`;
        
        for (const server of compareServers) {
            let value = server[field.key];
            
            if (field.isLink && value) {
                value = `<a href="/server/${server._id}" class="compare-server-link">${escapeHtml(value)}</a>`;
            } else if (field.isRating) {
                const avg = server.rating?.average || 0;
                const count = server.rating?.count || 0;
                value = `⭐ ${avg.toFixed(1)} (${count} ${getReviewWord(count)})`;
            } else if (field.isDate && value) {
                value = new Date(value).toLocaleDateString('ru-RU');
            } else if (!value || value === '') {
                value = field.default || '—';
            } else {
                value = escapeHtml(value);
            }
            
            tableHtml += `<td class="field-value">${value}</td>`;
        }
        tableHtml += `</td>`;
    }
    
    tableHtml += `</tbody></table>`;
    table.innerHTML = tableHtml;
    modal.style.display = 'flex';
    lockBodyScroll();
}

function closeCompareModal() {
    const modal = document.getElementById('compareModal');
    if (modal) {
        modal.style.display = 'none';
        unlockBodyScroll();
    }
}

function renderServerCard(server) {
    const statusClass = getStatusClass(server.status);
    const avgRating = server.rating?.average || 0;
    const reviewCount = server.rating?.count || 0;
    
    const isInCompare = compareServers.some(s => s._id === server._id);
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

function render() {
    const filtered = getFilteredServers();
    const totalPages = Math.ceil(filtered.length / perPage);
    const paginated = getPaginatedServers(filtered);
    
    updateMetaTags();
    
    if (!serversList) return;
    
    if (paginated.length === 0) {
        serversList.innerHTML = '<div class="empty">🔍 Серверов не найдено. Попробуйте изменить параметры поиска.</div>';
        const oldPagination = document.querySelector('.pagination');
        if (oldPagination) oldPagination.remove();
        return;
    }
    
    serversList.innerHTML = paginated.map(renderServerCard).join('');
    updateComparePanel();
    
    const oldPagination = document.querySelector('.pagination');
    if (oldPagination) oldPagination.remove();
    
    if (totalPages > 1) {
        let paginationHtml = '<div class="pagination">';
        for (let i = 1; i <= totalPages; i++) {
            paginationHtml += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
        }
        paginationHtml += '</div>';
        serversList.insertAdjacentHTML('afterend', paginationHtml);
    }
}

function changePage(page) {
    currentPage = page;
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =============== УПРАВЛЕНИЕ СКРОЛЛОМ ===============
function lockBodyScroll() {
    document.body.classList.add('modal-open');
}

function unlockBodyScroll() {
    document.body.classList.remove('modal-open');
}

// =============== МОДАЛЬНОЕ ОКНО ДЛЯ ПРОСМОТРА ОТЗЫВОВ ===============
function openReviewsModal(serverId, serverName) {
    currentReviewsServerId = serverId;
    currentReviewsPage = 1;
    
    if (reviewsModalTitle) {
        reviewsModalTitle.innerHTML = `📝 Отзывы о сервере "${escapeHtml(serverName)}"`;
    }
    if (reviewsModal) {
        reviewsModal.style.display = 'flex';
    }
    lockBodyScroll();
    loadReviewsModal(serverId, 1);
}

async function loadReviewsModal(serverId, page = 1) {
    if (reviewsModalList) {
        reviewsModalList.innerHTML = '<div class="loading"><div class="loading-spinner"></div><div>Загрузка отзывов...</div></div>';
    }
    if (reviewsModalPagination) {
        reviewsModalPagination.innerHTML = '';
    }
    
    try {
        const response = await fetch(`/api/servers/${serverId}/reviews?page=${page}`);
        const data = await response.json();
        
        if (!reviewsModalList) return;
        
        if (data.reviews.length === 0) {
            reviewsModalList.innerHTML = '<div class="empty">📝 Пока нет отзывов. Будьте первым!</div>';
            return;
        }
        
        reviewsModalList.innerHTML = data.reviews.map(review => `
            <div class="review-card">
                <div class="review-header">
                    <span class="review-author">${escapeHtml(review.authorName)}</span>
                    <span class="review-rating">${renderStars(review.rating)}</span>
                    <span class="review-date">${new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <div class="review-title">${escapeHtml(review.title)}</div>
                <div class="review-content">${escapeHtml(review.content)}</div>
                ${review.pros ? `<div class="review-pros">✅ Плюсы: ${escapeHtml(review.pros)}</div>` : ''}
                ${review.cons ? `<div class="review-cons">❌ Минусы: ${escapeHtml(review.cons)}</div>` : ''}
            </div>
        `).join('');
        
        if (reviewsModalPagination && data.pagination.pages > 1) {
            let pagesHtml = '<div class="pagination">';
            for (let i = 1; i <= data.pagination.pages; i++) {
                pagesHtml += `<button class="page-btn ${i === page ? 'active' : ''}" onclick="loadReviewsModal('${serverId}', ${i})">${i}</button>`;
            }
            pagesHtml += '</div>';
            reviewsModalPagination.innerHTML = pagesHtml;
        }
    } catch (error) {
        console.error('Error loading reviews:', error);
        if (reviewsModalList) {
            reviewsModalList.innerHTML = '<div class="empty">❌ Ошибка загрузки отзывов</div>';
        }
    }
}

function closeReviewsModal() {
    if (reviewsModal) {
        reviewsModal.style.display = 'none';
    }
    unlockBodyScroll();
}

// =============== МОДАЛЬНОЕ ОКНО ДЛЯ НАПИСАНИЯ ОТЗЫВА ===============
const reviewModal = document.getElementById('reviewModal');
let currentServerId = null;

function openReviewModal(serverId) {
    currentServerId = serverId;
    const reviewServerId = document.getElementById('reviewServerId');
    if (reviewServerId) reviewServerId.value = serverId;
    
    const reviewAuthor = document.getElementById('reviewAuthor');
    const reviewTitle = document.getElementById('reviewTitle');
    const reviewContent = document.getElementById('reviewContent');
    const reviewPros = document.getElementById('reviewPros');
    const reviewCons = document.getElementById('reviewCons');
    const reviewRating = document.getElementById('reviewRating');
    
    if (reviewAuthor) reviewAuthor.value = '';
    if (reviewTitle) reviewTitle.value = '';
    if (reviewContent) reviewContent.value = '';
    if (reviewPros) reviewPros.value = '';
    if (reviewCons) reviewCons.value = '';
    if (reviewRating) reviewRating.value = '';
    
    const stars = document.querySelectorAll('.stars span');
    stars.forEach(star => {
        star.classList.remove('active');
        star.textContent = '☆';
    });
    
    if (reviewModal) {
        reviewModal.style.display = 'flex';
    }
    lockBodyScroll();
}

function closeReviewModal() {
    if (reviewModal) {
        reviewModal.style.display = 'none';
    }
    unlockBodyScroll();
}

// Инициализация звезд для отзыва
const starsContainer = document.querySelector('.stars');
if (starsContainer) {
    starsContainer.addEventListener('click', (e) => {
        const star = e.target.closest('span');
        if (star && star.dataset.rating) {
            const rating = parseInt(star.dataset.rating);
            const reviewRating = document.getElementById('reviewRating');
            if (reviewRating) reviewRating.value = rating;
            
            const allStars = document.querySelectorAll('.stars span');
            allStars.forEach((s, i) => {
                if (i < rating) {
                    s.classList.add('active');
                    s.textContent = '★';
                } else {
                    s.classList.remove('active');
                    s.textContent = '☆';
                }
            });
        }
    });
}

// Отправка отзыва
const reviewForm = document.getElementById('reviewForm');
if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const ratingInput = document.getElementById('reviewRating');
        const rating = ratingInput ? ratingInput.value : null;
        
        if (!rating) {
            alert('Поставьте оценку серверу!');
            return;
        }
        
        const data = {
            authorName: document.getElementById('reviewAuthor')?.value || '',
            rating: parseInt(rating),
            title: document.getElementById('reviewTitle')?.value || '',
            content: document.getElementById('reviewContent')?.value || '',
            pros: document.getElementById('reviewPros')?.value || '',
            cons: document.getElementById('reviewCons')?.value || ''
        };
        
        try {
            const response = await fetch(`/api/servers/${currentServerId}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('Спасибо за отзыв! Он будет опубликован после модерации.');
                closeReviewModal();
                await loadServers();
            } else {
                alert(result.error || 'Ошибка отправки');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Ошибка отправки отзыва');
        }
    });
}

// =============== ФИЛЬТРЫ ===============
const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.status;
        currentPage = 1;
        
        // Если есть поисковый запрос, используем searchServers
        if (currentSearch) {
            searchServers();
        } else {
            loadServers();
        }
    });
});

// =============== ПОИСК (ОБНОВЛЕННЫЙ ОБРАБОТЧИК) ===============
if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentSearch = e.target.value;
            searchServers();
        }, 500);
    });
    
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchInput.value = '';
            currentSearch = '';
            loadServers();
        }
    });
}

// =============== КНОПКА "НАВЕРХ" ===============
const backToTop = document.getElementById('backToTop');
if (backToTop) {
    window.addEventListener('scroll', () => {
        backToTop.classList.toggle('visible', window.scrollY > 300);
    });
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// =============== ЗАКРЫТИЕ МОДАЛЬНЫХ ОКОН ===============
window.addEventListener('click', (e) => {
    if (e.target === reviewModal) closeReviewModal();
    if (e.target === reviewsModal) closeReviewsModal();
    if (e.target === document.getElementById('compareModal')) closeCompareModal();
});

// =============== ЗАПУСК ===============
if (document.getElementById('serversList')) {
    loadServers();
}

// =============== COOKIE БАННЕР ===============
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    if (type === 'error') {
        toast.style.background = '#ff4757';
        toast.style.color = 'white';
    } else if (type === 'info') {
        toast.style.background = '#6c5ce7';
        toast.style.color = 'white';
    } else {
        toast.style.background = '#00b894';
        toast.style.color = '#0f172a';
    }
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

// Экспорт глобальных функций
window.changePage = changePage;
window.openReviewsModal = openReviewsModal;
window.loadReviewsModal = loadReviewsModal;
window.openReviewModal = openReviewModal;
window.closeReviewsModal = closeReviewsModal;
window.closeReviewModal = closeReviewModal;
window.addToCompare = addToCompare;
window.removeFromCompare = removeFromCompare;
window.showCompareModal = showCompareModal;
window.closeCompareModal = closeCompareModal;
window.searchServers = searchServers;