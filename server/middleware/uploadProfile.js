const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'lms_profiles',
    resource_type: 'auto',
    allowed_formats: null,
  },
});

module.exports = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});
