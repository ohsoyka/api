const express = require('express');
const RSS = require('rss');
const moment = require('moment');
const models = require('../models');
const errorHandler = require('../middlewares/error-handler');
const config = require('../config').current;

const router = express.Router();

const FEED_MAX_ITEMS = 50;

router.get('/', async (req, res, next) => {
  try {
    const feed = new RSS({
      title: 'Сойка',
      feed_url: `${config.clientURL}/rss`,
      site_url: `${config.clientURL}`,
      image_url: `${config.clientURL}/static/images/logo-small.png`,
      language: 'uk',
      pubDate: moment().toDate(),
    });

    const { docs } = await models.article.paginate({ private: false }, {
      page: 1,
      limit: FEED_MAX_ITEMS,
      sort: '-publishedAt',
      populate: 'image',
    });

    docs.forEach(article => {
      const url = `${config.clientURL}/${article.path}`;

      feed.item({
        title: article.title,
        description: `<img src="${article.image.small}"><p>${article.brief}</p><p><a href="${url}">Читати повністю &rarr;</a></p>`,
        url,
        guid: article._id,
        date: article.publishedAt,
      });
    });

    const xml = feed.xml({ indent: config.enironment === 'production' });

    res.header({ 'Content-Type': 'application/rss+xml' }).send(xml);
  } catch (error) {
    next(error);
  }
});

router.use(errorHandler);

module.exports = router;
