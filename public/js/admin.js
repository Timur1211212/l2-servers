// =============== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ===============
let currentUser = null;
let currentEditingServerId = null;
let currentEditingDmcaId = null;
let currentEditingReviewId = null;
let serverToDelete = null;
let currentPage = { servers: 1, reviews: 1, dmca: 1 };
let currentFilters = { reviews: 'pending', dmca: 'pending' };
let analyticsPeriod = '7d';

// =============== DOM ЭЛЕМЕНТЫ ===============
const loginContainer = document.getElementById('loginContainer');
const adminContainer = document.getElementById('adminContainer');
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');
const alertMessage = document.getElementById('alertMessage');
const currentUserSpan = document.getElementById('currentUser');
const logoutBtn = document.getElementById('logoutBtn');

// Навигация
const navServers = document.getElementById('navServers');
const navReviews = document.getElementById('navReviews');
const navDmca = document.getElementById('navDmca');
const navAnalytics = document.getElementById('navAnalytics');
const navABTests = document.getElementById('navABTests');

// Секции
const serversSection = document.getElementById('servers-section');
const serverFormSection = document.getElementById('server-form-section');
const reviewsSection = document.getElementById('reviews-section');
const dmcaSection = document.getElementById('dmca-section');
const analyticsSection = document.getElementById('analytics-section');
const abtestsSection = document.getElementById('abtests-section');

// =============== АУТЕНТИФИКАЦИЯ ===============
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/admin/check-auth', { credentials: 'include' });
        if (response.ok) {
            const data = await response.json();
            if (data.authenticated) {
                currentUser = data.user;
                showAdminPanel();
                loadServers();
            } else showLoginForm();
        } else showLoginForm();
    } catch (error) { showLoginForm(); }
});

function showLoginForm() { loginContainer.style.display = 'block'; adminContainer.style.display = 'none'; }
function showAdminPanel() { loginContainer.style.display = 'none'; adminContainer.style.display = 'block'; if (currentUser) currentUserSpan.textContent = currentUser.username; }

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
            credentials: 'include'
        });
        const data = await response.json();
        if (data.success) {
            currentUser = data.user;
            showAdminPanel();
            showAlert('Успешный вход!', 'success');
            loadServers();
        } else showError(data.error || 'Ошибка входа');
    } catch (error) { showError('Ошибка подключения'); }
});

logoutBtn.addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    currentUser = null;
    showLoginForm();
});

// =============== НАВИГАЦИЯ ===============
navServers.addEventListener('click', () => { showSection('servers'); loadServers(); });
navReviews.addEventListener('click', () => { showSection('reviews'); loadReviews(); });
navDmca.addEventListener('click', () => { showSection('dmca'); loadDmca(); });
navAnalytics.addEventListener('click', () => { showSection('analytics'); loadAnalytics(); });
navABTests.addEventListener('click', () => { showSection('abtests'); loadABTests(); });

function showSection(section) {
    serversSection.style.display = 'none';
    serverFormSection.style.display = 'none';
    reviewsSection.style.display = 'none';
    dmcaSection.style.display = 'none';
    analyticsSection.style.display = 'none';
    abtestsSection.style.display = 'none';
    if (section === 'servers') serversSection.style.display = 'block';
    else if (section === 'reviews') reviewsSection.style.display = 'block';
    else if (section === 'dmca') dmcaSection.style.display = 'block';
    else if (section === 'analytics') analyticsSection.style.display = 'block';
    else if (section === 'abtests') abtestsSection.style.display = 'block';
}

// =============== СЕРВЕРЫ ===============
async function loadServers() {
    try {
        const response = await fetch('/api/admin/servers', { credentials: 'include' });
        if (response.status === 401) { showLoginForm(); return; }
        const servers = await response.json();
        displayServers(servers);
    } catch (error) { console.error(error); }
}

function displayServers(servers) {
    const container = document.getElementById('serversList');
    if (!servers.length) { container.innerHTML = '<div class="empty-state">Серверов нет</div>'; return; }
    container.innerHTML = servers.map(server => `
        <div class="server-card">
            <div class="card-info">
                <div class="card-details">
                    <h3>${escapeHtml(server.name)}</h3>
                    <div class="card-meta">${server.version || 'Interlude'} • ${server.website || ''}</div>
                </div>
                <div class="card-actions">
                    <button class="btn btn-warning" onclick="editServer('${server._id}')">Редактировать</button>
                    <button class="btn btn-danger" onclick="showDeleteModal('${server._id}', '${escapeHtml(server.name)}')">Удалить</button>
                </div>
            </div>
        </div>
    `).join('');
}

window.editServer = async function(id) {
    try {
        const response = await fetch(`/api/admin/servers/${id}`, { credentials: 'include' });
        const server = await response.json();
        currentEditingServerId = server._id;
        document.getElementById('serverId').value = server._id;
        document.getElementById('serverName').value = server.name;
        document.getElementById('serverWebsite').value = server.website;
        document.getElementById('version').value = server.version || '';
        document.getElementById('status').value = server.status || 'Не VIP, но тоже неплохой сервер';
        if (server.openingDate) document.getElementById('openingDate').value = new Date(server.openingDate).toISOString().split('T')[0];
        document.getElementById('exp').value = server.exp || '';
        document.getElementById('adena').value = server.adena || '';
        document.getElementById('drop').value = server.drop || '';
        document.getElementById('spoil').value = server.spoil || '';
        document.getElementById('spoilChance').value = server.spoilChance || '';
        document.getElementById('sealstone').value = server.sealstone || '';
        document.getElementById('raidBossExp').value = server.raidBossExp || '';
        document.getElementById('raidBossDrop').value = server.raidBossDrop || '';
        document.getElementById('epicRaidBossDrop').value = server.epicRaidBossDrop || '';
        document.getElementById('questAdena').value = server.questAdena || '';
        document.getElementById('quest').value = server.quest || '';
        document.getElementById('questExp').value = server.questExp || '';
        document.getElementById('description').value = server.description || '';
        serversSection.style.display = 'none';
        serverFormSection.style.display = 'block';
        document.getElementById('formTitle').textContent = '✏️ Редактирование сервера';
    } catch (error) { showAlert('Ошибка загрузки сервера', 'error'); }
};

document.getElementById('addServerBtn')?.addEventListener('click', () => {
    currentEditingServerId = null;
    document.getElementById('serverForm').reset();
    document.getElementById('status').value = 'Не VIP, но тоже неплохой сервер';
    serversSection.style.display = 'none';
    serverFormSection.style.display = 'block';
    document.getElementById('formTitle').textContent = '➕ Добавление сервера';
});

document.getElementById('backToList')?.addEventListener('click', () => {
    serversSection.style.display = 'block';
    serverFormSection.style.display = 'none';
    loadServers();
});

document.getElementById('cancelServer')?.addEventListener('click', () => {
    serversSection.style.display = 'block';
    serverFormSection.style.display = 'none';
});

document.getElementById('serverForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const serverData = {
        name: document.getElementById('serverName').value,
        website: document.getElementById('serverWebsite').value,
        version: document.getElementById('version').value,
        status: document.getElementById('status').value,
        openingDate: document.getElementById('openingDate').value || null,
        exp: document.getElementById('exp').value,
        adena: document.getElementById('adena').value,
        drop: document.getElementById('drop').value,
        spoil: document.getElementById('spoil').value,
        spoilChance: document.getElementById('spoilChance').value,
        sealstone: document.getElementById('sealstone').value,
        raidBossExp: document.getElementById('raidBossExp').value,
        raidBossDrop: document.getElementById('raidBossDrop').value,
        epicRaidBossDrop: document.getElementById('epicRaidBossDrop').value,
        questAdena: document.getElementById('questAdena').value,
        quest: document.getElementById('quest').value,
        questExp: document.getElementById('questExp').value,
        description: document.getElementById('description').value
    };
    try {
        const url = currentEditingServerId ? `/api/servers/${currentEditingServerId}` : '/api/servers';
        const method = currentEditingServerId ? 'PUT' : 'POST';
        const response = await fetch(url, {
            method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(serverData), credentials: 'include'
        });
        const data = await response.json();
        if (data.success) {
            showAlert(currentEditingServerId ? 'Сервер обновлен' : 'Сервер создан', 'success');
            serversSection.style.display = 'block';
            serverFormSection.style.display = 'none';
            loadServers();
            currentEditingServerId = null;
        } else showAlert(data.error, 'error');
    } catch (error) { showAlert('Ошибка сохранения', 'error'); }
});

window.showDeleteModal = function(id, name) {
    serverToDelete = id;
    document.getElementById('deleteMessage').textContent = `Удалить сервер "${name}"?`;
    document.getElementById('deleteModal').style.display = 'flex';
};
document.getElementById('confirmDelete')?.addEventListener('click', async () => {
    if (!serverToDelete) return;
    try {
        const response = await fetch(`/api/servers/${serverToDelete}`, { method: 'DELETE', credentials: 'include' });
        if (response.ok) { showAlert('Сервер удален', 'success'); loadServers(); }
        document.getElementById('deleteModal').style.display = 'none';
        serverToDelete = null;
    } catch (error) { showAlert('Ошибка удаления', 'error'); }
});
document.getElementById('cancelDelete')?.addEventListener('click', () => { document.getElementById('deleteModal').style.display = 'none'; serverToDelete = null; });

// =============== ОТЗЫВЫ ===============
async function loadReviews() {
    try {
        const response = await fetch(`/api/admin/reviews?status=${currentFilters.reviews}`, { credentials: 'include' });
        const data = await response.json();
        displayReviews(data.reviews);
    } catch (error) { console.error(error); }
}

function displayReviews(reviews) {
    const container = document.getElementById('reviewsList');
    if (!reviews.length) { container.innerHTML = '<div class="empty-state">Нет отзывов</div>'; return; }
    container.innerHTML = reviews.map(review => `
        <div class="review-card">
            <div class="card-info">
                <div class="card-details">
                    <h3>${escapeHtml(review.title)}</h3>
                    <div class="card-meta">⭐ ${review.rating}/5 • ${escapeHtml(review.authorName)} • ${new Date(review.createdAt).toLocaleDateString()}</div>
                    <div class="card-meta">Сервер: ${review.serverId?.name || 'Unknown'}</div>
                    <div class="card-meta">Статус: <span style="color: ${review.status === 'pending' ? '#ffa502' : review.status === 'approved' ? '#00b894' : '#ff4757'}">${review.status}</span></div>
                    <div class="review-content-preview">${escapeHtml(review.content.substring(0, 200))}${review.content.length > 200 ? '...' : ''}</div>
                </div>
                <div class="card-actions">
                    <button class="btn btn-warning" onclick="moderateReview('${review._id}')">Модерировать</button>
                </div>
            </div>
        </div>
    `).join('');
}

window.moderateReview = async function(id) {
    try {
        const response = await fetch(`/api/admin/reviews/${id}`, { credentials: 'include' });
        const review = await response.json();
        currentEditingReviewId = review._id;
        document.getElementById('reviewDetails').innerHTML = `
            <div class="review-detail"><strong>Автор:</strong> ${escapeHtml(review.authorName)}</div>
            <div class="review-detail"><strong>Рейтинг:</strong> ⭐ ${review.rating}/5</div>
            <div class="review-detail"><strong>Заголовок:</strong> ${escapeHtml(review.title)}</div>
            <div class="review-detail"><strong>Текст:</strong> ${escapeHtml(review.content)}</div>
            ${review.pros ? `<div class="review-detail"><strong>Плюсы:</strong> ${escapeHtml(review.pros)}</div>` : ''}
            ${review.cons ? `<div class="review-detail"><strong>Минусы:</strong> ${escapeHtml(review.cons)}</div>` : ''}
            <div class="review-detail"><strong>IP:</strong> ${review.ipAddress}</div>
            <div class="review-detail"><strong>Дата:</strong> ${new Date(review.createdAt).toLocaleString()}</div>
        `;
        document.getElementById('reviewStatus').value = review.status;
        document.getElementById('reviewNotes').value = review.moderationNotes || '';
        document.getElementById('reviewModal').style.display = 'flex';
    } catch (error) { showAlert('Ошибка загрузки отзыва', 'error'); }
};

document.getElementById('saveReview')?.addEventListener('click', async () => {
    try {
        const response = await fetch(`/api/admin/reviews/${currentEditingReviewId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: document.getElementById('reviewStatus').value,
                moderationNotes: document.getElementById('reviewNotes').value
            }),
            credentials: 'include'
        });
        if (response.ok) {
            showAlert('Отзыв обновлен', 'success');
            document.getElementById('reviewModal').style.display = 'none';
            loadReviews();
        }
    } catch (error) { showAlert('Ошибка сохранения', 'error'); }
});

document.getElementById('deleteReview')?.addEventListener('click', async () => {
    if (!confirm('Удалить отзыв?')) return;
    try {
        await fetch(`/api/admin/reviews/${currentEditingReviewId}`, { method: 'DELETE', credentials: 'include' });
        showAlert('Отзыв удален', 'success');
        document.getElementById('reviewModal').style.display = 'none';
        loadReviews();
    } catch (error) { showAlert('Ошибка удаления', 'error'); }
});

document.querySelectorAll('#reviews-section .filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('#reviews-section .filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentFilters.reviews = this.dataset.status;
        loadReviews();
    });
});
document.getElementById('refreshReviews')?.addEventListener('click', loadReviews);

// =============== DMCA ===============
async function loadDmca() {
    try {
        const response = await fetch(`/api/admin/dmca?status=${currentFilters.dmca}`, { credentials: 'include' });
        const data = await response.json();
        displayDmca(data.complaints);
    } catch (error) { console.error(error); }
}

function displayDmca(complaints) {
    const container = document.getElementById('dmcaList');
    if (!complaints.length) { container.innerHTML = '<div class="empty-state">Нет жалоб</div>'; return; }
    container.innerHTML = complaints.map(c => `
        <div class="dmca-card">
            <div class="card-info">
                <div class="card-details">
                    <h3>Жалоба от ${escapeHtml(c.fullName)}</h3>
                    <div class="card-meta">Email: ${escapeHtml(c.email)} • Дата: ${new Date(c.createdAt).toLocaleDateString()}</div>
                    <div class="card-meta">Статус: <span style="color: ${c.status === 'pending' ? '#ffa502' : c.status === 'reviewed' ? '#6c5ce7' : c.status === 'resolved' ? '#00b894' : '#ff4757'}">${c.status}</span></div>
                </div>
                <div class="card-actions">
                    <button class="btn btn-warning" onclick="viewDmca('${c._id}')">Просмотреть</button>
                </div>
            </div>
        </div>
    `).join('');
}

window.viewDmca = async function(id) {
    try {
        const response = await fetch(`/api/admin/dmca/${id}`, { credentials: 'include' });
        const c = await response.json();
        currentEditingDmcaId = c._id;
        document.getElementById('dmcaDetails').innerHTML = `
            <div><strong>Заявитель:</strong> ${escapeHtml(c.fullName)}</div>
            <div><strong>Email:</strong> ${escapeHtml(c.email)}</div>
            <div><strong>Компания:</strong> ${escapeHtml(c.company) || '-'}</div>
            <div><strong>Защищенное произведение:</strong> ${escapeHtml(c.copyrightedWork)}</div>
            <div><strong>Нарушающий контент:</strong> ${escapeHtml(c.infringingContent)}</div>
            <div><strong>Заявление:</strong> ${escapeHtml(c.statement)}</div>
            <div><strong>IP:</strong> ${c.ipAddress}</div>
            <div><strong>Дата:</strong> ${new Date(c.createdAt).toLocaleString()}</div>
        `;
        document.getElementById('dmcaStatus').value = c.status;
        document.getElementById('dmcaNotes').value = c.adminNotes || '';
        document.getElementById('dmcaModal').style.display = 'flex';
    } catch (error) { showAlert('Ошибка загрузки', 'error'); }
};

document.getElementById('saveDmca')?.addEventListener('click', async () => {
    try {
        await fetch(`/api/admin/dmca/${currentEditingDmcaId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: document.getElementById('dmcaStatus').value,
                adminNotes: document.getElementById('dmcaNotes').value
            }),
            credentials: 'include'
        });
        showAlert('Жалоба обновлена', 'success');
        document.getElementById('dmcaModal').style.display = 'none';
        loadDmca();
    } catch (error) { showAlert('Ошибка', 'error'); }
});

document.getElementById('deleteDmca')?.addEventListener('click', async () => {
    if (!confirm('Удалить жалобу?')) return;
    try {
        await fetch(`/api/admin/dmca/${currentEditingDmcaId}`, { method: 'DELETE', credentials: 'include' });
        showAlert('Жалоба удалена', 'success');
        document.getElementById('dmcaModal').style.display = 'none';
        loadDmca();
    } catch (error) { showAlert('Ошибка', 'error'); }
});

document.querySelectorAll('#dmca-section .filter-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('#dmca-section .filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentFilters.dmca = this.dataset.status;
        loadDmca();
    });
});
document.getElementById('refreshDmca')?.addEventListener('click', loadDmca);

// =============== АНАЛИТИКА ===============
async function loadAnalytics() {
    try {
        const response = await fetch(`/api/admin/analytics/overview?period=${analyticsPeriod}`, { credentials: 'include' });
        const data = await response.json();
        document.getElementById('totalVisits').textContent = data.totalVisits || 0;
        document.getElementById('uniqueVisitors').textContent = data.uniqueVisitors || 0;
        document.getElementById('topPages').innerHTML = `<h3>Топ страниц</h3>${(data.topPages || []).map(p => `<div>${p._id}: ${p.count} просмотров</div>`).join('')}`;
        document.getElementById('topServers').innerHTML = `<h3>Топ серверов</h3>${(data.topServers || []).map(s => `<div>${s.serverName || s._id}: ${s.clicks} кликов</div>`).join('')}`;
    } catch (error) { console.error(error); }
}

document.querySelectorAll('.period-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        analyticsPeriod = this.dataset.period;
        loadAnalytics();
    });
});

// =============== A/B ТЕСТЫ ===============
async function loadABTests() {
    try {
        const response = await fetch('/api/admin/ab-tests', { credentials: 'include' });
        const tests = await response.json();
        displayABTests(tests);
    } catch (error) { console.error(error); }
}

function displayABTests(tests) {
    const container = document.getElementById('testsList');
    if (!tests.length) { container.innerHTML = '<div class="empty-state">Нет тестов</div>'; return; }
    container.innerHTML = tests.map(test => `
        <div class="test-card">
            <div class="card-info">
                <div class="card-details">
                    <h3>${escapeHtml(test.name)}</h3>
                    <div class="card-meta">Статус: ${test.status} • Вариантов: ${test.variants?.length || 0}</div>
                    <div class="card-meta">${test.description || ''}</div>
                </div>
                <div class="card-actions">
                    <button class="btn btn-info" onclick="viewTestResults('${test._id}')">Результаты</button>
                </div>
            </div>
        </div>
    `).join('');
}

document.getElementById('createTestBtn')?.addEventListener('click', () => { document.getElementById('testModal').style.display = 'flex'; });
document.getElementById('testForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const variants = JSON.parse(document.getElementById('testVariants').value);
        const response = await fetch('/api/admin/ab-tests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: document.getElementById('testName').value,
                description: document.getElementById('testDesc').value,
                variants,
                targetPages: ['/'],
                status: 'active',
                metrics: [{ name: 'click_play', type: 'click', target: '.btn-primary' }]
            }),
            credentials: 'include'
        });
        if (response.ok) {
            showAlert('Тест создан', 'success');
            document.getElementById('testModal').style.display = 'none';
            loadABTests();
        }
    } catch (error) { showAlert('Ошибка создания теста', 'error'); }
});

// =============== ВСПОМОГАТЕЛЬНЫЕ ===============
function showAlert(message, type) {
    alertMessage.textContent = message;
    alertMessage.className = `alert alert-${type}`;
    alertMessage.style.display = 'block';
    setTimeout(() => alertMessage.style.display = 'none', 3000);
}
function showError(message) { errorMessage.textContent = message; errorMessage.style.display = 'block'; setTimeout(() => errorMessage.style.display = 'none', 3000); }
function escapeHtml(text) { if (!text) return ''; const div = document.createElement('div'); div.textContent = text; return div.innerHTML; }

// Закрытие модальных окон
document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', function() { this.closest('.modal').style.display = 'none'; });
});