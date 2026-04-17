// services/ratingService.js
const Review = require('../models/Review');
const Server = require('../models/Server');
const cacheService = require('./cacheService');

async function updateServerRating(serverId, session = null) {
    const query = Review.find({ serverId, status: 'approved' });
    if (session) query.session(session);
    
    const reviews = await query;
    
    if (reviews.length === 0) {
        const updateData = {
            'rating.average': 0,
            'rating.count': 0,
            'rating.distribution': { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        };
        
        if (session) {
            await Server.findByIdAndUpdate(serverId, updateData, { session });
        } else {
            await Server.findByIdAndUpdate(serverId, updateData);
        }
        return;
    }
    
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / reviews.length;
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => distribution[r.rating]++);
    
    const updateData = {
        'rating.average': averageRating,
        'rating.count': reviews.length,
        'rating.distribution': distribution
    };
    
    if (session) {
        await Server.findByIdAndUpdate(serverId, updateData, { session });
    } else {
        await Server.findByIdAndUpdate(serverId, updateData);
    }
    
    // Инвалидируем кэш страницы сервера (используем правильную функцию)
    const server = await Server.findById(serverId);
    if (server && server.slug) {
        cacheService.invalidateCache(`/server/${server.slug}`);
    }
}

async function updateAllRatings() {
    const servers = await Server.find({ active: true });
    for (const server of servers) {
        await updateServerRating(server._id);
    }
    console.log(`✅ Updated ratings for ${servers.length} servers`);
}

module.exports = { updateServerRating, updateAllRatings };