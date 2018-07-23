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
    const filter = generateQueryFilter({ model: models.photo, query: req.query });
    const populations = generateQueryPopulations(req.query.include);

    if (!populations.map(population => population.path).includes('image')) {
      populations.push({ path: 'image' });
    }

    const { page = 1, limit = Number.MAX_SAFE_INTEGER } = req.query;
    const { docs, pages } = await models.photo.paginate(filter, {
      page,
      limit,
      populate: populations,
      sort: req.query.sort || '-createdAt',
    });

    res.json({
      docs: docs.map(doc => doc.serialize()),
      meta: { currentPage: page, totalPages: pages },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:photo_path', async (req, res, next) => {
  try {
    const populations = generateQueryPopulations(req.query.include);
    const photo = await models.photo.findOne({ path: req.params.photo_path }).populate(populations);

    if (!photo) {
      return next({ status: HttpStatus.NOT_FOUND });
    }

    return res.json(photo.serialize());
  } catch (error) {
    return next(error);
  }
});

router.post('/', routeProtector, async (req, res, next) => {
  try {
    const photo = await models.photo.create(req.body);

    res.json(photo.serialize());
  } catch (error) {
    next(error);
  }
});

router.patch('/:photo_path', routeProtector, async (req, res, next) => {
  try {
    const photo = await models.photo.findOneAndUpdate({
      path: req.params.photo_path,
    }, req.body, { new: true });

    res.json(photo.serialize());
  } catch (error) {
    next(error);
  }
});

router.delete('/:photo_path', routeProtector, async (req, res, next) => {
  try {
    await models.photo.delete({ path: req.params.photo_path });

    res.json({});
  } catch (error) {
    next(error);
  }
});

router.use(errorHandler);

module.exports = router;
