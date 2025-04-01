require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoose = require('mongoose');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const callRoutes = require('./routes/callRoutes');
const emailRoutes = require('./routes/emailRoutes');
const setupSocket = require('./sockets/socketHandlers');

const app = express();
const server = http.createServer(app);

// ========================
// 🌐 MongoDB Connection
// ========================
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// ========================
// 🔐 Security Middleware
// ========================
app.use(helmet()); // Protect against common security vulnerabilities

// ========================
// ⚡ Performance Middleware
// ========================
app.use(compression()); // Compress response bodies for improved performance

// ========================
// 📝 Logging Middleware
// ========================
app.use(morgan('dev')); // Log incoming requests for debugging

// ========================
// 🛡️ Enhanced CORS Configuration
// ========================
const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:5173'];

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'X-Requested-With'],
    credentials: true
}));

// ✅ Handle Preflight Requests (OPTIONS)
app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', allowedOrigins);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(204);
});

// ========================
// 📏 Rate Limiting
// ========================
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // Limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// ========================
// 🏋️ Request Size Limits
// ========================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ========================
// ✅ Health Check Endpoint
// ========================
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date(),
        uptime: process.uptime()
    });
});

// ========================
// 🚀 API Routes
// ========================
app.use('/api/call', callRoutes);
app.use('/api/email', emailRoutes);

// ========================
// 🛠️ Error Handling Middleware
// ========================
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal Server Error',
            status: err.status || 500
        }
    });
});

// ========================
// 🚫 404 Handler
// ========================
app.use((req, res) => {
    res.status(404).json({
        error: {
            message: 'Route not found',
            status: 404
        }
    });
});

// ========================
// 📡 WebSocket Setup
// ========================
try {
    setupSocket(server);
} catch (error) {
    console.error('❌ Failed to setup WebSocket server:', error);
    process.exit(1);
}

// ========================
// ⏳ Graceful Shutdown Handling
// ========================
const gracefulShutdown = () => {
    console.log('🛑 Received shutdown signal. Closing server...');
    server.close(() => {
        console.log('✅ Server closed. Exiting process...');
        process.exit(0);
    });

    // Force close after 30 seconds
    setTimeout(() => {
        console.error('❌ Could not close connections in time. Forcefully shutting down.');
        process.exit(1);
    }, 30000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// ========================
// 🌍 Start Server
// ========================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
});

module.exports = server; // Export for testing
