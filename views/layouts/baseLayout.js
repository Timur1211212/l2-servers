// views/layouts/baseLayout.js
const { escapeHtml } = require('../../utils/htmlHelpers');
const { renderHeader } = require('../components/header');
const { renderFooter } = require('../components/footer');
const { generateOpenGraphTags } = require('../../utils/seoHelpers');

function baseLayout({ 
    title, 
    description, 
    keywords = '', 
    canonical, 
    breadcrumbs = '', 
    content, 
    schema = null,
    ogImage = '/og-image.jpg',
    ogType = 'website',
    noIndex = false,
    additionalStyles = '',
    additionalScripts = ''
}) {
    const schemaTags = schema ? `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>` : '';
    
    return `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    ${keywords ? `<meta name="keywords" content="${escapeHtml(keywords)}">` : ''}
    ${noIndex ? '<meta name="robots" content="noindex, nofollow">' : '<meta name="robots" content="index, follow, max-image-preview:large">'}
    <link rel="canonical" href="https://zerokulasite.ru${canonical}">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="stylesheet" href="/css/style.css">
    ${generateOpenGraphTags({
        type: ogType,
        url: canonical,
        title,
        description,
        image: ogImage
    })}
    ${schemaTags}
    ${additionalStyles}
</head>
<body>
    ${renderHeader()}
    
    <main class="main-content">
        <div class="container">
            ${breadcrumbs}
            ${content}
        </div>
    </main>
    
    ${renderFooter()}
    
    <button id="backToTop" class="back-to-top" aria-label="Наверх">↑</button>
    
    <script src="/js/main.js" defer></script>
    ${additionalScripts}
</body>
</html>`;
}

module.exports = { baseLayout };