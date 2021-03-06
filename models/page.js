const model = require('../utils/model');
const slugifyText = require('../helpers/slugify-text');

module.exports = model('Page', {
  title: String,
  body: String,
  path: { type: String, index: true, unique: true },
  hidden: { type: Boolean, default: false },
}, {
  indexes: [
    [
      {
        title: 'text',
        body: 'text',
        path: 'text',
      },
      {
        weights: {
          title: 10,
          body: 5,
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
