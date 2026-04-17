// middleware/auth.js

function requireAuth(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ 
            error: 'Unauthorized', 
            message: 'Требуется авторизация' 
        });
    }
    next();
}

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

module.exports = { requireAuth, requireAdmin };