// controllers/serverController.js
const Server = require('../models/Server');
const Review = require('../models/Review');
const { generateUniqueSlug } = require('../services/slugService');
const { updateServerRating } = require('../services/ratingService');
const cacheService = require('../services/cacheService');
const path = require('path');
const fs = require('fs');

// Удаление старого логотипа
function deleteOldLogo(logoPath) {
    if (logoPath && logoPath !== '/images/logos/default.png') {
        const fullPath = path.join(__dirname, '../public', logoPath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    }
}

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
        
        let logoUrl = '';
        if (req.file) {
            logoUrl = `/images/logos/${req.file.filename}`;
        }
        
        // Безопасная обработка тегов
        let tags = [];
        if (req.body.tags) {
            tags = typeof req.body.tags === 'string' 
                ? req.body.tags.split(',').map(t => t.trim()).filter(t => t && t.length > 0)
                : Array.isArray(req.body.tags) ? req.body.tags : [];
        }
        
        // Безопасная обработка категорий
        let categories = [];
        if (req.body.categories) {
            categories = typeof req.body.categories === 'string'
                ? req.body.categories.split(',').map(c => c.trim()).filter(c => c && c.length > 0)
                : Array.isArray(req.body.categories) ? req.body.categories : [];
        }
        
        const server = await Server.create({ 
            name: req.body.name,
            website: req.body.website,
            version: req.body.version || 'Interlude',
            openingDate: req.body.openingDate || null,
            status: req.body.status || 'Не VIP, но тоже неплохой сервер',
            exp: req.body.exp || '',
            adena: req.body.adena || '',
            drop: req.body.drop || '',
            spoil: req.body.spoil || '',
            spoilChance: req.body.spoilChance || '',
            sealstone: req.body.sealstone || '',
            raidBossExp: req.body.raidBossExp || '',
            raidBossDrop: req.body.raidBossDrop || '',
            epicRaidBossDrop: req.body.epicRaidBossDrop || '',
            questAdena: req.body.questAdena || '',
            quest: req.body.quest || '',
            questExp: req.body.questExp || '',
            description: req.body.description || '',
            slug,
            logo: logoUrl,
            tags,
            categories
        });
        
        // Инвалидируем кэш
        cacheService.invalidateCache('/version/');
        cacheService.invalidateCache('/top-servers');
        cacheService.invalidateCache('/new-servers');
        
        res.json({ success: true, server });
    } catch (err) {
        console.error('Create server error:', err);
        res.status(500).json({ error: err.message });
    }
}

async function update(req, res) {
    try {
        const updateData = { ...req.body };
        
        if (req.body.name) {
            updateData.slug = await generateUniqueSlug(req.body.name, req.params.id);
        }
        
        if (req.file) {
            const oldServer = await Server.findById(req.params.id);
            if (oldServer && oldServer.logo) {
                deleteOldLogo(oldServer.logo);
            }
            updateData.logo = `/images/logos/${req.file.filename}`;
        }
        
        // Безопасная обработка тегов
        if (req.body.tags !== undefined) {
            updateData.tags = typeof req.body.tags === 'string'
                ? req.body.tags.split(',').map(t => t.trim()).filter(t => t && t.length > 0)
                : Array.isArray(req.body.tags) ? req.body.tags : [];
        }
        
        // Безопасная обработка категорий
        if (req.body.categories !== undefined) {
            updateData.categories = typeof req.body.categories === 'string'
                ? req.body.categories.split(',').map(c => c.trim()).filter(c => c && c.length > 0)
                : Array.isArray(req.body.categories) ? req.body.categories : [];
        }
        
        const server = await Server.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true }
        );
        
        if (server && server.slug) {
            cacheService.invalidateServerCache(server.slug);
        }
        
        res.json({ success: true, server });
    } catch (err) {
        console.error('Update server error:', err);
        res.status(500).json({ error: err.message });
    }
}

async function deleteServer(req, res) {
    try {
        const server = await Server.findById(req.params.id);
        if (!server) {
            return res.status(404).json({ error: 'Server not found' });
        }
        
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
        
        if (server.slug) {
            cacheService.invalidateServerCache(server.slug);
        }
        
        res.json({ success: true });
    } catch (err) {
        console.error('Delete server error:', err);
        res.status(500).json({ error: err.message });
    }
}

async function getTags(req, res) {
    try {
        const tags = await Server.distinct('tags', { active: true });
        res.json({ tags: tags.filter(t => t && t.length > 0) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

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