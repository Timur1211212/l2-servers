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
        
        // Проверяем, существует ли уже изображение (не старше 7 дней)
        if (fs.existsSync(filepath)) {
            const stats = fs.statSync(filepath);
            const daysOld = (Date.now() - stats.mtime) / (1000 * 60 * 60 * 24);
            if (daysOld < 7) return `/images/og/${filename}`;
        }
        
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
        ctx.fillText(server.version || 'Interlude', canvas.width / 2, 300);
        
        // Рейтинг
        const rating = server.rating?.average || 0;
        const reviewCount = server.rating?.count || 0;
        ctx.fillStyle = '#ffd700';
        ctx.font = '42px "Segoe UI", Arial, sans-serif';
        ctx.fillText(`⭐ ${rating.toFixed(1)}/5 (${reviewCount} отзывов)`, canvas.width / 2, 400);
        
        // Рейты
        const rates = [];
        if (server.exp) rates.push(`Exp ${server.exp}`);
        if (server.drop) rates.push(`Drop ${server.drop}`);
        if (server.adena) rates.push(`Adena ${server.adena}`);
        
        ctx.fillStyle = '#94a3b8';
        ctx.font = '28px "Segoe UI", Arial, sans-serif';
        ctx.fillText(rates.join(' · ') || 'Лучший выбор для игры', canvas.width / 2, 500);
        
        // URL
        ctx.font = '24px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#64748b';
        ctx.fillText('zerokulasite.ru', canvas.width / 2, canvas.height - 60);
        
        // Сохраняем
        const buffer = canvas.toBuffer('image/jpeg', { quality: 0.85 });
        fs.writeFileSync(filepath, buffer);
        
        return `/images/og/${filename}`;
    }
    
    async generateVersionImage(version) {
        const filename = `version-${version.toLowerCase().replace(/[^a-z0-9-]/g, '-')}.jpg`;
        const filepath = path.join(this.outputDir, filename);
        
        if (fs.existsSync(filepath)) return `/images/og/${filename}`;
        
        const canvas = createCanvas(config.OG_IMAGE_WIDTH, config.OG_IMAGE_HEIGHT);
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#0f172a');
        gradient.addColorStop(1, '#1e293b');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#00b894';
        ctx.font = `bold 64px "Segoe UI", Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(`Lineage 2 ${version}`, canvas.width / 2, canvas.height / 2 - 40);
        
        ctx.fillStyle = '#94a3b8';
        ctx.font = '36px "Segoe UI", Arial, sans-serif';
        ctx.fillText('Серверы и рейтинг 2026', canvas.width / 2, canvas.height / 2 + 60);
        
        const buffer = canvas.toBuffer('image/jpeg', { quality: 0.85 });
        fs.writeFileSync(filepath, buffer);
        
        return `/images/og/${filename}`;
    }
}

module.exports = new OgImageService();