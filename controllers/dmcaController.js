// controllers/dmcaController.js
const DmcaComplaint = require('../models/Dmca');

async function submit(req, res) {
    try {
        const { fullName, email, company, copyrightedWork, infringingContent, statement } = req.body;
        
        // Простая валидация
        if (!fullName || fullName.length < 2) {
            return res.status(400).json({ error: 'Укажите полное имя' });
        }
        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: 'Укажите корректный email' });
        }
        if (!copyrightedWork || copyrightedWork.length < 10) {
            return res.status(400).json({ error: 'Опишите защищенное произведение' });
        }
        if (!infringingContent || infringingContent.length < 10) {
            return res.status(400).json({ error: 'Опишите нарушающий контент' });
        }
        
        await DmcaComplaint.create({
            fullName,
            email,
            company,
            copyrightedWork,
            infringingContent,
            statement,
            ipAddress: req.ip
        });
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getAll(req, res) {
    try {
        const { status } = req.query;
        const query = {};
        if (status && status !== 'all') query.status = status;
        
        const complaints = await DmcaComplaint.find(query)
            .sort({ createdAt: -1 })
            .lean();
        res.json({ complaints });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getOne(req, res) {
    try {
        const complaint = await DmcaComplaint.findById(req.params.id).lean();
        if (!complaint) {
            return res.status(404).json({ error: 'Not found' });
        }
        res.json(complaint);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function update(req, res) {
    try {
        const { id } = req.params;
        const { status, adminNotes } = req.body;
        
        await DmcaComplaint.findByIdAndUpdate(id, { 
            status, 
            adminNotes,
            resolvedBy: req.session.user.id
        });
        
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function deleteComplaint(req, res) {
    try {
        await DmcaComplaint.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = { submit, getAll, getOne, update, deleteComplaint };