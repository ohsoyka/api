const model = require('../utils/model');
const slugifyText = require('../helpers/slugify-text');

module.exports = model('PhotoAlbum', {
  title: String,
  description: String,
  path: { type: String, index: true, unique: true },
  shootAt: { type: Date, default: () => new Date() },
  hidden: { type: Boolean, default: false },
  cover: { type: String, ref: 'Image' },
  photos: [{ type: String, ref: 'Photo' }],
}, {
  indexes: [
    [
      {
        title: 'text',
        description: 'text',
        path: 'text',
      },
      {
        weights: {
          title: 10,
          description: 7,
          path: 7,
        },
      },
    ],
  ],
  middlewares: {
    save: {
      pre(next) {
        this.path = this.path || (this.title ? slugifyText(this.title) : this._id);

        next();
      },
    },
  },
});
