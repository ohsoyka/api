const model = require('../utils/model');

module.exports = model('Photo', {
  description: String,
  exif: Object,
  image: { type: String, ref: 'Image' },
});
