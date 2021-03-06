module.exports = ({ model, query }) => {
  const fields = model.getFieldNames();

  return Object.keys(query).reduce((result, field) => {
    if (fields.includes(field)) {
      return { ...result, [field]: query[field] };
    }

    return result;
  }, {});
};
