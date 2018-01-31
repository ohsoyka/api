const model = require('../utils/model');

module.exports = model('Image', {
  original: String,
  large: String,
  medium: String,
  small: String,
}, {
  constants: {
    DIMENSIONS: {
      LARGE: {
        WIDTH: 1920,
        HEIGHT: 1080,
      },
      MEDIUM: {
        WIDTH: 1280,
        HEIGHT: 720,
      },
      SMALL: {
        WIDTH: 400,
        HEIGHT: 225,
      },
    },
  },
});
