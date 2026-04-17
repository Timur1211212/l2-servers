// controllers/serverController.js
const Server = require('../models/Server');
const Review = require('../models/Review');
const { generateUniqueSlug } = require('../services/slugService');
const { updateServerRating } = require('../services/ratingService');
const cacheService = require('../services/cacheService');
const { deleteOldLogo } = require('../middleware/upload');
const path = require('path');

async function getAll(req, res) {
    try {
        const servers = await Server.find({ active: true })
            .sort({ createdAt: -1 })
            .lean();
        res.json(servers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getAllAdmin(req, res) {
    try {
        const servers = await Server.find()
            .sort({ createdAt: -1 })
            .lean();
        res.json(servers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getOne(req, res) {
    try {
        const server = await Server.findById(req.params.id).lean();
        if (!server) {
            return res.status(404).json({ error: 'Server not found' });
        }
        res.json(server);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function create(req, res) {
    try {
        const slug = await generateUniqueSlug(req.body.name);
        
        // Обработка логотипа
        let logoUrl = '';
        if (req.file) {
            logoUrl = `/images/logos/${req.file.filename}`;
        }
        
        // Обработка тегов (преобразуем строку в массив)
        let tags = [];
        if (req.body.tags) {
            tags = typeof req.body.tags === 'string' 
                ? req.body.tags.split(',').map(t => t.trim()).filter(t => t)
                : req.body.tags;
        }
        
        // Обработка категорий
        let categories = [];
        if (req.body.categories) {
            categories = typeof req.body.categories === 'string'
                ? req.body.categories.split(',').map(c => c.trim())
                : req.body.categories;
        }
        
        const server = await Server.create({ 
            ...req.body, 
            slug,
            logo: logoUrl,
            tags,
            categories
        });
        
        cacheService.invalidateCache('page:/version/');
        cacheService.invalidateCache('page:/top-servers');
        
        res.json({ success: true, server });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function update(req, res) {
    try {
        const updateData = { ...req.body };
        
        if (req.body.name) {
            updateData.slug = await generateUniqueSlug(req.body.name, req.params.id);
        }
        
        // Обработка логотипа
        if (req.file) {
            // Удаляем старый логотип
            const oldServer = await Server.findById(req.params.id);
            if (oldServer && oldServer.logo) {
                deleteOldLogo(oldServer.logo);
            }
            updateData.logo = `/images/logos/${req.file.filename}`;
        }
        
        // Обработка тегов
        if (req.body.tags) {
            updateData.tags = typeof req.body.tags === 'string'
                ? req.body.tags.split(',').map(t => t.trim()).filter(t => t)
                : req.body.tags;
        }
        
        // Обработка категорий
        if (req.body.categories) {
            updateData.categories = typeof req.body.categories === 'string'
                ? req.body.categories.split(',').map(c => c.trim())
                : req.body.categories;
        }
        
        const server = await Server.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true }
        );
        
        cacheService.invalidateCache(`page:/server/${server.slug}`);
        cacheService.invalidateCache('page:/version/');
        
        res.json({ success: true, server });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function deleteServer(req, res) {
    try {
        const server = await Server.findById(req.params.id);
        if (!server) {
            return res.status(404).json({ error: 'Server not found' });
        }
        
        // Удаляем логотип
        if (server.logo) {
            deleteOldLogo(server.logo);
        }
        
        await Server.findByIdAndUpdate(req.params.id, { 
            deletedAt: new Date(),
            active: false
        });
        
        await Review.updateMany(
            { serverId: req.params.id },
            { status: 'rejected' }
        );
        
        cacheService.invalidateCache(`page:/server/${server.slug}`);
        cacheService.invalidateCache('page:/version/');
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Получение всех доступных тегов
async function getTags(req, res) {
    try {
        const tags = await Server.distinct('tags', { active: true });
        res.json({ tags: tags.filter(t => t && t.length > 0) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Получение серверов по тегу
async function getByTag(req, res) {
    try {
        const { tag } = req.params;
        const servers = await Server.find({ 
            active: true,
            tags: { $in: [tag] }
        }).sort({ 'rating.average': -1 }).lean();
        res.json(servers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Получение серверов по категории
async function getByCategory(req, res) {
    try {
        const { category } = req.params;
        const servers = await Server.find({ 
            active: true,
            categories: { $in: [category] }
        }).sort({ 'rating.average': -1 }).lean();
        res.json(servers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { 
    getAll, 
    getAllAdmin, 
    getOne, 
    create, 
    update, 
    deleteServer,
    getTags,
    getByTag,
    getByCategory
};