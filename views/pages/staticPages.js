// views/pages/staticPages.js
const { baseLayout } = require('../layouts/baseLayout');
const { renderBreadcrumbs } = require('../components/breadcrumbs');

function generateStaticPage(title, description, content, canonical, breadcrumbName) {
    const breadcrumbs = renderBreadcrumbs([
        { name: 'Главная', url: '/' },
        { name: breadcrumbName, url: canonical }
    ]);
    
    return baseLayout({
        title: `${title} | База серверов Lineage 2`,
        description,
        canonical,
        breadcrumbs,
        content,
        noIndex: false
    });
}

function generateAboutPage() {
    const content = `
        <div class="static-page">
            <h1>📖 О проекте</h1>
            <p><strong>База серверов Lineage 2</strong> — это крупнейший русскоязычный каталог частных серверов L2. Мы создали этот проект, чтобы помочь игрокам найти идеальный сервер для комфортной игры.</p>
            
            <h2>🎯 Миссия проекта</h2>
            <p>Наша миссия — предоставлять актуальную, достоверную и полную информацию о серверах Lineage 2. Мы ежедневно обновляем данные, проверяем доступность серверов и собираем отзывы игроков.</p>
            
            <h2>📊 Как мы собираем информацию?</h2>
            <ul>
                <li>Анализ открытых источников и форумов</li>
                <li>Данные от владельцев серверов</li>
                <li>Отзывы и рейтинги игроков</li>
                <li>Регулярная проверка доступности серверов</li>
            </ul>
            
            <h2>🤝 Сотрудничество</h2>
            <p>Если вы владелец сервера и хотите добавить свой проект в каталог, свяжитесь с нами через <a href="/contacts">контакты</a>.</p>
        </div>
    `;
    
    return generateStaticPage(
        'О проекте',
        'Информация о проекте База серверов Lineage 2. Как мы собираем информацию, миссия проекта, история создания.',
        content,
        '/about',
        'О проекте'
    );
}

function generateContactsPage() {
    const content = `
        <div class="static-page">
            <h1>📞 Контакты</h1>
            
            <div class="contact-grid">
                <div class="contact-card">
                    <div class="contact-icon">📱</div>
                    <h3>Telegram</h3>
                    <p>Основной способ связи. Быстрые ответы, обсуждение вопросов по серверам.</p>
                    <a href="https://t.me/ZerokulL2" target="_blank" class="contact-link">📲 Написать в Telegram</a>
                </div>
                
                <div class="contact-card">
                    <div class="contact-icon">📧</div>
                    <h3>Электронная почта</h3>
                    <p>Для официальных запросов, DMCA жалоб и бизнес-предложений.</p>
                    <a href="mailto:Zerokulchik@yandex.ru" class="contact-link">📨 Написать на почту</a>
                </div>
                
                <div class="contact-card">
                    <div class="contact-icon">🎮</div>
                    <h3>Добавить сервер</h3>
                    <p>Хотите добавить свой сервер в нашу базу? Оставьте заявку.</p>
                    <button class="contact-link" onclick="alert('Свяжитесь с нами в Telegram или по почте')">➕ Добавить сервер</button>
                </div>
            </div>
            
            <div class="response-time">
                <h3>⏱️ Время ответа</h3>
                <ul>
                    <li><strong>Telegram:</strong> В течение 1-12 часов</li>
                    <li><strong>Электронная почта:</strong> В течение 24-48 часов</li>
                    <li><strong>DMCA жалобы:</strong> В течение 48 часов</li>
                </ul>
            </div>
        </div>
    `;
    
    return generateStaticPage(
        'Контакты',
        'Свяжитесь с администрацией Базы серверов Lineage 2. Telegram, email, форма для добавления сервера.',
        content,
        '/contacts',
        'Контакты'
    );
}

function generateDownloadPage() {
    const content = `
        <div class="static-page">
            <h1>📥 Скачать Lineage 2</h1>
            <p>Чистые клиенты для всех популярных версий Lineage 2. Скачайте клиент и начните играть на любом сервере из нашего каталога.</p>
            
            <div class="clients-grid">
                <div class="client-card">
                    <div class="client-icon">⚔️</div>
                    <h2>Interlude</h2>
                    <p>Классическая версия Lineage 2. Размер: ~4GB</p>
                    <a href="#" class="download-link" onclick="alert('Скачивание клиента Interlude')">Скачать Interlude →</a>
                </div>
                
                <div class="client-card">
                    <div class="client-icon">🎨</div>
                    <h2>High Five</h2>
                    <p>Улучшенная графика и геймплей. Размер: ~5GB</p>
                    <a href="#" class="download-link" onclick="alert('Скачивание клиента High Five')">Скачать High Five →</a>
                </div>
                
                <div class="client-card">
                    <div class="client-icon">🏛️</div>
                    <h2>Classic</h2>
                    <p>Возвращение к истокам. Размер: ~4.5GB</p>
                    <a href="#" class="download-link" onclick="alert('Скачивание клиента Classic')">Скачать Classic →</a>
                </div>
                
                <div class="client-card">
                    <div class="client-icon">🚀</div>
                    <h2>Essence</h2>
                    <p>Быстрая прокачка. Размер: ~3.5GB</p>
                    <a href="#" class="download-link" onclick="alert('Скачивание клиента Essence')">Скачать Essence →</a>
                </div>
            </div>
            
            <div class="install-instructions">
                <h2>📖 Инструкция по установке</h2>
                <ol>
                    <li>Скачайте клиент нужной версии</li>
                    <li>Распакуйте архив в любую папку</li>
                    <li>Скачайте патч с сайта выбранного сервера</li>
                    <li>Скопируйте файлы патча в папку с игрой</li>
                    <li>Запустите L2.exe и начинайте играть!</li>
                </ol>
            </div>
        </div>
    `;
    
    return generateStaticPage(
        'Скачать Lineage 2 — клиенты Interlude, High Five, Classic, Essence',
        'Скачать Lineage 2 бесплатно. Чистые клиенты для всех версий: Interlude, High Five, Classic, Essence.',
        content,
        '/download',
        'Скачать клиент'
    );
}

function generatePrivacyPage() {
    const content = `
        <div class="static-page legal-page">
            <h1>🔒 Политика конфиденциальности</h1>
            <p>Дата последнего обновления: 06 апреля 2026 г.</p>
            
            <h2>1. Общие положения</h2>
            <p>Настоящая Политика конфиденциальности действует в отношении всей информации, которую сайт может получить о Пользователе.</p>
            
            <h2>2. Персональная информация</h2>
            <p>При посещении сайта автоматически собирается: IP-адрес, тип браузера, операционная система, время обращения.</p>
            
            <h2>3. Файлы cookie</h2>
            <p>Мы используем необходимые, аналитические (Яндекс.Метрика) и функциональные cookie.</p>
            
            <h2>4. Контакты</h2>
            <p>По вопросам конфиденциальности: Zerokulchik@yandex.ru</p>
        </div>
    `;
    
    return generateStaticPage(
        'Политика конфиденциальности',
        'Политика конфиденциальности сайта База серверов Lineage 2.',
        content,
        '/privacy',
        'Политика конфиденциальности'
    );
}

module.exports = {
    generateAboutPage,
    generateContactsPage,
    generateDownloadPage,
    generatePrivacyPage,
    generateStaticPage
};