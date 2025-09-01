require('dotenv').config();

const config = {
  // Application
  app: {
    name: process.env.APP_NAME || 'RuachConnect',
    env: process.env.APP_ENV || 'development',
    debug: process.env.APP_DEBUG === 'true',
    url: process.env.APP_URL || 'http://localhost:3000',
    port: process.env.PORT || 3000
  },

  // Base de données MySQL
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT) || 3306,
    name: process.env.DATABASE_NAME || 'ruachconnect',
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD
  },

  // JWT Sécurisé
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },

  // Upload de Photos
  upload: {
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE) || 5242880, // 5MB
    allowedTypes: process.env.UPLOAD_ALLOWED_TYPES?.split(',') || ['jpg', 'jpeg', 'png'],
    path: process.env.STORAGE_PATH || './uploads/photos',
    url: process.env.STORAGE_URL || 'http://localhost:3000/uploads'
  },

  // Email (notifications futures)
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    secure: false
  },

  // Rate Limiting par Contexte
  rateLimit: {
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5 // 5 tentatives per window
    },
    api: {
      windowMs: 60 * 1000, // 1 minute
      max: 100 // 100 requests per minute
    },
    upload: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10 // 10 uploads per hour
    }
  }
};

module.exports = config;