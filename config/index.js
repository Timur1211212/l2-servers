// config/index.js
const Joi = require('joi');

// Берем только наши переменные, а не все process.env
const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    HTTPS_PORT: process.env.HTTPS_PORT,
    MONGODB_URI: process.env.MONGODB_URI,
    SESSION_SECRET: process.env.SESSION_SECRET,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    DOMAIN: process.env.DOMAIN,
    CACHE_TTL: process.env.CACHE_TTL,
    CACHE_CHECK_PERIOD: process.env.CACHE_CHECK_PERIOD,
    RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW,
    RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX,
    YANDEX_VERIFICATION: process.env.YANDEX_VERIFICATION,
    OG_IMAGE_WIDTH: process.env.OG_IMAGE_WIDTH,
    OG_IMAGE_HEIGHT: process.env.OG_IMAGE_HEIGHT
};

const configSchema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production').default('development'),
    PORT: Joi.number().default(3000),
    HTTPS_PORT: Joi.number().default(443),
    MONGODB_URI: Joi.string().required(),
    SESSION_SECRET: Joi.string().min(32).required(),
    ADMIN_PASSWORD: Joi.string().min(6).required(),
    DOMAIN: Joi.string().default('zerokulasite.ru'),
    CACHE_TTL: Joi.number().default(3600),
    CACHE_CHECK_PERIOD: Joi.number().default(120),
    RATE_LIMIT_WINDOW: Joi.number().default(900000),
    RATE_LIMIT_MAX: Joi.number().default(100),
    YANDEX_VERIFICATION: Joi.string().optional().allow(''),
    OG_IMAGE_WIDTH: Joi.number().default(1200),
    OG_IMAGE_HEIGHT: Joi.number().default(630)
});

const { error, value: config } = configSchema.validate(envVars, { 
    allowUnknown: false,
    stripUnknown: true 
});

if (error) {
    console.error('❌ Config validation error:', error.message);
    console.error('Missing or invalid environment variables:');
    error.details.forEach(detail => {
        console.error(`  - ${detail.message}`);
    });
    process.exit(1);
}

module.exports = {
    ...config,
    isDev: config.NODE_ENV === 'development',
    isProd: config.NODE_ENV === 'production',
    // Алиасы для удобства
    nodeEnv: config.NODE_ENV,
    port: config.PORT,
    httpsPort: config.HTTPS_PORT,
    mongodbUri: config.MONGODB_URI,
    sessionSecret: config.SESSION_SECRET,
    adminPassword: config.ADMIN_PASSWORD,
    domain: config.DOMAIN
};