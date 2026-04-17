// controllers/serverController.js
const Server = require('../models/Server');
const Review = require('../models/Review');
const { generateUniqueSlug } = require('../services/slugService');
const { updateServerRating } = require('../services/ratingService');
const cacheService = require('../services/cacheService');

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
        const server = await Server.create({ ...req.body, slug });
        
        // Инвалидируем кэш списков
        cacheService.deletePattern('page:/version/');
        cacheService.deletePattern('page:/top-servers');
        cacheService.deletePattern('page:/new-servers');
        
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
        
        const server = await Server.findByIdAndUpdate(
            req.params.id, 
            updateData, 
            { new: true }
        );
        
        // Инвалидируем кэш
        cacheService.delete(`page:/server/${server.slug}`);
        cacheService.deletePattern('page:/version/');
        
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
        
        // Soft delete
        await Server.findByIdAndUpdate(req.params.id, { 
            deletedAt: new Date(),
            active: false
        });
        
        // Удаляем связанные отзывы
        await Review.updateMany(
            { serverId: req.params.id },
            { status: 'rejected' }
        );
        
        // Инвалидируем кэш
        cacheService.delete(`page:/server/${server.slug}`);
        cacheService.deletePattern('page:/version/');
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { getAll, getAllAdmin, getOne, create, update, deleteServer };