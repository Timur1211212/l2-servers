// models/Dmca.js
const mongoose = require('mongoose');

const DmcaSchema = new mongoose.Schema({
    fullName: { 
        type: String, 
        required: true,
        trim: true
    },
    email: { 
        type: String, 
        required: true,
        trim: true,
        lowercase: true
    },
    company: { 
        type: String, 
        default: '',
        trim: true
    },
    copyrightedWork: { 
        type: String, 
        required: true 
    },
    infringingContent: { 
        type: String, 
        required: true 
    },
    statement: { 
        type: String, 
        required: true 
    },
    status: { 
        type: String, 
        default: 'pending',
        enum: ['pending', 'reviewed', 'resolved', 'rejected'],
        index: true
    },
    ipAddress: {
        type: String,
        default: ''
    },
    adminNotes: {
        type: String,
        default: ''
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: { 
        type: Date, 
        default: Date.now,
        index: true
    }
});

module.exports = mongoose.model('DmcaComplaint', DmcaSchema);