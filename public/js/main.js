// public/js/main.js
(function() {
    'use strict';
    
    // =============== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ===============
    let allServers = [];
    let currentFilter = 'all';
    let currentSearch = '';
    let currentPage = 1;
    const perPage = 12;
    
    let currentReviewsServerId = null;
    let currentReviewsPage = 1;
    
    const observedCards = new Set();
    
    let compareServers = [];
    
    // =============== DOM ЭЛЕМЕНТЫ ===============
    const serversList = document.getElementById('serversList');
    const searchInput = document.getElementById('searchInput');
    const totalServersSpan = document.getElementById('totalServers');
    const reviewsModal = document.getElementById('reviewsListModal');
    const reviewsModalTitle = document.getElementById('reviewsModalTitle');
    const reviewsModalList = document.getElementById('reviewsModalList');
    const reviewsModalPagination = document.getElementById('reviewsModalPagination');
    
    // =============== ФУНКЦИИ ===============
    function sendYandexGoal(goalName, params = {}) {
        if (typeof ym !== 'undefined') {
            ym(106160512, 'reachGoal', goalName, params);
        }
    }
    
    function showLoading() {
        if (serversList) {
            serversList.innerHTML = '<div class="loading"><div class="loading-spinner"></div><div>Загрузка серверов...</div></div>';
        }
    }
    
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
                serversList.innerHTML = '<div class="empty">❌ Ошибка загрузки серверов</div>';
            }
        }
    }
    
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
                serversList.innerHTML = '<div class="empty">❌ Ошибка поиска</div>';
            }
        }
    }
    
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
                (s.tags && s.tags.some(tag => tag.toLowerCase().includes(search)))
            );
        }
        return filtered;
    }
    
    function getPaginatedServers(servers) {
        const start = (currentPage - 1) * perPage;
        return servers.slice(start, start + perPage);
    }
    
    function renderStars(rating) {
        if (!rating || rating === 0) return '☆☆☆☆☆';
        const full = Math.floor(rating);
        let stars = '';
        for (let i = 0; i < full; i++) stars += '★';
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
    
    function updateMetaTags() {
        let title = 'Рейтинг серверов Lineage 2 2026';
        let description = 'Актуальный рейтинг серверов Lineage 2 2026';
        if (currentSearch) {
            title = `Поиск: ${currentSearch} | База L2 серверов`;
        }
        document.title = title;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', description);
    }
    
    function addToCompare(serverId) {
        const server = allServers.find(s => s._id === serverId);
        if (!server) return;
        if (compareServers.some(s => s._id === serverId)) {
            showToast('Уже в сравнении', 'info');
            return;
        }
        if (compareServers.length >= 3) {
            showToast('Максимум 3 сервера', 'error');
            return;
        }
        compareServers.push(server);
        updateComparePanel();
        showToast(`✅ ${server.name} добавлен`, 'success');
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
            showToast('Выберите минимум 2 сервера', 'error');
            return;
        }
        const modal = document.getElementById('compareModal');
        const table = document.getElementById('compareTable');
        if (!modal || !table) return;
        
        let tableHtml = `<table class="compare-table"><thead><tr><th>Характеристика</th>${compareServers.map(s => `<th>${escapeHtml(s.name)}</th>`).join('')}</tr></thead><tbody>`;
        const fields = ['name', 'version', 'status', 'exp', 'drop', 'adena'];
        for (const field of fields) {
            tableHtml += `<tr><td class="field-label">${field}</td>`;
            for (const server of compareServers) {
                let value = server[field] || '—';
                tableHtml += `<td class="field-value">${escapeHtml(value)}</td>`;
            }
            tableHtml += `</tr>`;
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
                    <div class="server-logo ${server.logo ? '' : 'placeholder'}">
                        ${server.logo ? `<img src="${escapeHtml(server.logo)}" alt="${escapeHtml(server.name)}" loading="lazy">` : '<span>🎮</span>'}
                    </div>
                    <div class="server-details">
                        <a href="/server/${server.slug || server._id}" class="server-name-link">
                            <h3 class="server-name">${escapeHtml(server.name)}</h3>
                        </a>
                        <div class="server-meta">
                            <span class="badge ${statusClass}">${escapeHtml(server.status)}</span>
                            <span class="server-version">📌 ${escapeHtml(server.version || 'Interlude')}</span>
                        </div>
                        <div class="review-summary">
                            <div class="rating-stars">${renderStars(avgRating)}</div>
                            <div class="review-count">${reviewCount} ${getReviewWord(reviewCount)}</div>
                            <button class="btn-write-review" onclick="openReviewModal('${server._id}')" title="Написать отзыв">✍️</button>
                        </div>
                        <div class="server-actions">
                            <button class="btn-compare" onclick="addToCompare('${server._id}')" ${compareBtnDisabled}>${compareBtnText}</button>
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
            serversList.innerHTML = '<div class="empty">🔍 Серверов не найдено</div>';
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
    
    function lockBodyScroll() { document.body.classList.add('modal-open'); }
    function unlockBodyScroll() { document.body.classList.remove('modal-open'); }
    
    function openReviewsModal(serverId, serverName) {
        currentReviewsServerId = serverId;
        if (reviewsModalTitle) reviewsModalTitle.innerHTML = `📝 Отзывы о "${escapeHtml(serverName)}"`;
        if (reviewsModal) reviewsModal.style.display = 'flex';
        lockBodyScroll();
        loadReviewsModal(serverId, 1);
    }
    
    async function loadReviewsModal(serverId, page = 1) {
        if (reviewsModalList) reviewsModalList.innerHTML = '<div class="loading">Загрузка...</div>';
        try {
            const response = await fetch(`/api/servers/${serverId}/reviews?page=${page}`);
            const data = await response.json();
            if (!reviewsModalList) return;
            if (!data.reviews.length) {
                reviewsModalList.innerHTML = '<div class="empty">Нет отзывов</div>';
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
                </div>
            `).join('');
        } catch (error) {
            console.error(error);
            if (reviewsModalList) reviewsModalList.innerHTML = '<div class="empty">Ошибка загрузки</div>';
        }
    }
    
    function closeReviewsModal() {
        if (reviewsModal) reviewsModal.style.display = 'none';
        unlockBodyScroll();
    }
    
    const reviewModal = document.getElementById('reviewModal');
    let currentServerId = null;
    
    function openReviewModal(serverId) {
        currentServerId = serverId;
        const reviewServerId = document.getElementById('reviewServerId');
        if (reviewServerId) reviewServerId.value = serverId;
        if (reviewModal) reviewModal.style.display = 'flex';
        lockBodyScroll();
    }
    
    function closeReviewModal() {
        if (reviewModal) reviewModal.style.display = 'none';
        unlockBodyScroll();
    }
    
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        toast.style.background = type === 'error' ? '#ff4757' : (type === 'info' ? '#6c5ce7' : '#00b894');
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
    }
    
    // =============== ИНИЦИАЛИЗАЦИЯ ===============
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.status;
            currentPage = 1;
            if (currentSearch) searchServers(); else loadServers();
        });
    });
    
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
    
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', () => backToTop.classList.toggle('visible', window.scrollY > 300));
        backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
    
    window.addEventListener('click', (e) => {
        if (e.target === reviewModal) closeReviewModal();
        if (e.target === reviewsModal) closeReviewsModal();
        if (e.target === document.getElementById('compareModal')) closeCompareModal();
    });
    
    // Запуск
    if (document.getElementById('serversList')) {
        loadServers();
    }
    
    // Экспорт глобальных функций
    window.changePage = changePage;
    window.openReviewsModal = openReviewsModal;
    window.openReviewModal = openReviewModal;
    window.closeReviewsModal = closeReviewsModal;
    window.closeReviewModal = closeReviewModal;
    window.addToCompare = addToCompare;
    window.removeFromCompare = removeFromCompare;
    window.showCompareModal = showCompareModal;
    window.closeCompareModal = closeCompareModal;
})();