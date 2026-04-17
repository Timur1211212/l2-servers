// views/components/header.js
function renderHeader() {
    return `
        <header class="main-header">
            <div class="container">
                <div class="header-inner">
                    <a href="/" class="logo">
                        <span class="logo-icon">🏰</span>
                        <span class="logo-text">База серверов Lineage 2</span>
                    </a>
                    <nav class="main-nav">
                        <a href="/" class="nav-link active">🏠 Главная</a>
                        <a href="/top-servers" class="nav-link">🏆 Топ</a>
                        <a href="/new-servers" class="nav-link">🆕 Новые</a>
                        <a href="/all-servers" class="nav-link">📋 Все</a>
                        <a href="/vip-servers" class="nav-link">⭐ VIP</a>
                        <a href="/pvp-servers" class="nav-link">⚔️ PvP</a>
                        <a href="/download" class="nav-link">📥 Скачать</a>
                        <a href="/contacts" class="nav-link">📞 Контакты</a>
                    </nav>
                </div>
            </div>
        </header>
    `;
}

function renderFooter() {
    return `
        <footer class="main-footer">
            <div class="container">
                <div class="footer-content">
                    <div class="footer-logo">🏰 База серверов Lineage 2</div>
                    <div class="footer-description">
                        Самая полная база серверов Lineage 2 с актуальной информацией, 
                        рейтингами и отзывами игроков. Ежедневное обновление данных.
                    </div>
                    <div class="footer-links">
                        <a href="/about">О проекте</a>
                        <a href="/top-servers">🏆 Топ серверы</a>
                        <a href="/new-servers">🆕 Новые серверы</a>
                        <a href="/all-servers">📋 Все серверы</a>
                        <a href="/vip-servers">⭐ VIP серверы</a>
                        <a href="/pvp-servers">⚔️ PvP серверы</a>
                        <a href="/download">📥 Скачать клиент</a>
                        <a href="/privacy">Политика конфиденциальности</a>
                        <a href="/terms">Пользовательское соглашение</a>
                        <a href="/disclaimer">Отказ от ответственности</a>
                        <a href="/dmca">DMCA</a>
                        <a href="/cookies">Политика cookies</a>
                        <a href="/contacts">Контакты</a>
                    </div>
                    <div class="copyright">
                        © 2026 База серверов Lineage 2. Все права защищены.<br>
                        Lineage 2 является зарегистрированной торговой маркой NCSoft Corporation.
                    </div>
                </div>
            </div>
        </footer>
    `;
}

module.exports = { renderHeader, renderFooter };