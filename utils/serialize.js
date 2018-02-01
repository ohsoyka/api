const _ = require('lodash');

function normalize(object) {
  const subobjects = _.toPairs(object)
    .filter(([, value]) => value && typeof value === 'object' && Object.keys(value).includes('_id'));

  const privateProperties = Object.keys(object).filter(property => property[0] === '_');

  const clone = _.cloneDeep(object);

  clone.id = clone._id;
  privateProperties.forEach(property => delete clone[property]);

  if (!subobjects.length) {
    return clone;
  }

  subobjects.forEach(([property]) => delete clone[property]);

  return subobjects.map(([property, value]) => ({ property, value: normalize(value) }))
    .reduce((result, { property, value }) => _.merge({}, result, { [property]: value }), clone);
}

module.exports = function serialize() {
  const dataToSerialize = normalize(this.toObject());

  return dataToSerialize;
};
