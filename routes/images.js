const express = require('express');
const Busboy = require('busboy');
const routeProtector = require('../middlewares/route-protector');
const errorHandler = require('../middlewares/error-handler');
const uploadImage = require('../utils/upload-image');
const createImage = require('../utils/create-image');

const router = express.Router();

function manageUpload(req, onFile) {
  return new Promise((resolve, reject) => {
    const busboy = new Busboy({ headers: req.headers });

    busboy.on('file', (fieldname, file, filename, encoding, mimeType) => {
      onFile(file, filename, mimeType);
    });

    busboy.on('finish', () => resolve());
    busboy.on('error', error => reject(error));

    req.pipe(busboy);
  });
}

router.post('/', routeProtector, (req, res, next) => {
  const uploads = [];

  manageUpload(req, (file, filename, mimeType) => {
    const uploadPromise = createImage({ file, filename, mimeType });

    uploads.push(uploadPromise);
  })
    .then(() => Promise.all(uploads))
    .then(images => Promise.all(images.map(image => image.serialize())))
    .then(images => res.json(images))
    .catch(next);
});

router.post('/froala', routeProtector, (req, res, next) => {
  let uploadPromise;

  manageUpload(req, (file, filename, mimeType) => {
    uploadPromise = uploadImage({
      file,
      filename,
      mimeType,
      size: 'large',
    });
  })
    .then(() => uploadPromise)
    .then(imageLink => res.json({ link: imageLink }))
    .catch(next);
});

router.use(errorHandler);

module.exports = router;
