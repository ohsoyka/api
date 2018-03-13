const uuid = require('uuid');
const uploadImage = require('./upload-image');
const models = require('../models');

const sizes = ['original', 'large', 'medium', 'small'];

module.exports = ({ file, filename, mimeType }) => {
  const id = uuid.v4();

  return Promise.all(sizes.map(size => uploadImage({
    file,
    filename,
    id,
    mimeType,
    size,
  })
    .then(url => ({ url, size }))))
    .then((uploadResult) => {
      const imageObject = uploadResult.reduce((result, { url, size }) =>
        ({ ...result, [size]: url }), { _id: id });

      return models.image.create(imageObject);
    });
};
