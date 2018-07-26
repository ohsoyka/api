const util = require('util');
const average = util.promisify(require('image-average-color'));
const imageSize = require('image-size');
const request = util.promisify(require('request'));
const model = require('../utils/model');

module.exports = model('Image', {
  original: String,
  large: String,
  medium: String,
  small: String,
  averageColor: { type: [Number], default: [] },
  aspectRatio: Number,
}, {
  middlewares: {
    save: {
      async pre(next) {
        const fallback = [0, 0, 0, 0];

        try {
          const { body } = await request({ url: this.small, encoding: null });

          if (!body) {
            this.averageColor = fallback;

            return next();
          }

          const color = await average(body);
          this.averageColor = color || fallback;

          const { width, height } = imageSize(body);
          this.aspectRatio = width / height;

          return next();
        } catch (error) {
          this.averageColor = fallback;

          return next();
        }
      },
    },
  },
});
