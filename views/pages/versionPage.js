// views/pages/versionPage.js
const { baseLayout } = require('../layouts/baseLayout');
const { renderBreadcrumbs } = require('../components/breadcrumbs');
const { serverCard } = require('../components/serverCard');
const { generateSeoText, generateVersionH1, generateVersionH2, generateItemListSchema } = require('../../utils/seoHelpers');
const { escapeHtml } = require('../../utils/htmlHelpers');

function generateVersionPage(version, servers, filter = '') {
    const vipServers = servers.filter(s => s.status === 'VIP');
    const newServers = servers.filter(s => {
        if (!s.openingDate) return false;
        const daysOld = (Date.now() - new Date(s.openingDate)) / (1000 * 60 * 60 * 24);
        return daysOld <= 30;
    }).slice(0, 6);
    
    const topServers = servers.slice(0, 10);
    const totalCount = servers.length;
    
    const versionSlug = version.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    
    const breadcrumbs = renderBreadcrumbs([
        { name: 'Главная', url: '/' },
        { name: version, url: `/version/${versionSlug}` }
    ]);
    
    const content = `
        <div class="version-header">
            <div class="version-badge">⭐ ${getVersionDescription(version)}</div>
            <h1>${generateVersionH1(version, filter)}</h1>
            <p class="subtitle">${getVersionSubtitle(version)}</p>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card"><div class="number">${totalCount}</div><div class="label">🎮 Серверов ${version}</div></div>
            <div class="stat-card"><div class="number">${vipServers.length}</div><div class="label">⭐ VIP серверов</div></div>
            <div class="stat-card"><div class="number">${newServers.length}</div><div class="label">🆕 Новых (до 30 дней)</div></div>
        </div>
        
        <h2 class="section-title">🏆 Топ 10 серверов ${version} <span>по рейтингу игроков</span></h2>
        <div class="servers-grid">
            ${topServers.map((s, index) => `
                <div class="server-card-wrapper">
                    <div class="top-badge">#${index + 1}</div>
                    ${serverCard(s)}
                </div>
            `).join('')}
        </div>
        
        ${vipServers.length > 0 ? `
            <h2 class="section-title">⭐ VIP серверы ${version}</h2>
            <div class="servers-grid">
                ${vipServers.slice(0, 6).map(s => serverCard(s)).join('')}
            </div>
        ` : ''}
        
        ${generateSeoText(version, totalCount)}
        
        <div class="faq-section">
            <h2>❓ Часто задаваемые вопросы о серверах ${version}</h2>
            ${generateFaq(version)}
        </div>
    `;
    
    const schema = generateItemListSchema(topServers, `Топ серверов ${version}`, `Лучшие серверы ${version} по рейтингу`);
    
    const title = filter 
        ? `Серверы Lineage 2 ${version} ${filter} 2026 | Рейтинг и каталог`
        : `Серверы Lineage 2 ${version} 2026 | Рейтинг и каталог L2 ${version} серверов`;
    
    const description = filter
        ? `Актуальный рейтинг серверов Lineage 2 ${version} ${filter} 2026. Лучшие ${version} серверы с высоким онлайном, честными рейтами и отзывами игроков.`
        : `Актуальный рейтинг серверов Lineage 2 ${version} 2026. Лучшие L2 ${version} серверы с высоким онлайном, честными рейтами и отзывами игроков.`;
    
    return baseLayout({
        title,
        description,
        keywords: `lineage 2 ${version}, l2 ${version} серверы, сервера л2 ${versionSlug}`,
        canonical: `/version/${versionSlug}`,
        breadcrumbs,
        content,
        schema,
        ogImage: `/images/og/version-${versionSlug}.jpg`
    });
}

function getVersionDescription(version) {
    const descriptions = {
        'Interlude': 'Классическая версия Lineage 2',
        'High Five': 'Улучшенная графика и геймплей',
        'Classic': 'Возвращение к истокам',
        'Essence': 'Быстрая прокачка и динамичный PvP'
    };
    return descriptions[version] || 'Популярная версия Lineage 2';
}

function getVersionSubtitle(version) {
    const subtitles = {
        'Interlude': 'Классическая версия Lineage 2 — любимая миллионами игроков. Лучшие Interlude серверы с честной администрацией, стабильным онлайном и большим комьюнити.',
        'High Five': 'High Five (Хроники 8.0-9.0) — самая популярная версия с улучшенной графикой, новыми расами (Камаэль) и сбалансированным PvP.',
        'Classic': 'Classic — это возвращение к золотой эре Lineage 2. Оригинальные рейты x1, классический баланс классов и никаких донатных перекосов.',
        'Essence': 'Essence — современная версия Lineage 2 с упрощенной прокачкой, авто-лутом, улучшенным интерфейсом и быстрым PvP.'
    };
    return subtitles[version] || `Серверы Lineage 2 ${version} с лучшими условиями для игры`;
}

function generateFaq(version) {
    const faqs = {
        'Interlude': [
            { q: 'Какой сервер Interlude выбрать новичку?', a: 'Новичкам рекомендуем серверы с рейтами x10-x30 — оптимальный баланс между временем на прокачку и удовольствием от игры.' },
            { q: 'Есть ли донат на серверах Interlude?', a: 'На большинстве серверов донат есть, но на топовых проектах он не дает критического преимущества.' }
        ],
        'High Five': [
            { q: 'Чем High Five отличается от Interlude?', a: 'High Five имеет улучшенную графику, расу Камаэль и более сбалансированный PvP.' },
            { q: 'Какой класс лучше на High Five?', a: 'Для PvP лучшие классы: Hawkeye, Spellhowler, Treasure Hunter. Для фарма: Spoiler, Warlord.' }
        ],
        'Classic': [
            { q: 'Стоит ли играть на Classic серверах?', a: 'Classic подходит для хардкорных игроков, которые ценят долгую прокачку и честную экономику.' },
            { q: 'Какие рейты на Classic?', a: 'Обычно x1-x5, но есть и среднерейтовые проекты x10-x30.' }
        ],
        'Essence': [
            { q: 'Подходит ли Essence для новичков?', a: 'Да, Essence создана специально для новичков — упрощенная прокачка, авто-лут, понятный интерфейс.' },
            { q: 'Быстро ли прокачиваться на Essence?', a: 'Очень быстро — рейты обычно x100 и выше, максимальный уровень за несколько часов.' }
        ]
    };
    
    const versionFaqs = faqs[version] || faqs['Interlude'];
    
    return `
        <div class="faq-grid">
            ${versionFaqs.map(faq => `
                <div class="faq-item">
                    <h3>${escapeHtml(faq.q)}</h3>
                    <p>${escapeHtml(faq.a)}</p>
                </div>
            `).join('')}
        </div>
    `;
}

module.exports = { generateVersionPage };