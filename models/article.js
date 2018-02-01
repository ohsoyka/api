const model = require('../utils/model');
const slugifyText = require('../helpers/slugify-text');

module.exports = model('Article', {
  title: String,
  brief: String,
  intro: String,
  projectDescriptionAsIntro: { type: Boolean, default: false },
  body: String,
  publishedAt: { type: Date, default: () => new Date() },
  tags: [String],
  views: { type: Number, default: 0 },
  path: { type: String, index: true, unique: true },
  private: { type: Boolean, default: false },
  image: { type: String, ref: 'Image' },
  category: { type: String, ref: 'Category' },
  project: { type: String, ref: 'Project' },
}, {
  indexes: [
    [
      {
        title: 'text',
        intro: 'text',
        brief: 'text',
        body: 'text',
      },
      {
        weights: {
          title: 10, brief: 7, intro: 5, body: 5,
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
