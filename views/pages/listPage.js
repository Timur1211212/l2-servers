// views/pages/listPage.js
const { baseLayout } = require('../layouts/baseLayout');
const { renderBreadcrumbs } = require('../components/breadcrumbs');
const { serverCard } = require('../components/serverCard');
const { generateItemListSchema } = require('../../utils/seoHelpers');
const { escapeHtml } = require('../../utils/htmlHelpers');

function generateListPage(servers, title, description, pageType) {
    const breadcrumbName = getBreadcrumbName(pageType);
    const pageTitle = getPageTitle(title, pageType);
    const pageDescription = getPageDescription(description, pageType);
    
    const breadcrumbs = renderBreadcrumbs([
        { name: 'Главная', url: '/' },
        { name: breadcrumbName, url: `/${pageType}-servers` }
    ]);
    
    const content = `
        <h1>${pageTitle}</h1>
        <p class="subtitle">${pageDescription}</p>
        
        <div class="nav-links">
            <a href="/" class="nav-link">🏠 Главная</a>
            <a href="/top-servers" class="nav-link ${pageType === 'top' ? 'active' : ''}">🏆 Топ серверы</a>
            <a href="/new-servers" class="nav-link ${pageType === 'new' ? 'active' : ''}">🆕 Новые серверы</a>
            <a href="/all-servers" class="nav-link ${pageType === 'all' ? 'active' : ''}">📋 Все серверы</a>
            <a href="/vip-servers" class="nav-link ${pageType === 'vip' ? 'active' : ''}">⭐ VIP серверы</a>
            <a href="/pvp-servers" class="nav-link ${pageType === 'pvp' ? 'active' : ''}">⚔️ PvP серверы</a>
            <a href="/version/interlude" class="nav-link">🎮 Interlude</a>
            <a href="/download" class="nav-link">📥 Скачать клиент</a>
        </div>
        
        <div class="servers-list">
            ${servers.length > 0 
                ? `<div class="servers-grid">${servers.map(s => serverCard(s)).join('')}</div>`
                : '<div class="empty">Серверов не найдено</div>'
            }
        </div>
        
        <div class="total-count">📊 Всего серверов в категории: ${servers.length}</div>
        
        ${generateSeoBlock(pageType, servers.length)}
    `;
    
    const schema = generateItemListSchema(servers.slice(0, 20), pageTitle, pageDescription);
    
    return baseLayout({
        title: `${pageTitle} | База серверов Lineage 2`,
        description: pageDescription,
        canonical: `/${pageType}-servers`,
        breadcrumbs,
        content,
        schema
    });
}

function getBreadcrumbName(pageType) {
    const names = {
        top: '🏆 Топ серверы',
        new: '🆕 Новые серверы',
        all: '📋 Все серверы',
        vip: '⭐ VIP серверы',
        pvp: '⚔️ PvP серверы'
    };
    return names[pageType] || 'Серверы';
}

function getPageTitle(title, pageType) {
    if (title) return title;
    const titles = {
        top: '🏆 Топ серверы Lineage 2',
        new: '🆕 Новые серверы Lineage 2',
        all: '📋 Все серверы Lineage 2',
        vip: '⭐ VIP серверы Lineage 2',
        pvp: '⚔️ PvP серверы Lineage 2'
    };
    return titles[pageType] || 'Серверы Lineage 2';
}

function getPageDescription(description, pageType) {
    if (description) return description;
    const descriptions = {
        top: 'Лучшие серверы по рейтингу и отзывам игроков. Топ-100 проектов с самым высоким рейтингом.',
        new: 'Свежие открытия серверов с лучшими условиями для старта. Играй на новых проектах с чистого листа!',
        all: 'Полный каталог серверов Lineage 2 с рейтингами, рейтами и отзывами. Найди свой идеальный сервер!',
        vip: 'Лучшие VIP серверы с высокой стабильностью, большим онлайном и профессиональной администрацией.',
        pvp: 'Лучшие PvP серверы для массовых сражений, осад замков и олимпиад. Динамичная игра с первого дня!'
    };
    return descriptions[pageType] || 'Каталог серверов Lineage 2';
}

function generateSeoBlock(pageType, serverCount) {
    const blocks = {
        top: `
            <div class="seo-content">
                <h2>Как формируется топ серверов?</h2>
                <p>Топ серверов составляется на основе рейтинга игроков, количества отзывов и активности проектов. Мы учитываем реальные оценки игроков, чтобы показать самые качественные проекты.</p>
                <p>В топе представлены ${serverCount} лучших серверов Lineage 2 с наивысшим рейтингом. Здесь вы найдете проверенные проекты с большим онлайном и хорошей репутацией.</p>
            </div>
        `,
        new: `
            <div class="seo-content">
                <h2>Почему стоит играть на новых серверах?</h2>
                <p>Новые серверы предлагают свежий старт без перекосов в экономике, равные условия для всех игроков и активное комьюнити на старте. Вы не будете отставать от топ-игроков и сможете войти в число лидеров.</p>
                <p>В нашем каталоге ${serverCount} новых серверов, открывшихся за последние 30 дней. Выбирайте свежий проект и начинайте игру на равных!</p>
            </div>
        `,
        vip: `
            <div class="seo-content">
                <h2>Преимущества VIP серверов</h2>
                <p>VIP серверы отличаются высокой стабильностью, профессиональной администрацией, регулярными обновлениями и большим онлайн-сообществом. Это лучший выбор для тех, кто ценит качество игры и не хочет сталкиваться с техническими проблемами.</p>
                <p>В нашем каталоге ${serverCount} VIP серверов. Все проекты проверены и имеют высокий рейтинг игроков.</p>
            </div>
        `,
        pvp: `
            <div class="seo-content">
                <h2>Лучшие серверы для PvP</h2>
                <p>PvP серверы созданы для тех, кто любит массовые сражения, осады замков и олимпиады. Здесь прокачка занимает минимум времени, а основной акцент сделан на битвах между игроками.</p>
                <p>В нашем каталоге ${serverCount} PvP серверов с высокими рейтами и активным PvP-сообществом.</p>
            </div>
        `
    };
    
    return blocks[pageType] || '';
}

module.exports = { generateListPage };