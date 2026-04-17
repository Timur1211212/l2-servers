// controllers/reviewController.js
const Review = require('../models/Review');
const Server = require('../models/Server');
const { updateServerRating } = require('../services/ratingService');
const cacheService = require('../services/cacheService');

async function getByServer(req, res) {
    try {
        const { serverId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;
        
        const [reviews, total] = await Promise.all([
            Review.find({ serverId, status: 'approved' })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Review.countDocuments({ serverId, status: 'approved' })
        ]);
        
        const userIdentifier = req.session.id || req.ip;
        const reviewsWithUserVote = reviews.map(review => ({
            ...review,
            userVotedHelpful: review.helpfulIPs.includes(userIdentifier),
            userVotedNotHelpful: review.notHelpfulIPs.includes(userIdentifier)
        }));
        
        res.json({
            reviews: reviewsWithUserVote,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function create(req, res) {
    try {
        const { serverId } = req.params;
        
        // Валидация
        const { authorName, rating, title, content, pros, cons } = req.body;
        
        if (!authorName || authorName.length < 2 || authorName.length > 50) {
            return res.status(400).json({ error: 'Имя должно быть от 2 до 50 символов' });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Рейтинг должен быть от 1 до 5' });
        }
        if (!title || title.length < 3 || title.length > 100) {
            return res.status(400).json({ error: 'Заголовок должен быть от 3 до 100 символов' });
        }
        if (!content || content.length < 10 || content.length > 1520) {
            return res.status(400).json({ error: 'Текст отзыва должен быть от 10 до 1520 символов' });
        }
        
        const review = await Review.create({
            ...req.body,
            serverId,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });
        
        await updateServerRating(serverId);
        
        // Инвалидируем кэш страницы сервера
        const server = await Server.findById(serverId);
        if (server && server.slug) {
            cacheService.delete(`page:/server/${server.slug}`);
        }
        
        res.json({ success: true, review });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function markHelpful(req, res) {
    try {
        const { reviewId } = req.params;
        const { helpful } = req.body;
        const userIdentifier = req.session.id || req.ip;
        
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ error: 'Отзыв не найден' });
        }
        
        const alreadyVotedHelpful = review.helpfulIPs.includes(userIdentifier);
        const alreadyVotedNotHelpful = review.notHelpfulIPs.includes(userIdentifier);
        
        if (helpful) {
            if (alreadyVotedHelpful) {
                review.helpful = Math.max(0, review.helpful - 1);
                review.helpfulIPs = review.helpfulIPs.filter(ip => ip !== userIdentifier);
                await review.save();
                return res.json({ 
                    success: true, 
                    helpful: review.helpful, 
                    notHelpful: review.notHelpful,
                    userVoted: null
                });
            }
            if (alreadyVotedNotHelpful) {
                review.notHelpful = Math.max(0, review.notHelpful - 1);
                review.notHelpfulIPs = review.notHelpfulIPs.filter(ip => ip !== userIdentifier);
            }
            review.helpful += 1;
            review.helpfulIPs.push(userIdentifier);
        } else {
            if (alreadyVotedNotHelpful) {
                review.notHelpful = Math.max(0, review.notHelpful - 1);
                review.notHelpfulIPs = review.notHelpfulIPs.filter(ip => ip !== userIdentifier);
                await review.save();
                return res.json({ 
                    success: true, 
                    helpful: review.helpful, 
                    notHelpful: review.notHelpful,
                    userVoted: null
                });
            }
            if (alreadyVotedHelpful) {
                review.helpful = Math.max(0, review.helpful - 1);
                review.helpfulIPs = review.helpfulIPs.filter(ip => ip !== userIdentifier);
            }
            review.notHelpful += 1;
            review.notHelpfulIPs.push(userIdentifier);
        }
        
        await review.save();
        res.json({ 
            success: true, 
            helpful: review.helpful, 
            notHelpful: review.notHelpful,
            userVoted: helpful ? 'helpful' : 'notHelpful'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getAllAdmin(req, res) {
    try {
        const { status } = req.query;
        const query = {};
        if (status && status !== 'all') query.status = status;
        
        const reviews = await Review.find(query)
            .populate('serverId', 'name')
            .sort({ createdAt: -1 })
            .lean();
        res.json({ reviews });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function updateStatus(req, res) {
    try {
        const { id } = req.params;
        const { status, moderationNotes } = req.body;
        
        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }
        
        const oldStatus = review.status;
        await Review.findByIdAndUpdate(id, { 
            status, 
            moderationNotes,
            moderatedBy: req.session.user.id
        });
        
        if (oldStatus !== status) {
            await updateServerRating(review.serverId);
            
            // Инвалидируем кэш
            const server = await Server.findById(review.serverId);
            if (server && server.slug) {
                cacheService.delete(`page:/server/${server.slug}`);
            }
        }
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function deleteReview(req, res) {
    try {
        const { id } = req.params;
        const review = await Review.findById(id);
        
        if (!review) {
            return res.status(404).json({ error: 'Review not found' });
        }
        
        const serverId = review.serverId;
        await Review.findByIdAndDelete(id);
        await updateServerRating(serverId);
        
        // Инвалидируем кэш
        const server = await Server.findById(serverId);
        if (server && server.slug) {
            cacheService.delete(`page:/server/${server.slug}`);
        }
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { getByServer, create, markHelpful, getAllAdmin, updateStatus, deleteReview };