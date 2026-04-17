// services/slugService.js
const Server = require('../models/Server');

function generateSlug(name) {
    return name
        .toLowerCase()
        .replace(/[^a-zа-яё0-9\s]/gi, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 100);
}

async function generateUniqueSlug(name, existingId = null) {
    let slug = generateSlug(name);
    let uniqueSlug = slug;
    let counter = 1;
    
    while (true) {
        const existing = await Server.findOne({ 
            slug: uniqueSlug, 
            _id: { $ne: existingId } 
        });
        
        if (!existing) break;
        
        uniqueSlug = `${slug}-${counter}`;
        counter++;
    }
    
    return uniqueSlug;
}

module.exports = { generateSlug, generateUniqueSlug };