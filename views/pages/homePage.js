// views/pages/homePage.js
const { baseLayout } = require('../layouts/baseLayout');
const { renderBreadcrumbs } = require('../components/breadcrumbs');
const { serverCard } = require('../components/serverCard');
const { generateItemListSchema } = require('../../utils/seoHelpers');

function generateHomePage(servers) {
    const content = `
        <h1>Рейтинг серверов Lineage 2 2026</h1>
        <p class="subtitle">Лучшие серверы Lineage 2 с отзывами игроков, рейтингами и полной статистикой</p>
        
        <div class="search-bar">
            <input type="text" id="searchInput" placeholder="🔍 Поиск серверов по названию, версии или рейтам..." autocomplete="off">
        </div>
        
        <div class="filters">
            <button class="filter-btn active" data-status="all">🌐 Все серверы</button>
            <button class="filter-btn" data-status="VIP">⭐ VIP серверы</button>
            <button class="filter-btn" data-status="Почти VIP">✨ Почти VIP</button>
            <button class="filter-btn" data-status="Не VIP, но тоже неплохой сервер">🛡️ Обычные</button>
        </div>
        
        <div class="download-banner">
            <a href="/download" class="download-banner-link">📥 Скачать клиент Lineage 2 бесплатно →</a>
        </div>
        
        <div class="stats">
            <div class="stat">📊 Серверов в базе: <span id="totalServers">${servers.length}</span></div>
        </div>
        
        <div id="serversList" class="servers-grid">
            ${servers.map(s => serverCard(s)).join('')}
        </div>
        
        <div class="seo-content">
            <h2>Лучшие серверы Lineage 2 2026 — Полный каталог</h2>
            <p><strong>База серверов Lineage 2</strong> — это крупнейший русскоязычный каталог частных серверов L2. Мы собираем актуальную информацию о всех популярных проектах: рейты, версии, даты открытий, отзывы игроков. Наш рейтинг помогает выбрать лучший сервер для комфортной игры.</p>
            
            <h3>Почему стоит играть на проверенных серверах Lineage 2?</h3>
            <p>Выбор качественного сервера — залог комфортной игры. На нашей базе вы найдете только проверенные проекты с честной администрацией, стабильной работой и активным комьюнити. Мы ежедневно обновляем информацию и проверяем доступность серверов.</p>
            
            <h3>Какие версии Lineage 2 представлены в каталоге?</h3>
            <ul>
                <li><strong>Interlude</strong> — классическая версия, любимая миллионами игроков</li>
                <li><strong>High Five</strong> — улучшенная графика, баланс классов и новый контент</li>
                <li><strong>Classic</strong> — возвращение к истокам игры</li>
                <li><strong>Essence</strong> — упрощенная версия для быстрого старта</li>
            </ul>
            
            <h3>Как выбрать сервер для игры в 2026 году?</h3>
            <p>При выборе сервера обращайте внимание на рейтинг, количество отзывов, дату открытия и рейты. Свежие проекты часто предлагают лучшие условия для старта, а топовые серверы гарантируют стабильность и большое онлайн-сообщество.</p>
        </div>
        
        <div class="popular-versions">
            <h3>Популярные версии серверов</h3>
            <div class="version-links">
                <a href="/version/interlude" class="version-link">Interlude серверы</a>
                <a href="/version/high-five" class="version-link">High Five серверы</a>
                <a href="/version/classic" class="version-link">Classic серверы</a>
                <a href="/version/essence" class="version-link">Essence серверы</a>
                <a href="/top-servers" class="version-link">🏆 Топ серверы</a>
                <a href="/new-servers" class="version-link">🆕 Новые серверы</a>
                <a href="/vip-servers" class="version-link">⭐ VIP серверы</a>
                <a href="/pvp-servers" class="version-link">⚔️ PvP серверы</a>
            </div>
        </div>
    `;
    
    const schema = generateItemListSchema(servers, 'Рейтинг серверов Lineage 2 2026', 'Лучшие серверы L2');
    
    return baseLayout({
        title: 'Рейтинг серверов Lineage 2 2026 — каталог L2 серверов с отзывами',
        description: 'Актуальный рейтинг серверов Lineage 2 2026. Лучшие L2 серверы: Interlude, High Five, Classic. Подробная статистика, рейты, отзывы игроков.',
        keywords: 'lineage 2 серверы, l2 серверы, рейтинг серверов lineage 2',
        canonical: '/',
        breadcrumbs: renderBreadcrumbs([{ name: 'Главная', url: '/' }]),
        content,
        schema,
        ogImage: '/og-image.jpg',
        additionalScripts: '<script src="/js/main.js" defer></script>'
    });
}

module.exports = { generateHomePage };