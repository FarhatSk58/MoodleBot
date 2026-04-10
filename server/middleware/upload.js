const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'lms_materials',
    resource_type: 'auto', // Accept any file type (pdf, docx, images, etc.)
    allowed_formats: null, // Allow all formats
  },
});

// Multer config — max file size: 50MB
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

module.exports = upload;
