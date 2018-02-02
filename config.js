const config = {
  development: {
    port: 3200,
    clientURL: 'http://localhost:7200',
    apiURL: 'http://localhost:3200',
    staticURL: 'http://localhost:3600',
    cookiesDomain: 'localhost',

    corsAllowedOrigins: ['*'],

    db: {
      host: 'localhost',
      name: 'ohsoyka-dev',
      port: 27017,
    },

    digitalOcean: {
      spaces: {
        name: 'ohsoyka',
        endpoint: 'ams3.digitaloceanspaces.com',
      },
    },

    jwtSecret: 'supersecret',
  },

  production: {
    port: 3000,
    clientURL: 'https://ohsoyka.com',
    apiURL: 'https://api.ohsoyka.com',
    staticURL: 'https://static.ohsoyka.com',
    cookiesDomain: '.ohsoyka.com',

    corsAllowedOrigins: [
      'ohsoyka.com',
      'api.ohsoyka.com',
      'static.ohsoyka.com',
    ],

    db: {
      host: 'localhost',
      name: 'ohsoyka',
      port: 27017,
    },

    server: {
      host: '46.101.99.203',
      username: 'poohitan',
      folder: '~ohsoyka.com/api',
    },

    pm2: {
      appName: 'ohsoyka-api',
    },

    git: {
      repo: 'git@bitbucket.org:soyka/api.git',
      branch: 'stable',
    },

    digitalOcean: {
      spaces: {
        name: 'ohsoyka',
        endpoint: 'ams3.digitaloceanspaces.com',
      },
    },

    jwtSecret: process.env.OHSOYKA_JWT_SECRET,
  },
};

const environment = process.env.NODE_ENV;

module.exports = Object.assign({}, config, {
  current: Object.assign({ environment }, config[environment]),
});
