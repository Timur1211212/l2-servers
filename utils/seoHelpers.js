// utils/seoHelpers.js

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Генерация H1 для страницы сервера
function generateServerH1(server) {
    const rates = [];
    if (server.exp) rates.push(`рейты ${server.exp}`);
    if (server.drop) rates.push(server.drop);
    if (rates.length) {
        return `${server.name} — сервер Lineage 2 ${server.version} (${rates.join('/')})`;
    }
    return `${server.name} — сервер Lineage 2 ${server.version}`;
}

// Генерация H2 для страницы сервера
function generateServerH2(server) {
    const sections = [
        `<h2>📊 Характеристики сервера ${escapeHtml(server.name)}</h2>`,
        `<h2>⭐ Рейтинг и отзывы игроков о сервере ${escapeHtml(server.name)}</h2>`
    ];
    
    if (server.rating?.count > 0) {
        sections.push(`<h2>🏆 ${escapeHtml(server.name)} в рейтинге серверов ${server.version}</h2>`);
    }
    
    sections.push(`<h2>🔗 Похожие серверы Lineage 2 ${escapeHtml(server.version)}</h2>`);
    
    return sections.join('\n');
}

// Генерация H1 для страницы версии
function generateVersionH1(version, filter = '') {
    const filterText = filter ? ` ${filter}` : '';
    return `Серверы Lineage 2 ${version} 2026${filterText} — рейтинг и каталог`;
}

// Генерация H2 для страницы версии
function generateVersionH2(version, serverCount) {
    return `
        <h2>🏆 Топ 10 серверов ${version} по рейтингу игроков</h2>
        <h2>🆕 Новые серверы ${version} (открылись за последние 30 дней)</h2>
        ${serverCount > 20 ? `<h2>📋 Все серверы ${version} — полный список</h2>` : ''}
        <h2>❓ Часто задаваемые вопросы о серверах ${version}</h2>
    `;
}

// Генерация meta description для сервера
function generateServerMetaDescription(server) {
    const rates = [];
    if (server.exp) rates.push(`Exp ${server.exp}`);
    if (server.drop) rates.push(`Drop ${server.drop}`);
    if (server.adena) rates.push(`Adena ${server.adena}`);
    
    const ratesText = rates.length ? ` ${rates.join(', ')}.` : '';
    const ratingText = server.rating?.count > 0 
        ? ` Рейтинг: ${server.rating.average.toFixed(1)}/5 (${server.rating.count} отзывов).` 
        : '';
    
    let desc = `${server.name} — сервер Lineage 2 ${server.version}.${ratesText}${ratingText}`;
    
    if (server.description) {
        desc += ` ${server.description.substring(0, 100)}`;
    }
    
    return desc.substring(0, 160);
}

// Генерация meta keywords для сервера
function generateServerMetaKeywords(server) {
    const keywords = [
        server.name,
        `сервер lineage 2 ${server.name}`,
        `l2 сервер ${server.name}`,
        `${server.version} сервер`,
        `линейдж 2 ${server.name}`,
        `рейты ${server.version}`,
        `скачать клиент ${server.name}`,
        `отзывы о ${server.name}`
    ];
    
    if (server.exp) keywords.push(`exp ${server.exp}`);
    if (server.drop) keywords.push(`drop ${server.drop}`);
    
    return keywords.join(', ');
}

// LSI ключевые слова для разных версий (Пункт 3)
const lsiKeywords = {
    interlude: [
        'классическая прокачка', 'интерлюд хроники', 'Gracia Final',
        'Kamael', 'Hellbound', 'классовые балансы Interlude',
        'осады замков', 'олимпиада', 'твинки', 'subclass система'
    ],
    'high-five': [
        'раса камаэль', 'subclass система', 'олимпиада',
        'твинки', 'трансформации', 'эпик боссы', 'фрея',
        'динамичный пвп', 'классовый баланс High Five'
    ],
    classic: [
        'хардкор', 'оригинальные рейты', 'без доната',
        'честная экономика', 'классический геймплей',
        'возвращение к истокам', 'x1 серверы'
    ],
    essence: [
        'быстрая прокачка', 'авто-лут', 'упрощенная система',
        'динамичный пвп', 'высокие рейты', 'для новичков'
    ]
};

// Генерация SEO текста с LSI ключами
function generateSeoText(version, serverCount) {
    const keywords = lsiKeywords[version.toLowerCase()] || lsiKeywords.interlude;
    const randomKeywords = keywords.slice(0, 5).join(', ');
    
    return `
        <div class="seo-content" itemscope itemtype="https://schema.org/Article">
            <h2>Почему игроки выбирают серверы ${version} в 2026 году?</h2>
            <p><strong>Серверы ${version} Lineage 2</strong> — это ${randomKeywords}. Эта версия хроник считается одной из самых популярных среди поклонников классической Lineage 2. В 2026 году интерес к ${version} только растет благодаря активному комьюнити и множеству качественных проектов.</p>
            
            <h3>Сравнение ${version} с другими хрониками</h3>
            <p>В отличие от Classic и Essence, ${version} предлагает уникальный баланс между классическим геймплеем и современными механиками. ${version} — это золотая середина для тех, кто ценит проверенный временем контент.</p>
            
            <h3>Какой рейт выбрать на ${version}?</h3>
            <ul>
                <li><strong>x1-x5</strong> — для хардкорных игроков, ценящих долгую прокачку и экономику</li>
                <li><strong>x10-x30</strong> — оптимальный баланс между временем на прокачку и удовольствием от игры</li>
                <li><strong>x50-x100</strong> — для любителей активного PvP без долгой подготовки</li>
                <li><strong>x200-x1000</strong> — для тех, кто хочет сразу окунуться в массовые сражения</li>
            </ul>
            
            <h3>Лучшие классы на ${version} для разных задач</h3>
            <p><strong>Для фарма:</strong> Spoiler, Warlord, Destroyer, Phantom Summoner.<br>
            <strong>Для PvP:</strong> Hawkeye, Spellhowler, Treasure Hunter, Gladiator.<br>
            <strong>Для осад:</strong> Paladin, Bishop, Warlock, Phantom Ranger.<br>
            <strong>Для новичков:</strong> Silver Ranger, Prophet, Bishop, Warlord.</p>
            
            <h3>Как выбрать надежный сервер ${version}?</h3>
            <p>При выборе сервера обращайте внимание на рейтинг (${serverCount}+ серверов в нашем каталоге), количество отзывов реальных игроков, дату открытия и рейты. Свежие проекты часто предлагают лучшие условия для старта, а топовые серверы гарантируют стабильность и большое онлайн-сообщество.</p>
            
            <p><a href="/all-servers">Смотреть все серверы ${version} →</a></p>
        </div>
    `;
}

// Structured Data для BreadcrumbList
function generateBreadcrumbSchema(items) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": `https://zerokulasite.ru${item.url}`
        }))
    };
}

// Structured Data для Product (сервер)
function generateProductSchema(server) {
    return {
        "@context": "https://schema.org",
        "@type": "VideoGame",
        "name": server.name,
        "url": server.website,
        "description": server.description || `${server.name} — сервер Lineage 2`,
        "gamePlatform": server.version || "Interlude",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": server.rating?.average || 0,
            "reviewCount": server.rating?.count || 0,
            "bestRating": "5",
            "worstRating": "1"
        },
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "RUB",
            "availability": "https://schema.org/OnlineOnly"
        }
    };
}

// Structured Data для ItemList
function generateItemListSchema(servers, title, description) {
    return {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": title,
        "description": description,
        "numberOfItems": servers.length,
        "itemListElement": servers.slice(0, 20).map((server, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "url": `https://zerokulasite.ru/server/${server.slug || server._id}`,
            "name": server.name,
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": server.rating?.average || 0,
                "reviewCount": server.rating?.count || 0
            }
        }))
    };
}

// Open Graph теги (Пункт 7)
function generateOpenGraphTags(page) {
    const baseUrl = `https://zerokulasite.ru`;
    
    return `
        <meta property="og:type" content="${page.type || 'website'}">
        <meta property="og:url" content="${baseUrl}${page.url}">
        <meta property="og:title" content="${escapeHtml(page.title)}">
        <meta property="og:description" content="${escapeHtml(page.description)}">
        <meta property="og:image" content="${baseUrl}${page.image || '/og-image.jpg'}">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta property="og:locale" content="ru_RU">
        <meta property="og:site_name" content="База серверов Lineage 2">
        
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${escapeHtml(page.title)}">
        <meta name="twitter:description" content="${escapeHtml(page.description)}">
        <meta name="twitter:image" content="${baseUrl}${page.image || '/og-image.jpg'}">
        
        <meta name="telegram:title" content="${escapeHtml(page.title)}">
        <meta name="telegram:description" content="${escapeHtml(page.description)}">
        <meta name="telegram:image" content="${baseUrl}${page.image || '/og-image.jpg'}">
        
        <meta name="vk:title" content="${escapeHtml(page.title)}">
        <meta name="vk:description" content="${escapeHtml(page.description)}">
        <meta name="vk:image" content="${baseUrl}${page.image || '/og-image.jpg'}">
    `;
}

module.exports = {
    escapeHtml,
    generateServerH1,
    generateServerH2,
    generateVersionH1,
    generateVersionH2,
    generateServerMetaDescription,
    generateServerMetaKeywords,
    generateSeoText,
    generateBreadcrumbSchema,
    generateProductSchema,
    generateItemListSchema,
    generateOpenGraphTags,
    lsiKeywords
};