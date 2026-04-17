// config/database.js
const mongoose = require('mongoose');
const config = require('./index');

const connectDB = async () => {
    try {
        await mongoose.connect(config.MONGODB_URI, {
            maxPoolSize: 10,
            minPoolSize: 2,
            socketTimeoutMS: 30000,
            serverSelectionTimeoutMS: 5000,
            family: 4 // Использовать IPv4, избегать проблем с IPv6
        });
        
        console.log('✅ MongoDB connected successfully');
        
        // Обработчики событий подключения
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected');
        });
        
        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected');
        });
        
        return mongoose.connection;
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

const closeDB = async () => {
    try {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed');
    } catch (error) {
        console.error('❌ Error closing MongoDB connection:', error);
    }
};

module.exports = { connectDB, closeDB };