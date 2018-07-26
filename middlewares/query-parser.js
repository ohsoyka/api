module.exports = (req, res, next) => {
  const { query } = req;

  Object.keys(query).forEach((paramName) => {
    // don't parse search query
    if (req.path === '/search' && paramName === 'query') {
      return;
    }

    const paramValue = query[paramName];

    if (!Number.isNaN(Number(paramValue))) {
      query[paramName] = Number(paramValue);

      return;
    }

    if (paramValue === 'true' || paramValue === 'false') {
      query[paramName] = paramValue === 'true';
    }
  });

  next();
};
