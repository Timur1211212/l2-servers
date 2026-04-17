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
    
    description: { 
        type: String, 
        default: '',
        maxlength: 1000
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

// Индексы для оптимизации запросов
ServerSchema.index({ version: 1, active: 1 });
ServerSchema.index({ slug: 1 });
ServerSchema.index({ active: 1, 'rating.average': -1 });
ServerSchema.index({ active: 1, createdAt: -1 });
ServerSchema.index({ status: 1, active: 1 });
ServerSchema.index({ openingDate: -1, active: 1 });

// Middleware для обновления updatedAt
ServerSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Виртуальное поле для получения рейтов списком
ServerSchema.virtual('ratesList').get(function() {
    const rates = [];
    if (this.exp) rates.push({ label: 'Exp', value: this.exp });
    if (this.adena) rates.push({ label: 'Adena', value: this.adena });
    if (this.drop) rates.push({ label: 'Drop', value: this.drop });
    if (this.spoil) rates.push({ label: 'Spoil', value: this.spoil });
    if (this.spoilChance) rates.push({ label: 'Spoil Chance', value: this.spoilChance });
    return rates;
});

module.exports = mongoose.model('Server', ServerSchema);