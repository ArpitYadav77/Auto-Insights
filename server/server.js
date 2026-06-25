const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const config = require('./config/env');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const datasetRoutes = require('./routes/dataset');
const analysisRoutes = require('./routes/analysis');
const reportRoutes = require('./routes/report');

// Initialize Express app
const app = express();

// ──────────────────────────────────────────────
// Security Middleware
// ──────────────────────────────────────────────

// Helmet – sets various HTTP security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow serving uploaded files cross-origin
  })
);

// CORS – allow requests from frontend
app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin || 
        origin === config.FRONTEND_URL || 
        origin.endsWith('.vercel.app') ||
        config.NODE_ENV === 'development' ||
        origin.startsWith('http://localhost')
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting – general API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // max 200 requests per windowMs per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
  },
});

app.use('/api/', apiLimiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 auth requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes.',
  },
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ──────────────────────────────────────────────
// Body Parsing & Logging
// ──────────────────────────────────────────────

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ──────────────────────────────────────────────
// Static Files – serve uploaded datasets
// ──────────────────────────────────────────────

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ──────────────────────────────────────────────
// API Routes
// ──────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/dataset', datasetRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/report', reportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Auto Insights API is running.',
    environment: config.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ──────────────────────────────────────────────
// Global Error Handler
// ──────────────────────────────────────────────

app.use(errorHandler);

// ──────────────────────────────────────────────
// Start Server
// ──────────────────────────────────────────────

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start listening
    app.listen(config.PORT, () => {
      console.log(`\n🚀 Auto Insights API Server`);
      console.log(`   Environment : ${config.NODE_ENV}`);
      console.log(`   Port        : ${config.PORT}`);
      console.log(`   Frontend    : ${config.FRONTEND_URL}`);
      console.log(`   Python Svc  : ${config.PYTHON_SERVICE_URL}`);
      console.log(`   Ready at    : http://localhost:${config.PORT}\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
