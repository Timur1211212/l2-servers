// services/ogImageService.js
const fs = require('fs');
const path = require('path');
const { createCanvas, registerFont } = require('canvas');
const config = require('../config');

class OgImageService {
    constructor() {
        this.outputDir = path.join(__dirname, '../public/images/og');
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }
    
    async generateServerImage(server) {
        const filename = `${server.slug || server._id}.jpg`;
        const filepath = path.join(this.outputDir, filename);
        const publicPath = `/images/og/${filename}`;
        
        // Проверяем, существует ли уже изображение (не старше 7 дней)
        if (fs.existsSync(filepath)) {
            const stats = fs.statSync(filepath);
            const daysOld = (Date.now() - stats.mtime) / (1000 * 60 * 60 * 24);
            if (daysOld < 7) return publicPath;
        }
        
        try {
            const canvas = createCanvas(config.OG_IMAGE_WIDTH, config.OG_IMAGE_HEIGHT);
            const ctx = canvas.getContext('2d');
            
            // Градиентный фон
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#1a1a2e');
            gradient.addColorStop(1, '#16213e');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Декоративная рамка
            ctx.strokeStyle = '#00b894';
            ctx.lineWidth = 8;
            ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
            
            // Логотип/иконка в углу
            ctx.font = '48px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = '#00b894';
            ctx.fillText('🏰', 40, 100);
            
            // Заголовок сервера
            ctx.fillStyle = '#00b894';
            ctx.font = `bold 52px "Segoe UI", Arial, sans-serif`;
            ctx.textAlign = 'center';
            
            let title = server.name;
            if (title.length > 40) title = title.substring(0, 37) + '...';
            ctx.fillText(title, canvas.width / 2, 200);
            
            // Версия
            ctx.fillStyle = '#6c5ce7';
            ctx.font = '36px "Segoe UI", Arial, sans-serif';
            ctx.fillText(server.version || 'Interlude', canvas.width / 2, 290);
            
            // Рейтинг
            const rating = server.rating?.average || 0;
            const reviewCount = server.rating?.count || 0;
            ctx.fillStyle = '#ffd700';
            ctx.font = '42px "Segoe UI", Arial, sans-serif';
            ctx.fillText(`⭐ ${rating.toFixed(1)}/5 (${reviewCount} отзывов)`, canvas.width / 2, 390);
            
            // Рейты
            const rates = [];
            if (server.exp) rates.push(`Exp ${server.exp}`);
            if (server.drop) rates.push(`Drop ${server.drop}`);
            if (server.adena) rates.push(`Adena ${server.adena}`);
            
            ctx.fillStyle = '#94a3b8';
            ctx.font = '28px "Segoe UI", Arial, sans-serif';
            ctx.fillText(rates.join(' · ') || 'Лучший выбор для игры', canvas.width / 2, 480);
            
            // URL
            ctx.font = '24px "Segoe UI", Arial, sans-serif';
            ctx.fillStyle = '#64748b';
            ctx.fillText('zerokulasite.ru', canvas.width / 2, canvas.height - 60);
            
            // Сохраняем
            const buffer = canvas.toBuffer('image/jpeg', { quality: 0.85 });
            fs.writeFileSync(filepath, buffer);
            
            return publicPath;
        } catch (err) {
            console.error('OG image generation error:', err.message);
            return '/og-image.jpg'; // fallback
        }
    }
    
    async generateVersionImage(version) {
        const versionSlug = version.toLowerCase().replace(/[^a-z0-9-]/g, '-');
        const filename = `version-${versionSlug}.jpg`;
        const filepath = path.join(this.outputDir, filename);
        const publicPath = `/images/og/${filename}`;
        
        if (fs.existsSync(filepath)) return publicPath;
        
        try {
            const canvas = createCanvas(config.OG_IMAGE_WIDTH, config.OG_IMAGE_HEIGHT);
            const ctx = canvas.getContext('2d');
            
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#0f172a');
            gradient.addColorStop(1, '#1e293b');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Декоративная рамка
            ctx.strokeStyle = '#00b894';
            ctx.lineWidth = 6;
            ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
            
            ctx.fillStyle = '#00b894';
            ctx.font = `bold 64px "Segoe UI", Arial, sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(`Lineage 2 ${version}`, canvas.width / 2, canvas.height / 2 - 40);
            
            ctx.fillStyle = '#94a3b8';
            ctx.font = '36px "Segoe UI", Arial, sans-serif';
            ctx.fillText('Серверы и рейтинг 2026', canvas.width / 2, canvas.height / 2 + 60);
            
            ctx.fillStyle = '#00b894';
            ctx.font = '28px "Segoe UI", Arial, sans-serif';
            ctx.fillText('zerokulasite.ru', canvas.width / 2, canvas.height - 60);
            
            const buffer = canvas.toBuffer('image/jpeg', { quality: 0.85 });
            fs.writeFileSync(filepath, buffer);
            
            return publicPath;
        } catch (err) {
            console.error('Version OG image generation error:', err.message);
            return '/og-image.jpg';
        }
    }
    
    async generateListImage(pageType, title) {
        const filename = `list-${pageType}.jpg`;
        const filepath = path.join(this.outputDir, filename);
        const publicPath = `/images/og/${filename}`;
        
        if (fs.existsSync(filepath)) return publicPath;
        
        try {
            const canvas = createCanvas(config.OG_IMAGE_WIDTH, config.OG_IMAGE_HEIGHT);
            const ctx = canvas.getContext('2d');
            
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#1a1a2e');
            gradient.addColorStop(1, '#16213e');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = '#ffd700';
            ctx.font = `bold 56px "Segoe UI", Arial, sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(title, canvas.width / 2, canvas.height / 2 - 30);
            
            ctx.fillStyle = '#00b894';
            ctx.font = '32px "Segoe UI", Arial, sans-serif';
            ctx.fillText('База серверов Lineage 2', canvas.width / 2, canvas.height / 2 + 60);
            
            ctx.fillStyle = '#64748b';
            ctx.font = '24px "Segoe UI", Arial, sans-serif';
            ctx.fillText('zerokulasite.ru', canvas.width / 2, canvas.height - 60);
            
            const buffer = canvas.toBuffer('image/jpeg', { quality: 0.85 });
            fs.writeFileSync(filepath, buffer);
            
            return publicPath;
        } catch (err) {
            console.error('List OG image generation error:', err.message);
            return '/og-image.jpg';
        }
    }
}

module.exports = new OgImageService();