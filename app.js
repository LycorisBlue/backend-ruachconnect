require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

// Configuration
const config = require('./config/app');
const database = require('./config/database');
const winston = require('./config/logger');
const { serve, setup } = require('./config/swagger');

// Middleware
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/auth');
const personRoutes = require('./routes/persons');
const followUpRoutes = require('./routes/follow-ups');
const userRoutes = require('./routes/users');
const statsRoutes = require('./routes/stats');
const uploadRoutes = require('./routes/upload');
const notificationRoutes = require('./routes/notifications');

const app = express();

// Connexion base de données
database.connect().catch(error => {
  winston.error('Failed to connect to database:', error);
  process.exit(1);
});

// Trust proxy (pour rate limiting et logs IP)
app.set('trust proxy', 1);

// Middleware de sécurité
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  }
}));

// CORS
app.use(cors({
  origin: config.app.env === 'development' ? '*' : [
    'https://app.ruachconnect.church',
    config.app.url
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Compression
app.use(compression());

// Logs HTTP
if (config.app.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => winston.info(message.trim())
    }
  }));
}

// Parse JSON avec limite
app.use(express.json({ 
  limit: '10mb',
  type: 'application/json'
}));

app.use(express.urlencoded({ 
  extended: true,
  limit: '10mb'
}));

// Servir fichiers statiques
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting global
app.use('/api', apiLimiter);

// Health check
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await database.healthCheck();
    
    res.status(dbHealth ? 200 : 503).json({
      status: dbHealth ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      version: require('./package.json').version,
      database: dbHealth ? 'connected' : 'disconnected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Service unavailable'
    });
  }
});

// Info endpoint
app.get('/info', (req, res) => {
  res.json({
    name: config.app.name,
    version: require('./package.json').version,
    environment: config.app.env,
    timestamp: new Date().toISOString()
  });
});

// API Routes v1
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/persons', personRoutes);
app.use('/api/v1/follow-ups', followUpRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/stats', statsRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Documentation Swagger
app.use('/api/v1/docs', serve, setup);

// Routes de base (compatibilité)
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenue sur RuachConnect API',
    version: require('./package.json').version,
    documentation: '/api/v1/docs',
    health: '/health'
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handler global
app.use(errorHandler);

// Gestion propre de l'arrêt
process.on('SIGTERM', async () => {
  winston.info('SIGTERM received, shutting down gracefully');
  await database.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  winston.info('SIGINT received, shutting down gracefully');
  await database.disconnect();
  process.exit(0);
});

module.exports = app;
