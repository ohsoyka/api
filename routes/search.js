const express = require('express');
const models = require('../models');
const errorHandler = require('../middlewares/error-handler');
const generateQueryPopulations = require('../helpers/generate-query-populations');

const router = express.Router();

function searchText(model, query, additionalFields = {}, populations = {}) {
  const findParams = Object.assign({
    $text: { $search: `${query}` },
    deleted: false,
  }, additionalFields);

  return model
    .find(findParams, {
      score: { $meta: 'textScore' },
    })
    .populate(populations)
    .sort({
      score: { $meta: 'textScore' },
    });
}

router.get('/', (req, res, next) => {
  const { query, page = 1, limit = Number.MAX_SAFE_INTEGER } = req.query;

  if (query === null || query === undefined) {
    res.json({ docs: [], meta: { currentPage: 1, totalPages: 0 } });

    return;
  }

  const populations = generateQueryPopulations(req.query.include);
  const filter = {};

  if (!req.isAuthenticated) {
    filter.private = false;
  }

  Promise.all([
    searchText(models.article, query, filter, populations),
    searchText(models.page, query, filter, populations),
    searchText(models.project, query, filter, populations),
    searchText(models.category, query, filter, populations),
  ])
    .then(([articles, pages, projects, categories]) => {
      const articlesSearchResults = articles.map(article => Object.assign({ searchResultType: 'article' }, article.serialize()));
      const pagesSearchResults = pages.map(page => Object.assign({ searchResultType: 'page' }, page.serialize())); // eslint-disable-line
      const projectsSearchResults = projects.map(project => Object.assign({ searchResultType: 'project' }, project.serialize()));
      const categoriesSearchResults = categories.map(category => Object.assign({ searchResultType: 'category' }, category.serialize()));

      const searchResults = [
        ...articlesSearchResults,
        ...pagesSearchResults,
        ...projectsSearchResults,
        ...categoriesSearchResults,
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

      const totalPages = Math.ceil(searchResults.length / limit);

      res.json({
        docs: searchResults.slice((page - 1) * limit, page * limit),
        meta: { currentPage: page, totalPages },
      });
    })
    .catch(next);
});

router.use(errorHandler);

module.exports = router;
