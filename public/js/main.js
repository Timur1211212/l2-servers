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

// =============== ЗАГРУЗКА СЕРВЕРОВ ===============
async function loadServers() {
    serversList.innerHTML = '<div class="loading"><div class="loading-spinner"></div><div>Загрузка серверов...</div></div>';
    
    try {
        const response = await fetch('/api/servers');
        allServers = await response.json();
        totalServersSpan.textContent = allServers.length;
        render();
    } catch (error) {
        console.error('Error:', error);
        serversList.innerHTML = '<div class="empty">❌ Ошибка загрузки серверов. Пожалуйста, обновите страницу.</div>';
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
            (s.description && s.description.toLowerCase().includes(search))
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

// Обновление мета-тегов для SEO
function updateMetaTags() {
    let title = 'База серверов Lineage 2 2026 | Рейтинг лучших L2 серверов';
    let description = 'Актуальная база серверов Lineage 2 2026. Рейтинг лучших L2 серверов: Interlude, High Five, Classic. Подробная статистика, рейты, отзывы игроков.';
    
    if (currentFilter === 'VIP') {
        title = 'VIP серверы Lineage 2 2026 | Топовые L2 серверы с высоким рейтингом';
        description = 'Лучшие VIP серверы Lineage 2 2026. Высокая стабильность, большой онлайн, лучшие условия для игры. Рейтинг VIP серверов L2 с отзывами.';
    } else if (currentFilter === 'Почти VIP') {
        title = 'Почти VIP серверы Lineage 2 2026 | Качественные L2 серверы';
        description = 'Качественные серверы Lineage 2 с отличными условиями. Рейтинг и отзывы игроков. Найди свой идеальный сервер для комфортной игры!';
    }
    
    if (currentSearch) {
        title = `Поиск серверов Lineage 2: ${currentSearch} | База L2 серверов`;
        description = `Результаты поиска серверов Lineage 2 по запросу "${currentSearch}". Актуальная информация, рейтинги и отзывы игроков.`;
    }
    
    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', description);
    
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);
    
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);
}

// Структурированные данные ItemList
function updateItemListSchema(servers) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "numberOfItems": servers.length,
        "itemListElement": servers.map((server, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "url": `https://zerokulasite.ru/server/${server._id}`,
            "item": {
                "@type": "VideoGame",
                "name": server.name,
                "url": server.website,
                "description": server.description || `${server.name} - сервер Lineage 2`,
                "gamePlatform": server.version || "Interlude",
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": server.rating?.average || 0,
                    "reviewCount": server.rating?.count || 0,
                    "bestRating": "5",
                    "worstRating": "1"
                }
            }
        }))
    };
    
    const script = document.getElementById('itemListSchema');
    if (script) {
        script.textContent = JSON.stringify(schema, null, 2);
    }
}

// Мета-теги для пагинации
function updatePaginationLinks(currentPage, totalPages) {
    let prevLink = document.querySelector('link[rel="prev"]');
    let nextLink = document.querySelector('link[rel="next"]');
    
    if (!prevLink) {
        prevLink = document.createElement('link');
        prevLink.rel = 'prev';
        document.head.appendChild(prevLink);
    }
    if (!nextLink) {
        nextLink = document.createElement('link');
        nextLink.rel = 'next';
        document.head.appendChild(nextLink);
    }
    
    if (currentPage > 1) {
        prevLink.href = `/?page=${currentPage - 1}`;
    } else {
        prevLink.href = '';
    }
    
    if (currentPage < totalPages) {
        nextLink.href = `/?page=${currentPage + 1}`;
    } else {
        nextLink.href = '';
    }
}

// =============== ФУНКЦИИ СРАВНЕНИЯ ===============
function addToCompare(serverId) {
    const server = allServers.find(s => s._id === serverId);
    if (!server) return;
    
    // Проверяем, не добавлен ли уже
    if (compareServers.some(s => s._id === serverId)) {
        showToast('Этот сервер уже в списке сравнения', 'info');
        return;
    }
    
    // Максимум 3 сервера
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
    
    if (compareServers.length === 0) {
        document.getElementById('comparePanel').style.display = 'none';
    }
}

function updateComparePanel() {
    const panel = document.getElementById('comparePanel');
    const list = document.getElementById('compareList');
    
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
    
    // Поля для сравнения
    const fields = [
        { label: '📌 Название', key: 'name', isLink: true },
        { label: '📌 Версия', key: 'version', default: 'Interlude' },
        { label: '🏷️ Статус', key: 'status' },
        { label: '⭐ Рейтинг', key: 'rating', isRating: true },
        { label: '📅 Открытие', key: 'openingDate', isDate: true },
        { label: '⚡ Exp', key: 'exp', default: 'x1' },
        { label: '💰 Adena', key: 'adena', default: 'x1' },
        { label: '💀 Drop', key: 'drop', default: 'x1' },
        { label: '🔧 Spoil', key: 'spoil', default: 'x1' },
        { label: '🎯 Spoil Chance', key: 'spoilChance' },
        { label: '🗿 Sealstone', key: 'sealstone' },
        { label: '👑 Raid Boss Exp', key: 'raidBossExp' },
        { label: '💎 Raid Boss Drop', key: 'raidBossDrop' },
        { label: '⚔️ Epic Raid Boss Drop', key: 'epicRaidBossDrop' },
        { label: '📜 Quest Adena', key: 'questAdena' },
        { label: '📖 Quest', key: 'quest' },
        { label: '✨ Quest Exp', key: 'questExp' }
    ];
    
    // Генерация таблицы
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
        tableHtml += `</tr>`;
    }
    
    // Кнопки "Играть"
    tableHtml += `<tr><td class="field-label">🎮 Действие</td>`;
    for (const server of compareServers) {
        tableHtml += `<td><a href="${escapeHtml(server.website)}" target="_blank" class="btn-compare-play">Играть →</a></td>`;
    }
    tableHtml += `</tr>`;
    
    tableHtml += `</tbody></table>`;
    
    table.innerHTML = tableHtml;
    modal.style.display = 'flex';
    lockBodyScroll();
    
    sendYandexGoal('compare_view', { servers: compareServers.map(s => s.name).join(',') });
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
    
    const allFields = [
        { label: 'Exp', value: server.exp },
        { label: 'Adena', value: server.adena },
        { label: 'Drop', value: server.drop },
        { label: 'Spoil', value: server.spoil },
        { label: 'Spoil Chance', value: server.spoilChance },
        { label: 'Sealstone', value: server.sealstone },
        { label: 'Raid Boss Exp', value: server.raidBossExp },
        { label: 'Raid Boss Drop', value: server.raidBossDrop },
        { label: 'Epic Raid Boss Drop', value: server.epicRaidBossDrop },
        { label: 'Quest Adena', value: server.questAdena },
        { label: 'Quest', value: server.quest },
        { label: 'Quest Exp', value: server.questExp }
    ];
    
    const filledFields = allFields.filter(f => f.value && f.value.trim() !== '');
    const mainFields = filledFields.slice(0, 4);
    const extraFields = filledFields.slice(4);
    
    // Проверяем, добавлен ли сервер в сравнение
    const isInCompare = compareServers.some(s => s._id === server._id);
    const compareBtnText = isInCompare ? '✓ В сравнении' : '📊 Сравнить';
    const compareBtnDisabled = isInCompare ? 'disabled' : '';
    
    return `
        <div class="server-card" data-server-id="${server._id}" itemscope itemtype="https://schema.org/VideoGame">
            <meta itemprop="name" content="${escapeHtml(server.name)}">
            <meta itemprop="url" content="${escapeHtml(server.website)}">
            <meta itemprop="description" content="${escapeHtml(server.description || server.name)}">
            
            <a href="/server/${server._id}" class="server-name-link" rel="bookmark">
                <h3 class="server-name">${escapeHtml(server.name)}</h3>
            </a>
            <div class="server-website">
                <a href="${escapeHtml(server.website)}" target="_blank" rel="nofollow noopener external">🌐 ${escapeHtml(server.website)}</a>
            </div>
            <div class="server-meta">
                <span class="badge ${statusClass}">${escapeHtml(server.status)}</span>
                <span class="server-version">📌 ${escapeHtml(server.version || 'Interlude')}</span>
                ${server.openingDate ? `<span class="server-version">📅 ${new Date(server.openingDate).toLocaleDateString()}</span>` : ''}
                ${addSimilarServersBlock(server)}
            </div>
            
            ${mainFields.length ? `
                <div class="server-rates">
                    ${mainFields.map(f => `<div class="rate-item"><span class="rate-label">${f.label}:</span><span class="rate-value">${escapeHtml(f.value)}</span></div>`).join('')}
                </div>
            ` : ''}
            
            ${extraFields.length ? `
                <div id="extra-rates-${server._id}" class="server-rates extra-rates" style="display: none;">
                    ${extraFields.map(f => `<div class="rate-item"><span class="rate-label">${f.label}:</span><span class="rate-value">${escapeHtml(f.value)}</span></div>`).join('')}
                </div>
                <button class="btn-show-all" onclick="toggleAllRates('${server._id}', this)">📊 Показать все характеристики (${extraFields.length})</button>
            ` : ''}
            
            ${server.description ? `<div class="server-description">📝 ${escapeHtml(server.description)}</div>` : ''}
            
            <div class="review-summary">
                <div class="rating-stars" itemprop="aggregateRating" itemscope itemtype="https://schema.org/AggregateRating">
                    <meta itemprop="ratingValue" content="${avgRating}">
                    <meta itemprop="reviewCount" content="${reviewCount}">
                    <meta itemprop="bestRating" content="5">
                    <meta itemprop="worstRating" content="1">
                    ${renderStars(avgRating)}
                </div>
                <div class="review-count">${reviewCount} ${getReviewWord(reviewCount)}</div>
                <button class="btn-write-review" onclick="openReviewModal('${server._id}')">✍️ Написать отзыв</button>
            </div>
            
            <div class="server-actions">
                <button class="btn-compare" onclick="addToCompare('${server._id}')" ${compareBtnDisabled}>${compareBtnText}</button>
                <a href="${escapeHtml(server.website)}" target="_blank" rel="nofollow noopener external" class="btn-play">🎮 Играть</a>
            </div>
            <button class="btn-reviews" onclick="openReviewsModal('${server._id}', '${escapeHtml(server.name)}')">📝 Читать отзывы</button>
        </div>
    `;
}

window.toggleAllRates = function(serverId, button) {
    const extraRates = document.getElementById(`extra-rates-${serverId}`);
    if (extraRates.style.display === 'none') {
        extraRates.style.display = 'grid';
        button.textContent = '📊 Скрыть характеристики';
    } else {
        extraRates.style.display = 'none';
        const extraCount = extraRates.querySelectorAll('.rate-item').length;
        button.textContent = `📊 Показать все характеристики (${extraCount})`;
    }
};

function render() {
    const filtered = getFilteredServers();
    const totalPages = Math.ceil(filtered.length / perPage);
    const paginated = getPaginatedServers(filtered);
    
    // Обновляем SEO элементы
    updateMetaTags();
    updateItemListSchema(filtered);
    updatePaginationLinks(currentPage, totalPages);
    
    if (paginated.length === 0) {
        serversList.innerHTML = '<div class="empty">🔍 Серверов не найдено. Попробуйте изменить параметры поиска.</div>';
        const oldPagination = document.querySelector('.pagination');
        if (oldPagination) oldPagination.remove();
        return;
    }
    
    serversList.innerHTML = paginated.map(renderServerCard).join('');
    
    // Обновляем панель сравнения (чтобы обновить статус кнопок)
    updateComparePanel();
    
    // Отслеживаем просмотр карточек серверов
    setTimeout(() => {
        document.querySelectorAll('.server-card').forEach(card => {
            if (!observedCards.has(card)) {
                const cardObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting && !observedCards.has(entry.target)) {
                            observedCards.add(entry.target);
                            const serverName = entry.target.querySelector('.server-name')?.textContent || 'unknown';
                            sendYandexGoal('server_view', { server_name: serverName });
                        }
                    });
                }, { threshold: 0.3 });
                cardObserver.observe(card);
            }
        });
    }, 100);
    
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
    
    sendYandexGoal('reviews_view', { server_id: serverId, server_name: serverName });
    
    reviewsModalTitle.innerHTML = `📝 Отзывы о сервере "${escapeHtml(serverName)}"`;
    reviewsModal.style.display = 'flex';
    lockBodyScroll();
    loadReviewsModal(serverId, 1);
}

async function loadReviewsModal(serverId, page = 1) {
    reviewsModalList.innerHTML = '<div class="loading"><div class="loading-spinner"></div><div>Загрузка отзывов...</div></div>';
    reviewsModalPagination.innerHTML = '';
    
    try {
        const response = await fetch(`/api/servers/${serverId}/reviews?page=${page}`);
        const data = await response.json();
        
        if (data.reviews.length === 0) {
            reviewsModalList.innerHTML = '<div class="empty">📝 Пока нет отзывов. Будьте первым!</div>';
            return;
        }
        
        reviewsModalList.innerHTML = data.reviews.map(review => `
            <div class="review-card" data-review-id="${review._id}" itemscope itemtype="https://schema.org/Review">
                <meta itemprop="datePublished" content="${review.createdAt}">
                <div class="review-header">
                    <span class="review-author" itemprop="author" itemscope itemtype="https://schema.org/Person">
                        <span itemprop="name">${escapeHtml(review.authorName)}</span>
                    </span>
                    <span class="review-rating" itemprop="reviewRating" itemscope itemtype="https://schema.org/Rating">
                        <meta itemprop="ratingValue" content="${review.rating}">
                        <meta itemprop="bestRating" content="5">
                        ${renderStars(review.rating)}
                    </span>
                    <span class="review-date">${new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                <div class="review-title" itemprop="name">${escapeHtml(review.title)}</div>
                <div class="review-content" itemprop="reviewBody">${escapeHtml(review.content)}</div>
                ${review.pros ? `<div class="review-pros">✅ Плюсы: ${escapeHtml(review.pros)}</div>` : ''}
                ${review.cons ? `<div class="review-cons">❌ Минусы: ${escapeHtml(review.cons)}</div>` : ''}
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
            </div>
        `).join('');
        
        if (data.pagination.pages > 1) {
            let pagesHtml = '<div class="pagination">';
            for (let i = 1; i <= data.pagination.pages; i++) {
                pagesHtml += `<button class="page-btn ${i === page ? 'active' : ''}" onclick="loadReviewsModal('${serverId}', ${i})">${i}</button>`;
            }
            pagesHtml += '</div>';
            reviewsModalPagination.innerHTML = pagesHtml;
        }
    } catch (error) {
        console.error('Error loading reviews:', error);
        reviewsModalList.innerHTML = '<div class="empty">❌ Ошибка загрузки отзывов</div>';
    }
}

function closeReviewsModal() {
    reviewsModal.style.display = 'none';
    unlockBodyScroll();
}

document.querySelector('.close-reviews')?.addEventListener('click', closeReviewsModal);

// =============== ГОЛОСОВАНИЕ ЗА ОТЗЫВ ===============
window.markHelpful = async (reviewId, helpful, button) => {
    const reviewCard = button.closest('.review-card');
    const helpfulBtn = reviewCard.querySelector('.helpful-btn:first-child');
    const notHelpfulBtn = reviewCard.querySelector('.helpful-btn:last-child');
    
    helpfulBtn.disabled = true;
    notHelpfulBtn.disabled = true;
    
    try {
        const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ helpful })
        });
        
        const data = await response.json();
        
        if (data.success) {
            const helpfulCountSpan = reviewCard.querySelector('.helpful-count');
            const notHelpfulCountSpan = reviewCard.querySelector('.nothelpful-count');
            
            helpfulCountSpan.textContent = data.helpful;
            notHelpfulCountSpan.textContent = data.notHelpful;
            
            if (data.userVoted === 'helpful') {
                helpfulBtn.classList.add('active');
                notHelpfulBtn.classList.remove('active');
            } else if (data.userVoted === 'notHelpful') {
                notHelpfulBtn.classList.add('active');
                helpfulBtn.classList.remove('active');
            } else {
                helpfulBtn.classList.remove('active');
                notHelpfulBtn.classList.remove('active');
            }
        }
    } catch (error) {
        console.error('Error marking helpful:', error);
    } finally {
        helpfulBtn.disabled = false;
        notHelpfulBtn.disabled = false;
    }
};

// =============== МОДАЛЬНОЕ ОКНО ДЛЯ НАПИСАНИЯ ОТЗЫВА ===============
const reviewModal = document.getElementById('reviewModal');
let currentServerId = null;

function openReviewModal(serverId) {
    currentServerId = serverId;
    document.getElementById('reviewServerId').value = serverId;
    document.getElementById('reviewAuthor').value = '';
    document.getElementById('reviewTitle').value = '';
    document.getElementById('reviewContent').value = '';
    document.getElementById('reviewPros').value = '';
    document.getElementById('reviewCons').value = '';
    document.getElementById('reviewRating').value = '';
    
    document.querySelectorAll('.stars span').forEach(star => {
        star.classList.remove('active');
        star.textContent = '☆';
    });
    
    reviewModal.style.display = 'flex';
    lockBodyScroll();
}

function closeReviewModal() {
    reviewModal.style.display = 'none';
    unlockBodyScroll();
}

document.querySelectorAll('.stars span').forEach(star => {
    star.addEventListener('click', () => {
        const rating = parseInt(star.dataset.rating);
        document.getElementById('reviewRating').value = rating;
        
        document.querySelectorAll('.stars span').forEach((s, i) => {
            if (i < rating) {
                s.classList.add('active');
                s.textContent = '★';
            } else {
                s.classList.remove('active');
                s.textContent = '☆';
            }
        });
    });
});

// Отправка отзыва
document.getElementById('reviewForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const rating = document.getElementById('reviewRating').value;
    if (!rating) {
        alert('Поставьте оценку серверу!');
        return;
    }
    
    // Валидация длины полей
    const authorName = document.getElementById('reviewAuthor').value;
    const reviewTitle = document.getElementById('reviewTitle').value;
    const reviewContent = document.getElementById('reviewContent').value;
    const reviewPros = document.getElementById('reviewPros').value;
    const reviewCons = document.getElementById('reviewCons').value;
    
    if (authorName.length > 50) {
        alert('Имя не может быть длиннее 50 символов!');
        return;
    }
    if (reviewTitle.length > 100) {
        alert('Заголовок не может быть длиннее 100 символов!');
        return;
    }
    if (reviewContent.length > 1520) {
        alert('Текст отзыва не может быть длиннее 1520 символов!');
        return;
    }
    if (reviewPros.length > 300) {
        alert('Плюсы не могут быть длиннее 300 символов!');
        return;
    }
    if (reviewCons.length > 300) {
        alert('Минусы не могут быть длиннее 300 символов!');
        return;
    }
    
    const data = {
        authorName: authorName,
        rating: parseInt(rating),
        title: reviewTitle,
        content: reviewContent,
        pros: reviewPros,
        cons: reviewCons
    };
    
    try {
        const response = await fetch(`/api/servers/${currentServerId}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            sendYandexGoal('review_submit', { server_id: currentServerId });
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

document.querySelector('.close')?.addEventListener('click', closeReviewModal);

// =============== МОДАЛЬНОЕ ОКНО НАСТРОЕК COOKIES ===============
const cookieSettingsModal = document.getElementById('cookieSettingsModal');

function closeCookieSettingsModal() {
    if (cookieSettingsModal) {
        cookieSettingsModal.style.display = 'none';
        unlockBodyScroll();
    }
}

document.querySelector('.close-cookie-settings')?.addEventListener('click', closeCookieSettingsModal);

// =============== ЗАКРЫТИЕ МОДАЛЬНЫХ ОКОН ПО КЛИКУ НА ФОН ===============
window.addEventListener('click', (e) => {
    if (e.target === reviewModal) closeReviewModal();
    if (e.target === reviewsModal) closeReviewsModal();
    if (e.target === cookieSettingsModal) closeCookieSettingsModal();
    if (e.target === document.getElementById('compareModal')) closeCompareModal();
});

// =============== ФИЛЬТРЫ ===============
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const newFilter = btn.dataset.status;
        
        sendYandexGoal('filter_click', { filter: newFilter });
        
        currentFilter = newFilter;
        currentPage = 1;
        render();
    });
});

// =============== ПОИСК ===============
let searchTimeout;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        const newSearch = e.target.value;
        
        if (newSearch && newSearch !== currentSearch) {
            sendYandexGoal('search', { search_query: newSearch });
        }
        
        currentSearch = newSearch;
        currentPage = 1;
        render();
    }, 300);
});

searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        searchInput.value = '';
        currentSearch = '';
        currentPage = 1;
        render();
    }
});

// =============== ЗАПУСК ===============
loadServers();

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// =============== УПРАВЛЕНИЕ COOKIES ===============
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

function loadCookieSettings() {
    const saved = localStorage.getItem('cookieSettings');
    if (saved) {
        const settings = JSON.parse(saved);
        const analyticalCheckbox = document.getElementById('cookieAnalytical');
        const functionalCheckbox = document.getElementById('cookieFunctional');
        if (analyticalCheckbox) analyticalCheckbox.checked = settings.analytical !== false;
        if (functionalCheckbox) functionalCheckbox.checked = settings.functional !== false;
        return settings;
    }
    return { analytical: true, functional: true };
}

function saveCookieSettings(settings) {
    localStorage.setItem('cookieSettings', JSON.stringify(settings));
    applyCookieSettings(settings);
}

function applyCookieSettings(settings) {
    if (!settings.analytical) {
        const yandexCookies = ['_ym_uid', '_ym_d', '_ym_isad', '_ym_visorc', 'yandexuid'];
        yandexCookies.forEach(name => {
            document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        });
        if (window.ym) {
            window.ym(106160512, 'userParams', { user_id: null });
        }
    }
    
    if (!settings.functional) {
        localStorage.removeItem('theme');
        localStorage.removeItem('l2_filter_state');
    }
}

function showCookieBanner() {
    const cookieDecision = localStorage.getItem('cookieDecision');
    if (!cookieDecision) {
        const banner = document.getElementById('cookieBanner');
        if (banner) banner.style.display = 'block';
    }
}

function hideCookieBanner() {
    const banner = document.getElementById('cookieBanner');
    if (banner) banner.style.display = 'none';
}

function acceptAllCookies() {
    const settings = { analytical: true, functional: true };
    saveCookieSettings(settings);
    localStorage.setItem('cookieDecision', 'accepted');
    hideCookieBanner();
    showToast('Настройки cookies сохранены', 'success');
}

function rejectOptionalCookies() {
    const settings = { analytical: false, functional: false };
    saveCookieSettings(settings);
    localStorage.setItem('cookieDecision', 'rejected');
    hideCookieBanner();
    showToast('Будут использоваться только необходимые cookies', 'info');
}

function showCookieSettingsModal() {
    const settings = loadCookieSettings();
    const analyticalCheckbox = document.getElementById('cookieAnalytical');
    const functionalCheckbox = document.getElementById('cookieFunctional');
    if (analyticalCheckbox) analyticalCheckbox.checked = settings.analytical;
    if (functionalCheckbox) functionalCheckbox.checked = settings.functional;
    if (cookieSettingsModal) {
        cookieSettingsModal.style.display = 'flex';
        lockBodyScroll();
    }
}

function saveSettingsFromModal() {
    const analyticalCheckbox = document.getElementById('cookieAnalytical');
    const functionalCheckbox = document.getElementById('cookieFunctional');
    const settings = {
        analytical: analyticalCheckbox ? analyticalCheckbox.checked : true,
        functional: functionalCheckbox ? functionalCheckbox.checked : true
    };
    saveCookieSettings(settings);
    localStorage.setItem('cookieDecision', 'custom');
    hideCookieBanner();
    closeCookieSettingsModal();
    showToast('Настройки cookies сохранены', 'success');
}

function initCookieSystem() {
    const settings = loadCookieSettings();
    applyCookieSettings(settings);
    showCookieBanner();
    
    const acceptBtn = document.getElementById('cookieAcceptBtn');
    const rejectBtn = document.getElementById('cookieRejectBtn');
    const settingsBtn = document.getElementById('cookieSettingsBtn');
    const saveSettingsBtn = document.getElementById('saveCookieSettings');
    const acceptAllBtn = document.getElementById('acceptAllCookies');
    
    if (acceptBtn) acceptBtn.addEventListener('click', acceptAllCookies);
    if (rejectBtn) rejectBtn.addEventListener('click', rejectOptionalCookies);
    if (settingsBtn) settingsBtn.addEventListener('click', showCookieSettingsModal);
    if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', saveSettingsFromModal);
    if (acceptAllBtn) {
        acceptAllBtn.addEventListener('click', () => {
            acceptAllCookies();
            closeCookieSettingsModal();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initCookieSystem();
});

// =============== ОТСЛЕЖИВАНИЕ 404 ОШИБОК ===============
document.addEventListener('DOMContentLoaded', function() {
    const errorCode = document.querySelector('.error-code');
    if (errorCode && errorCode.textContent === '404') {
        sendYandexGoal('404_error', { page: window.location.pathname });
    }
});

// =============== ОТСЛЕЖИВАНИЕ ВНЕШНИХ ССЫЛОК ===============
document.querySelectorAll('a[target="_blank"]').forEach(link => {
    link.addEventListener('click', function() {
        sendYandexGoal('external_link_click', { url: this.href });
    });
});

// =============== ОТСЛЕЖИВАНИЕ КЛИКОВ ПО КНОПКЕ "ИГРАТЬ" ===============
document.querySelectorAll('.btn-play').forEach(btn => {
    btn.addEventListener('click', function() {
        const serverCard = this.closest('.server-card');
        const serverName = serverCard?.querySelector('.server-name')?.textContent || 'unknown';
        sendYandexGoal('server_click', { server_name: serverName });
    });
});

// =============== ПОХОЖИЕ СЕРВЕРЫ (ВНУТРЕННЯЯ ПЕРЕЛИНКОВКА) ===============
function getSimilarServers(server, limit = 3) {
    if (!allServers.length) return [];
    return allServers
        .filter(s => s.version === server.version && s._id !== server._id && s.active !== false)
        .slice(0, limit);
}

function addSimilarServersBlock(server) {
    const similar = getSimilarServers(server);
    if (similar.length === 0) return '';
    return `
        <div class="similar-servers">
            <div class="similar-title">🔗 Похожие серверы:</div>
            <div class="similar-list">
                ${similar.map(s => `<a href="/server/${s._id}" class="similar-link">${escapeHtml(s.name)}</a>`).join('')}
            </div>
        </div>
    `;
}

// =============== ИНИЦИАЛИЗАЦИЯ ОБРАБОТЧИКОВ СРАВНЕНИЯ ===============
document.getElementById('showCompareModal')?.addEventListener('click', showCompareModal);
document.getElementById('closeCompare')?.addEventListener('click', () => {
    document.getElementById('comparePanel').style.display = 'none';
});
document.querySelector('.close-compare')?.addEventListener('click', closeCompareModal);

// =============== ЭКСПОРТ ФУНКЦИЙ ===============
window.changePage = changePage;
window.openReviewsModal = openReviewsModal;
window.loadReviewsModal = loadReviewsModal;
window.markHelpful = markHelpful;
window.openReviewModal = openReviewModal;
window.toggleAllRates = toggleAllRates;
window.closeReviewsModal = closeReviewsModal;
window.closeReviewModal = closeReviewModal;
window.addToCompare = addToCompare;
window.removeFromCompare = removeFromCompare;
window.showCompareModal = showCompareModal;
window.closeCompareModal = closeCompareModal;