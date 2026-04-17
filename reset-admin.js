// reset-admin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

async function resetAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        const newPassword = 'admin123';
        const hash = await bcrypt.hash(newPassword, 10);
        
        const result = await User.findOneAndUpdate(
            { username: 'admin' },
            { password: hash },
            { upsert: true, new: true }
        );
        
        console.log(`✅ Admin password reset to: ${newPassword}`);
        console.log(`   Username: ${result.username}`);
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

resetAdmin();