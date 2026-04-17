// controllers/authController.js
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function login(req, res) {
    try {
        const { username, password } = req.body;
        
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Неверный логин или пароль' });
        }
        
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ error: 'Неверный логин или пароль' });
        }
        
        // Обновляем время последнего входа
        await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
        
        req.session.user = { 
            id: user._id, 
            username: user.username, 
            role: user.role 
        };
        await req.session.save();
        
        res.json({ 
            success: true, 
            user: { username: user.username, role: user.role } 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

function checkAuth(req, res) {
    if (req.session.user) {
        res.json({ authenticated: true, user: req.session.user });
    } else {
        res.status(401).json({ authenticated: false });
    }
}

function logout(req, res) {
    req.session.destroy();
    res.clearCookie('l2session');
    res.json({ success: true });
}

function requireAuth(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
}

function requireAdmin(req, res, next) {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    next();
}

module.exports = { login, checkAuth, logout, requireAuth, requireAdmin };