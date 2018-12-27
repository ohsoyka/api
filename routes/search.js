const express = require('express');
const ConvertLayout = require('convert-layout');
const models = require('../models');
const errorHandler = require('../middlewares/error-handler');
const detectAlphabet = require('../helpers/detect-alphabet');
const generateQueryPopulations = require('../helpers/generate-query-populations');

const router = express.Router();

function searchText(model, query, additionalFields = {}, populations = {}) {
  const findParams = {
    $text: { $search: `${query}` },
    deleted: false,
    ...additionalFields,
  };

  return model
    .find(findParams, {
      score: { $meta: 'textScore' },
    })
    .populate(populations)
    .sort({
      score: { $meta: 'textScore' },
    });
}

async function performSearchForAllModels(query, filter, populations) {
  const [articles, pages, projects, categories, photoAlbums] = await Promise.all([
    searchText(models.article, query, filter, populations),
    searchText(models.page, query, filter, populations),
    searchText(models.project, query, filter, populations),
    searchText(models.category, query, filter, populations),
    searchText(models.photoAlbum, query, filter, populations),
  ]);

  const articlesSearchResults = articles.map(article => Object.assign({ searchResultType: 'article' }, article.serialize()));
  const pagesSearchResults = pages.map(page => Object.assign({ searchResultType: 'page' }, page.serialize()));
  const projectsSearchResults = projects.map(project => Object.assign({ searchResultType: 'project' }, project.serialize()));
  const categoriesSearchResults = categories.map(category => Object.assign({ searchResultType: 'category' }, category.serialize()));
  const photoAlbumsSearchResults = photoAlbums.map(photoAlbum => Object.assign({ searchResultType: 'photo-album' }, photoAlbum.serialize()));

  const searchResults = [
    ...articlesSearchResults,
    ...pagesSearchResults,
    ...projectsSearchResults,
    ...categoriesSearchResults,
    ...photoAlbumsSearchResults,
  ]
    .sort((left, right) => {
      if (left.score > right.score) {
        return -1;
      }

      if (left.score < right.score) {
        return 1;
      }

      return 0;
    });

  return searchResults;
}

router.get('/', async (req, res, next) => {
  const { query, page = 1, limit = Number.MAX_SAFE_INTEGER } = req.query;

  if (query === null || query === undefined) {
    res.json({ docs: [], meta: { currentPage: 1, totalPages: 0 } });

    return;
  }

  const populations = generateQueryPopulations(req.query.include);
  const filter = {};

  if (!req.isAuthenticated) {
    filter.hidden = false;
  }

  const queryLanguage = detectAlphabet(query);
  let queryInOppositeKeyboardLayout;

  if (queryLanguage) {
    queryInOppositeKeyboardLayout = queryLanguage === 'eng' ? ConvertLayout.uk.fromEn(query) : ConvertLayout.uk.toEn(query);
  }

  try {
    const searchResults = await performSearchForAllModels(query, filter, populations);
    const searchResultsInOppositeKeyboardLayout = queryInOppositeKeyboardLayout
      ? await performSearchForAllModels(queryInOppositeKeyboardLayout, filter, populations)
      : [];

    const allSearchResults = searchResults.concat(searchResultsInOppositeKeyboardLayout);

    const totalPages = Math.ceil(allSearchResults.length / limit);

    res.json({
      docs: allSearchResults.slice((page - 1) * limit, page * limit),
      meta: { currentPage: page, totalPages },
    });
  } catch (error) {
    next(error);
  }
});

router.use(errorHandler);

module.exports = router;
