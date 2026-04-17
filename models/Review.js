// models/Review.js
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    serverId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Server', 
        required: true,
        index: true
    },
    authorName: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: 50
    },
    rating: { 
        type: Number, 
        required: true,
        min: 1,
        max: 5
    },
    title: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: 100
    },
    content: { 
        type: String, 
        required: true,
        maxlength: 1520
    },
    pros: { 
        type: String, 
        default: '',
        maxlength: 300
    },
    cons: { 
        type: String, 
        default: '',
        maxlength: 300
    },
    helpful: { 
        type: Number, 
        default: 0 
    },
    notHelpful: { 
        type: Number, 
        default: 0 
    },
    helpfulIPs: { 
        type: [String], 
        default: [] 
    },
    notHelpfulIPs: { 
        type: [String], 
        default: [] 
    },
    status: { 
        type: String, 
        default: 'pending',
        enum: ['pending', 'approved', 'rejected'],
        index: true
    },
    ipAddress: {
        type: String,
        default: ''
    },
    userAgent: {
        type: String,
        default: ''
    },
    moderationNotes: {
        type: String,
        default: ''
    },
    moderatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: { 
        type: Date, 
        default: Date.now,
        index: true
    }
});

// Составной индекс для быстрых запросов
ReviewSchema.index({ serverId: 1, status: 1, createdAt: -1 });
ReviewSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Review', ReviewSchema);