// views/components/footer.js

function renderFooter() {
    return `
        <footer class="main-footer">
            <div class="container">
                <div class="footer-content">
                    <div class="footer-logo">
                        <span class="logo-icon">🏰</span>
                        <span class="logo-text">База серверов Lineage 2</span>
                    </div>
                    
                    <div class="footer-description">
                        Самая полная база серверов Lineage 2 с актуальной информацией, 
                        рейтингами и отзывами игроков. Ежедневное обновление данных.
                    </div>
                    
                    <div class="footer-links">
                        <div class="footer-links-column">
                            <h4>Основные разделы</h4>
                            <a href="/">Главная</a>
                            <a href="/top-servers">🏆 Топ серверы</a>
                            <a href="/new-servers">🆕 Новые серверы</a>
                            <a href="/all-servers">📋 Все серверы</a>
                            <a href="/vip-servers">⭐ VIP серверы</a>
                            <a href="/pvp-servers">⚔️ PvP серверы</a>
                        </div>
                        
                        <div class="footer-links-column">
                            <h4>Версии</h4>
                            <a href="/version/interlude">Interlude серверы</a>
                            <a href="/version/high-five">High Five серверы</a>
                            <a href="/version/classic">Classic серверы</a>
                            <a href="/version/essence">Essence серверы</a>
                        </div>
                        
                        <div class="footer-links-column">
                            <h4>Популярные серверы</h4>
                            <a href="/servers/scryde">Scryde L2</a>
                            <a href="/servers/main">Main L2</a>
                            <a href="/servers/lu4">LU4 L2</a>
                            <a href="/servers/asterios">Asterios L2</a>
                            <a href="/servers/eglobal">Eglobal L2</a>
                            <a href="/servers/legacy">Legacy L2</a>
                        </div>
                        
                        <div class="footer-links-column">
                            <h4>Информация</h4>
                            <a href="/about">О проекте</a>
                            <a href="/contacts">Контакты</a>
                            <a href="/download">📥 Скачать клиент</a>
                            <a href="/privacy">Политика конфиденциальности</a>
                            <a href="/terms">Пользовательское соглашение</a>
                            <a href="/disclaimer">Отказ от ответственности</a>
                            <a href="/dmca">DMCA</a>
                            <a href="/cookies">Политика cookies</a>
                        </div>
                    </div>
                    
                    <div class="copyright">
                        <p>© 2026 База серверов Lineage 2. Все права защищены.</p>
                        <p>Lineage 2 является зарегистрированной торговой маркой NCSoft Corporation.</p>
                        <p>Данный сайт не является официальным проектом и не связан с NCSoft.</p>
                    </div>
                </div>
            </div>
        </footer>
    `;
}

module.exports = { renderFooter };