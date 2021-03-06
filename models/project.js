const model = require('../utils/model');
const slugifyText = require('../helpers/slugify-text');

module.exports = model('Project', {
  title: String,
  description: String,
  body: String,
  path: { type: String, index: true, unique: true },
  hidden: { type: Boolean, default: false },
  image: { type: String, ref: 'Image' },
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
          description: 5,
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
