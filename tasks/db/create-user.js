const Logger = require('logger');
const { argv } = require('yargs'); // eslint-disable-line
const connectToDB = require('../../utils/connect-to-db');
const models = require('../../models');

const login = argv.login || argv.username || argv.user || argv.u;
const password = argv.password || argv.p || '12345678';
const email = argv.email || argv.e || '';
const role = argv.role || argv.r || 'user';

connectToDB()
  .then(() => models.user.create({
    login,
    email,
    password,
    role,
  }))
  .then(user => Logger.success('Successfully created a user', JSON.stringify(user, null, 2)))
  .catch(error => Logger.error(error))
  .then(() => process.exit());
