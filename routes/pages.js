// routes/pages.js
const express = require('express');
const router = express.Router();
const path = require('path');

// =============== СТАТИЧЕСКИЕ HTML СТРАНИЦЫ ===============

// Главная страница (отдаём статический HTML из public)
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Админ панель
router.get('/admin-main', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin-main.html'));
});

// Статические страницы
router.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/about.html'));
});

router.get('/contacts', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/contacts.html'));
});

router.get('/privacy', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/privacy.html'));
});

router.get('/terms', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/terms.html'));
});

router.get('/disclaimer', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/disclaimer.html'));
});

router.get('/dmca', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/dmca.html'));
});

router.get('/cookies', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/cookies.html'));
});

router.get('/download', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/download.html'));
});

// Редиректы
router.get('/index.html', (req, res) => {
    res.redirect(301, '/');
});

module.exports = router;