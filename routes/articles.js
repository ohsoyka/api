const express = require('express');
const HttpStatus = require('http-status-codes');
const models = require('../models');
const generateQueryFilter = require('../helpers/generate-query-filter');
const generateQueryPopulations = require('../helpers/generate-query-populations');
const routeProtector = require('../middlewares/route-protector');
const errorHandler = require('../middlewares/error-handler');

const router = express.Router();

function getArticleAsUser(path, populations) {
  return models.article.findOneAndUpdate({
    path,
  }, {
    $inc: { views: 1 },
  }, {
    new: true,
  }).populate(populations);
}

function getArticleAsAdmin(path, populations) {
  return models.article
    .findOne({ path })
    .populate(populations);
}

router.get('/', async (req, res, next) => {
  try {
    const filter = generateQueryFilter({ model: models.article, query: req.query });
    const populations = generateQueryPopulations(req.query.include);

    if (req.query.tag) {
      filter.tags = req.query.tag;
    }

    if (!req.isAuthenticated) {
      filter.private = false;
    }

    const { page = 1, limit = Number.MAX_SAFE_INTEGER } = req.query;
    const { docs, pages } = await models.article.paginate(filter, {
      page,
      limit,
      populate: populations,
      sort: req.query.sort || '-publishedAt',
    });

    res.json({
      docs: docs.map(doc => doc.serialize()),
      meta: { currentPage: page, totalPages: pages },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:article_path', async (req, res, next) => {
  try {
    const path = req.params.article_path;
    const populations = generateQueryPopulations(req.query.include);
    const article = req.isAuthenticated
      ? await getArticleAsAdmin(path, populations)
      : await getArticleAsUser(path, populations);

    if (!article) {
      return next({ status: HttpStatus.NOT_FOUND });
    }

    return res.json(article.serialize());
  } catch (error) {
    return next(error);
  }
});

router.post('/', routeProtector, async (req, res, next) => {
  try {
    const article = await models.article.create(req.body);

    res.json(article.serialize());
  } catch (error) {
    next(error);
  }
});

router.patch('/:article_path', routeProtector, async (req, res, next) => {
  try {
    const article = await models.article.findOneAndUpdate({ path: req.params.article_path }, req.body, { new: true });

    res.json(article.serialize());
  } catch (error) {
    next(error);
  }
});

router.delete('/:article_path', routeProtector, async (req, res, next) => {
  try {
    await models.article.delete({ path: req.params.article_path });

    res.json({});
  } catch (error) {
    next(error);
  }
});

router.use(errorHandler);

module.exports = router;
