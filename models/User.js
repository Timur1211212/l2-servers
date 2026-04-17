// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        default: 'admin',
        enum: ['admin', 'moderator']
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    lastLogin: {
        type: Date,
        default: null
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('User', UserSchema);