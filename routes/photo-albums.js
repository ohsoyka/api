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
    const filter = generateQueryFilter({ model: models.photoAlbum, query: req.query });
    const populations = generateQueryPopulations(req.query.include);

    if (!req.isAuthenticated) {
      filter.private = false;
    }

    const { page = 1, limit = Number.MAX_SAFE_INTEGER } = req.query;
    const { docs, pages } = await models.photoAlbum.paginate(filter, {
      page,
      limit,
      populate: populations,
      sort: req.query.sort || '-shootAt',
    });

    res.json({
      docs: docs.map(doc => doc.serialize()),
      meta: { currentPage: page, totalPages: pages },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:photo_album_path', async (req, res, next) => {
  try {
    const populations = generateQueryPopulations(req.query.include);
    const photoAlbum = await models.photoAlbum.findOne({ path: req.params.photo_album_path }).populate(populations);

    if (!photoAlbum) {
      return next({ status: HttpStatus.NOT_FOUND });
    }

    return res.json(photoAlbum.serialize());
  } catch (error) {
    return next(error);
  }
});

router.post('/', routeProtector, async (req, res, next) => {
  try {
    const photoAlbum = await models.photoAlbum.create(req.body);

    res.json(photoAlbum.serialize());
  } catch (error) {
    next(error);
  }
});

router.patch('/:photo_album_path', routeProtector, async (req, res, next) => {
  try {
    const photoAlbum = await models.photoAlbum.findOneAndUpdate({
      path: req.params.photo_album_path,
    }, req.body, { new: true });

    res.json(photoAlbum.serialize());
  } catch (error) {
    next(error);
  }
});

router.delete('/:photo_album_path', routeProtector, async (req, res, next) => {
  try {
    await models.photoAlbum.delete({ path: req.params.photo_album_path });

    res.json({});
  } catch (error) {
    next(error);
  }
});

router.use(errorHandler);

module.exports = router;
