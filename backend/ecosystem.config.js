// Configuration PM2 pour production
module.exports = {
  apps: [{
    name: 'btc-dashboard-api',
    script: './index.js',
    instances: 1,
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOST: '0.0.0.0',
      CACHE_TTL_SECONDS: 30,
      CORS_ORIGIN: '*'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    restart_delay: 4000
  }]
};
