// views/components/breadcrumbs.js
const { escapeHtml } = require('../../utils/htmlHelpers');

function renderBreadcrumbs(items) {
    if (!items || items.length === 0) return '';
    
    const itemsHtml = items.map((item, index) => {
        const isLast = index === items.length - 1;
        if (isLast) {
            return `<li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
                        <span itemprop="name">${escapeHtml(item.name)}</span>
                        <meta itemprop="position" content="${index + 1}">
                    </li>`;
        }
        return `<li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
                    <a href="${escapeHtml(item.url)}" itemprop="item">
                        <span itemprop="name">${escapeHtml(item.name)}</span>
                    </a>
                    <meta itemprop="position" content="${index + 1}">
                </li>`;
    }).join('');
    
    return `
        <nav class="breadcrumbs" aria-label="Навигация">
            <ol class="breadcrumb-list" itemscope itemtype="https://schema.org/BreadcrumbList">
                ${itemsHtml}
            </ol>
        </nav>
    `;
}

module.exports = { renderBreadcrumbs };