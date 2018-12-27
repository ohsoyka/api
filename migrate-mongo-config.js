// Readme on migrations: https://github.com/seppevs/migrate-mongo#readme

const config = require('./config').current;

module.exports = {
  mongodb: {
    url: `mongodb://${config.db.host}:${config.db.port}`,
    databaseName: config.db.name,

    options: {
      useNewUrlParser: true, // removes a deprecation warning when connecting
    },
  },

  migrationsDir: 'tasks/db/migrations',
  changelogCollectionName: 'changelog',
};
