module.exports = {
  apps: [
    {
      name: 'ruachconnect-api',
      script: './src/server.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 4040
      },
      env_production: {
        NODE_ENV: 'development',
        PORT: 4040
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      max_memory_restart: '1G',
      watch: false,
      ignore_watch: ['node_modules', 'logs', 'uploads'],
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};