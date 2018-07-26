const _ = require('lodash');

const isModel = value => value && typeof value === 'object' && Object.keys(value).includes('_id');
const isArrayOfModels = value => value && Array.isArray(value) && value.some(item => item._id);

function normalize(object) {
  const nestedObjects = _.toPairs(object)
    .filter(([, value]) => isModel(value) || isArrayOfModels(value));

  const privateProperties = Object.keys(object).filter(property => property[0] === '_');

  const clone = _.cloneDeep(object);

  clone.id = clone._id;
  privateProperties.forEach(property => delete clone[property]);

  nestedObjects.forEach(([property]) => delete clone[property]);

  return nestedObjects
    .map(([property, value]) => {
      if (Array.isArray(value)) {
        return {
          property,
          value: value.map(item => normalize(item)),
        };
      }

      return {
        property,
        value: normalize(value),
      };
    })
    .reduce((result, { property, value }) => _.merge({}, result, { [property]: value }), clone);
}

module.exports = function serialize() {
  const dataToSerialize = normalize(this.toObject());

  return dataToSerialize;
};
