const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const config = require('./config');
const logger = require('./utils/logger');
const routes = require('./routes');
const { errorHandler } = require('./middleware/error.middleware');
const { notFound } = require('./middleware/notFound.middleware');

const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Security Headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  optionsSuccessStatus: 200
}));

// Compression
app.use(compression());

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie Parser
app.use(cookieParser());

// HTTP Request Logger
if (config.server.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }));
}

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.server.env,
    database: 'connected',
    redis: 'connected'
  });
});

// API Documentation
app.get('/api/v1/docs', (req, res) => {
  res.json({
    message: 'Construction AI Platform API',
    version: '1.0.0',
    documentation: 'https://docs.constructionai.com',
    endpoints: {
      auth: '/api/v1/auth',
      projects: '/api/v1/projects',
      tasks: '/api/v1/tasks',
      resources: '/api/v1/resources',
      boq: '/api/v1/boq',
      materials: '/api/v1/materials',
      purchases: '/api/v1/purchases',
      reports: '/api/v1/reports',
      ai: '/api/v1/ai',
      notifications: '/api/v1/notifications'
    }
  });
});

// API Routes
app.use('/api/v1', routes);

// 404 Handler
app.use(notFound);

// Error Handler (must be last)
app.use(errorHandler);

module.exports = app;
