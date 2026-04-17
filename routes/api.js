// routes/api.js
const express = require('express');
const router = express.Router();
const serverController = require('../controllers/serverController');
const reviewController = require('../controllers/reviewController');
const dmcaController = require('../controllers/dmcaController');
const authController = require('../controllers/authController');
const { apiLimiter, reviewLimiter } = require('../middleware/rateLimit');
const { uploadLogo } = require('../middleware/upload');

// =============== Публичные API ===============

// Серверы
router.get('/servers', apiLimiter, serverController.getAll);
router.get('/servers/:serverId/reviews', reviewController.getByServer);

// Отзывы
router.post('/servers/:serverId/reviews', reviewLimiter, reviewController.create);
router.post('/reviews/:reviewId/helpful', reviewController.markHelpful);

// DMCA
router.post('/dmca/submit', dmcaController.submit);

// Теги и категории (публичные)
router.get('/tags', serverController.getTags);
router.get('/servers/tag/:tag', serverController.getByTag);
router.get('/servers/category/:category', serverController.getByCategory);

// Статистика
router.get('/stats/servers', async (req, res) => {
    try {
        const Server = require('../models/Server');
        const total = await Server.countDocuments({ active: true });
        res.json({ totalServers: total });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// =============== Админ API (требуют авторизации) ===============

// Аутентификация
router.post('/admin/login', authController.login);
router.get('/admin/check-auth', authController.checkAuth);
router.post('/logout', authController.logout);

// CRUD серверов (только для админов)
router.get('/admin/servers', authController.requireAuth, serverController.getAllAdmin);
router.get('/admin/servers/:id', authController.requireAuth, serverController.getOne);
router.post('/servers', authController.requireAuth, uploadLogo, serverController.create);
router.put('/servers/:id', authController.requireAuth, uploadLogo, serverController.update);
router.delete('/servers/:id', authController.requireAuth, serverController.deleteServer);

// Управление отзывами
router.get('/admin/reviews', authController.requireAuth, reviewController.getAllAdmin);
router.put('/admin/reviews/:id', authController.requireAuth, reviewController.updateStatus);
router.delete('/admin/reviews/:id', authController.requireAuth, reviewController.deleteReview);

// Управление DMCA жалобами
router.get('/admin/dmca', authController.requireAuth, dmcaController.getAll);
router.get('/admin/dmca/:id', authController.requireAuth, dmcaController.getOne);
router.put('/admin/dmca/:id', authController.requireAuth, dmcaController.update);
router.delete('/admin/dmca/:id', authController.requireAuth, dmcaController.deleteComplaint);

// routes/api.js (добавить в конец файла, перед module.exports)

// =============== ПОИСК ПО ТЕГАМ И КАТЕГОРИЯМ ===============
router.get('/search', async (req, res) => {
    try {
        const { q, tag, category, version, status, minRating } = req.query;
        let filter = { active: true };
        
        if (q) {
            filter.$or = [
                { name: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { tags: { $in: [new RegExp(q, 'i')] } }
            ];
        }
        
        if (tag) {
            filter.tags = { $in: [tag] };
        }
        
        if (category) {
            filter.categories = { $in: [category] };
        }
        
        if (version) {
            filter.version = { $regex: version, $options: 'i' };
        }
        
        if (status && status !== 'all') {
            filter.status = status;
        }
        
        if (minRating) {
            filter['rating.average'] = { $gte: parseFloat(minRating) };
        }
        
        const servers = await Server.find(filter)
            .sort({ 'rating.average': -1 })
            .limit(50)
            .lean();
            
        res.json({ success: true, servers, count: servers.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/tags/popular', async (req, res) => {
    try {
        const tags = await Server.aggregate([
            { $match: { active: true } },
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 }
        ]);
        res.json({ success: true, tags });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;