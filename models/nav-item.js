const model = require('../utils/model');

module.exports = model('NavItem', {
  index: Number,
  text: String,
  href: String,
  as: String,
});
