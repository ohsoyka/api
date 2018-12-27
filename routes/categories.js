const express = require('express');
const HttpStatus = require('http-status-codes');
const models = require('../models');
const generateQueryFilter = require('../helpers/generate-query-filter');
const generateQueryPopulations = require('../helpers/generate-query-populations');
const routeProtector = require('../middlewares/route-protector');
const errorHandler = require('../middlewares/error-handler');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const filter = generateQueryFilter({ model: models.category, query: req.query });
    const populations = generateQueryPopulations(req.query.include);

    if (!req.isAuthenticated) {
      filter.hidden = false;
    }

    const { page = 1, limit = Number.MAX_SAFE_INTEGER } = req.query;
    const { docs, pages } = await models.category.paginate(filter, {
      page,
      limit,
      populate: populations,
      sort: req.query.sort || 'title',
    });

    res.json({
      docs: docs.map(doc => doc.serialize()),
      meta: { currentPage: page, totalPages: pages },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:category_path', async (req, res, next) => {
  try {
    const populations = generateQueryPopulations(req.query.include);
    const category = await models.category.findOne({ path: req.params.category_path }).populate(populations);

    if (!category) {
      return next({ status: HttpStatus.NOT_FOUND });
    }

    return res.json(category.serialize());
  } catch (error) {
    return next(error);
  }
});

router.post('/', routeProtector, async (req, res, next) => {
  try {
    const category = await models.category.create(req.body);

    res.json(category.serialize());
  } catch (error) {
    next(error);
  }
});

router.patch('/:category_path', routeProtector, async (req, res, next) => {
  try {
    const category = await models.category.findOneAndUpdate({
      path: req.params.category_path,
    }, req.body, { new: true });

    res.json(category.serialize());
  } catch (error) {
    next(error);
  }
});

router.delete('/:category_path', routeProtector, async (req, res, next) => {
  try {
    await models.category.delete({ path: req.params.category_path });

    res.json({});
  } catch (error) {
    next(error);
  }
});

router.use(errorHandler);

module.exports = router;
