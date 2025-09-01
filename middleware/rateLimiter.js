const rateLimit = require('express-rate-limit');
const config = require('../config/app');

const createRateLimiter = (options) => {
  return rateLimit({
    ...options,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Trop de requêtes, veuillez réessayer plus tard'
        }
      });
    }
  });
};

const authLimiter = createRateLimiter(config.rateLimit.auth);
const apiLimiter = createRateLimiter(config.rateLimit.api);
const uploadLimiter = createRateLimiter(config.rateLimit.upload);

module.exports = {
  authLimiter,
  apiLimiter,
  uploadLimiter
};