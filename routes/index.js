const express = require('express');
const router = express.Router();

// Route racine avec informations API
router.get('/', function(req, res, next) {
  res.json({
    message: 'RuachConnect API v1',
    version: require('../package.json').version,
    endpoints: {
      auth: '/api/v1/auth',
      persons: '/api/v1/persons',
      followUps: '/api/v1/follow-ups',
      users: '/api/v1/users',
      stats: '/api/v1/stats',
      upload: '/api/v1/upload'
    },
    health: '/health',
    info: '/info'
  });
});

module.exports = router;
