const Case = require('case');
const _ = require('lodash');

function populationStringToObject(string) {
  const firstDotIndex = string.indexOf('.');
  const parentProperty = string.includes('.') ? string.slice(0, firstDotIndex) : string;

  const result = {
    path: Case.camel(parentProperty),
  };

  if (!string.includes('.')) {
    return result;
  }

  const restProperties = string.slice(firstDotIndex + 1);

  return Object.assign({}, result, {
    populate: populationStringToObject(restProperties),
  });
}

module.exports = (populationString) => {
  if (!populationString) {
    return [];
  }

  const itemsToPopulate = populationString.split(',').map(item => item.trim());
  const populationArray = itemsToPopulate.map(item => populationStringToObject(item));
  const itemsGroupedByTopLevelPath = populationArray.reduce((result, item) => {
    const { path } = item;

    if (result[path]) {
      result[path].push(item);
    }

    return Object.assign({ [path]: [item] }, result);
  }, {});

  const populationObjects = Object.values(itemsGroupedByTopLevelPath)
    .map(array => array.reduce((result, item) => _.merge({}, result, item), {}));

  return populationObjects;
};

