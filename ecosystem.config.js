require('dotenv').config();

module.exports = {
  apps: [{
    name: 'ohsoyka-api',
    script: 'app.js',

    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'development',
    },
    env_production: {
      NODE_ENV: 'production',
      JWT_SECRET: process.env.JWT_SECRET,
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    },
  }],

  deploy: {
    production: {
      user: 'poohitan',
      host: '46.101.99.203',
      ref: 'origin/master',
      repo: 'git@github.com:ohsoyka/api.git',
      path: '/home/poohitan/ohsoyka.com/api',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
    },
  },
};
