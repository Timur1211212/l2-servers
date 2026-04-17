// models/Server.js
const mongoose = require('mongoose');

const ServerSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true,
        index: true
    },
    website: { 
        type: String, 
        required: true,
        trim: true
    },
    status: { 
        type: String, 
        default: 'Не VIP, но тоже неплохой сервер',
        enum: ['VIP', 'Почти VIP', 'Не VIP, но тоже неплохой сервер']
    },
    version: { 
        type: String, 
        default: 'Interlude',
        index: true
    },
    openingDate: { 
        type: Date, 
        default: null 
    },
    
    // Рейты
    exp: { type: String, default: '' },
    adena: { type: String, default: '' },
    drop: { type: String, default: '' },
    spoil: { type: String, default: '' },
    spoilChance: { type: String, default: '' },
    sealstone: { type: String, default: '' },
    raidBossExp: { type: String, default: '' },
    raidBossDrop: { type: String, default: '' },
    epicRaidBossDrop: { type: String, default: '' },
    questAdena: { type: String, default: '' },
    quest: { type: String, default: '' },
    questExp: { type: String, default: '' },
    
    // Описание с поддержкой HTML (WYSIWYG)
    description: { 
        type: String, 
        default: '',
        maxlength: 5000
    },
    active: { 
        type: Boolean, 
        default: true,
        index: true
    },
    slug: { 
        type: String, 
        unique: true, 
        sparse: true,
        index: true
    },
    
    // Логотип сервера
    logo: {
        type: String,
        default: ''
    },
    logoUrl: {
        type: String,
        default: ''
    },
    
    // Теги и категории (новое)
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    categories: [{
        type: String,
        enum: ['PvP', 'PvE', 'RP', 'Fun', 'Hardcore', 'Low Rate', 'Mid Rate', 'High Rate', 'x1', 'x100', 'x1000', 'New', 'Stable', 'Donate', 'No Donate'],
        default: []
    }],
    
    rating: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 },
        distribution: { 
            type: Map, 
            of: Number, 
            default: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } 
        }
    },
    
    // Мета-данные для SEO
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    metaKeywords: { type: String, default: '' },
    
    // Статистика
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    
    // Soft delete
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Индексы для тегов и категорий
ServerSchema.index({ tags: 1 });
ServerSchema.index({ categories: 1 });

// Middleware для обновления updatedAt
ServerSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Server', ServerSchema);