// views/components/header.js
const { renderPopularSearches } = require('./popularSearches');

function renderHeader() {
    return `
        <header class="main-header">
            <div class="container">
                <div class="header-inner">
                    <a href="/" class="logo">
                        <span class="logo-icon">🏰</span>
                        <span class="logo-text">База серверов Lineage 2</span>
                    </a>
                    
                    <button class="mobile-menu-toggle" aria-label="Меню">
                        <span></span><span></span><span></span>
                    </button>
                    
                    <nav class="main-nav">
                        <a href="/" class="nav-link">🏠 Главная</a>
                        <a href="/top-servers" class="nav-link">🏆 Топ</a>
                        <a href="/new-servers" class="nav-link">🆕 Новые</a>
                        <a href="/all-servers" class="nav-link">📋 Все</a>
                        <a href="/vip-servers" class="nav-link">⭐ VIP</a>
                        <a href="/pvp-servers" class="nav-link">⚔️ PvP</a>
                        <a href="/download" class="nav-link">📥 Скачать</a>
                        
                        <div class="nav-dropdown">
                            <button class="dropdown-toggle">Версии ▼</button>
                            <div class="dropdown-menu">
                                <a href="/version/interlude">Interlude</a>
                                <a href="/version/high-five">High Five</a>
                                <a href="/version/classic">Classic</a>
                                <a href="/version/essence">Essence</a>
                            </div>
                        </div>
                    </nav>
                </div>
            </div>
        </header>
        ${renderPopularSearches()}
    `;
}

module.exports = { renderHeader };