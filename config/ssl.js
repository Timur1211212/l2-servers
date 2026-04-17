// config/ssl.js
const fs = require('fs');
const path = require('path');
const config = require('./index');

class SSLConfig {
    constructor() {
        this.options = null;
        this.useHTTPS = false;
        this.loadCertificates();
    }
    
    loadCertificates() {
        const sslKeyPath = `/etc/letsencrypt/live/${config.DOMAIN}/privkey.pem`;
        const sslCertPath = `/etc/letsencrypt/live/${config.DOMAIN}/fullchain.pem`;
        
        if (fs.existsSync(sslKeyPath) && fs.existsSync(sslCertPath) && config.isProd) {
            try {
                this.options = {
                    key: fs.readFileSync(sslKeyPath),
                    cert: fs.readFileSync(sslCertPath),
                    allowHTTP1: true
                };
                this.useHTTPS = true;
                console.log('✅ SSL certificates loaded');
            } catch (err) {
                console.error('❌ Error loading SSL:', err.message);
            }
        } else if (config.isDev) {
            console.log('⚠️ Development mode: HTTPS disabled');
        } else {
            console.warn('⚠️ SSL certificates not found, running without HTTPS');
        }
    }
    
    getOptions() {
        return this.options;
    }
    
    isEnabled() {
        return this.useHTTPS;
    }
}

module.exports = new SSLConfig();