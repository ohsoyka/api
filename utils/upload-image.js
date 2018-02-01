const aws = require('aws-sdk');
const sharp = require('sharp');
const Logger = require('logger');
const uuid = require('uuid');
const mime = require('mime-types');
const sanitizeFilename = require('../helpers/sanitize-filename');
const config = require('../config').current;

const spacesEndpoint = new aws.Endpoint(config.digitalOcean.spaces.endpoint);
const s3 = new aws.S3({
  endpoint: spacesEndpoint,
});

const generateFilename = ({ filename, id, size }) => `${id}/${size}_${sanitizeFilename(filename)}`;

const SIZES = {
  large: 1920,
  medium: 1280,
  small: 800,
};

function resize(width) {
  return sharp()
    .resize(width, null)
    .withoutEnlargement();
}

module.exports = function upload({
  file, filename, id = uuid.v4(), size = 'original', mimeType = mime.lookup(filename),
}) {
  const width = SIZES[size];
  const processedFile = size === 'original' ? file.pipe(sharp()) : file.pipe(resize(width));

  return s3.upload({
    Bucket: config.digitalOcean.spaces.name,
    Key: `${config.environment}/images/${generateFilename({ filename, id, size })}`,
    Body: processedFile,
    ACL: 'public-read',
    ContentType: mimeType,
    ContentDisposition: 'inline',
  })
    .promise()
    .then(data => `${config.staticURL}/${data.Key.replace(`${config.environment}/`, '')}`)
    .catch(error => Logger.error(error));
};
