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
    const filter = generateQueryFilter({ model: models.project, query: req.query });
    const populations = generateQueryPopulations(req.query.include);

    if (!req.isAuthenticated) {
      filter.private = false;
    }

    const { page = 1, limit = Number.MAX_SAFE_INTEGER } = req.query;
    const { docs, pages } = await models.project.paginate(filter, {
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

router.get('/:project_path', async (req, res, next) => {
  try {
    const populations = generateQueryPopulations(req.query.include);
    const project = await models.project.findOne({ path: req.params.project_path }).populate(populations);

    if (!project) {
      return next({ status: HttpStatus.NOT_FOUND });
    }

    return res.json(project.serialize());
  } catch (error) {
    return next(error);
  }
});

router.post('/', routeProtector, async (req, res, next) => {
  try {
    const project = await models.project.create(req.body);

    res.json(project.serialize());
  } catch (error) {
    next(error);
  }
});

router.patch('/:project_path', routeProtector, async (req, res, next) => {
  try {
    const project = await models.project.findOneAndUpdate({ path: req.params.project_path }, req.body, { new: true });

    res.json(project.serialize());
  } catch (error) {
    next(error);
  }
});

router.delete('/:project_path', routeProtector, async (req, res, next) => {
  try {
    await models.project.delete({ path: req.params.project_path });

    res.json({});
  } catch (error) {
    next(error);
  }
});

router.use(errorHandler);

module.exports = router;
