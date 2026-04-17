// middleware/auth.js

// Проверка аутентификации пользователя
function requireAuth(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ 
            error: 'Unauthorized', 
            message: 'Требуется авторизация' 
        });
    }
    next();
}

// Проверка роли администратора
function requireAdmin(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ 
            error: 'Unauthorized', 
            message: 'Требуется авторизация' 
        });
    }
    
    if (req.session.user.role !== 'admin') {
        return res.status(403).json({ 
            error: 'Forbidden', 
            message: 'Недостаточно прав. Требуются права администратора.' 
        });
    }
    next();
}

// Проверка роли модератора или администратора
function requireModerator(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ 
            error: 'Unauthorized', 
            message: 'Требуется авторизация' 
        });
    }
    
    if (req.session.user.role !== 'admin' && req.session.user.role !== 'moderator') {
        return res.status(403).json({ 
            error: 'Forbidden', 
            message: 'Недостаточно прав. Требуются права модератора или администратора.' 
        });
    }
    next();
}

// Проверка, что пользователь - владелец ресурса (например, для редактирования своих отзывов)
function requireOwner(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ 
            error: 'Unauthorized', 
            message: 'Требуется авторизация' 
        });
    }
    
    // Здесь можно добавить проверку владельца
    // Например: if (req.session.user.id !== req.params.userId && req.session.user.role !== 'admin')
    next();
}

// Опциональная аутентификация (не требует авторизации, но если есть - передает пользователя)
function optionalAuth(req, res, next) {
    if (req.session && req.session.user) {
        req.user = req.session.user;
    }
    next();
}

// Получение текущего пользователя
function getCurrentUser(req, res, next) {
    if (req.session && req.session.user) {
        req.currentUser = req.session.user;
    } else {
        req.currentUser = null;
    }
    next();
}

// Проверка CSRF токена (для защиты форм)
function validateCsrf(req, res, next) {
    const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;
    const sessionToken = req.session.csrfToken;
    
    if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
        return res.status(403).json({ 
            error: 'Invalid CSRF token', 
            message: 'Недействительный CSRF токен' 
        });
    }
    next();
}

// Генерация CSRF токена
function generateCsrfToken(req, res, next) {
    const crypto = require('crypto');
    if (!req.session.csrfToken) {
        req.session.csrfToken = crypto.randomBytes(32).toString('hex');
    }
    res.locals.csrfToken = req.session.csrfToken;
    next();
}

// Ограничение по IP для админки
const allowedAdminIps = process.env.ADMIN_ALLOWED_IPS ? process.env.ADMIN_ALLOWED_IPS.split(',') : [];

function restrictAdminByIp(req, res, next) {
    if (allowedAdminIps.length === 0) {
        return next();
    }
    
    const clientIp = req.ip || req.connection.remoteAddress;
    if (allowedAdminIps.includes(clientIp)) {
        return next();
    }
    
    return res.status(403).json({ 
        error: 'Access denied', 
        message: 'Доступ с вашего IP адреса запрещен' 
    });
}

// Логирование действий администратора
function logAdminAction(req, res, next) {
    if (req.session && req.session.user) {
        const startTime = Date.now();
        const originalJson = res.json;
        
        res.json = function(data) {
            const duration = Date.now() - startTime;
            console.log(`[ADMIN ACTION] User: ${req.session.user.username}, Action: ${req.method} ${req.originalUrl}, Duration: ${duration}ms`);
            originalJson.call(this, data);
        };
    }
    next();
}

// Проверка, не забанен ли пользователь (если есть система банов)
async function checkUserBan(req, res, next) {
    if (!req.session || !req.session.user) {
        return next();
    }
    
    try {
        const User = require('../models/User');
        const user = await User.findById(req.session.user.id);
        
        if (user && user.isBanned) {
            req.session.destroy();
            return res.status(403).json({ 
                error: 'Account banned', 
                message: 'Ваш аккаунт заблокирован' 
            });
        }
        next();
    } catch (err) {
        next();
    }
}

// Проверка сессии на валидность (не истекла ли)
function checkSessionValid(req, res, next) {
    if (!req.session || !req.session.user) {
        return next();
    }
    
    const sessionAge = Date.now() - (req.session.cookie._expires || Date.now());
    const maxAge = 24 * 60 * 60 * 1000; // 24 часа
    
    if (sessionAge > maxAge) {
        req.session.destroy();
        return res.status(401).json({ 
            error: 'Session expired', 
            message: 'Сессия истекла. Войдите заново.' 
        });
    }
    next();
}

module.exports = {
    requireAuth,
    requireAdmin,
    requireModerator,
    requireOwner,
    optionalAuth,
    getCurrentUser,
    validateCsrf,
    generateCsrfToken,
    restrictAdminByIp,
    logAdminAction,
    checkUserBan,
    checkSessionValid
};