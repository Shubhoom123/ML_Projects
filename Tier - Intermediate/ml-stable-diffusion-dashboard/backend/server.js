const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware - must be first
app.use(helmet());

// CORS configuration - restrict to your frontend domain
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    optionsSuccessStatus: 200,
    methods: ['GET'],
    allowedHeaders: ['Content-Type']
};
app.use(cors(corsOptions));

// Rate limiting - prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parser with size limits
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Request logging (production should use proper logger like Winston)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Import routes
const repositoryRoutes = require('./routes/repository');
const contributorsRoutes = require('./routes/contributors');
const commitsRoutes = require('./routes/commits');
const pullRequestsRoutes = require('./routes/pullRequests');
const issuesRoutes = require('./routes/issues');
const analyticsRoutes = require('./routes/analytics');

// Use routes
app.use('/api/repository', repositoryRoutes);
app.use('/api/contributors', contributorsRoutes);
app.use('/api/commits', commitsRoutes);
app.use('/api/pull-requests', pullRequestsRoutes);
app.use('/api/issues', issuesRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Global error handler - don't expose internal errors
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    // Don't send stack trace to client
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ 
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message 
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
