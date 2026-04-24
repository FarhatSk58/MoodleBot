const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  uploadMaterial,
  getCourseMaterials,
  deleteMaterial,
} = require('../../controllers/teacher/materialController');
const { verifyToken, authorizeRoles } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const upload = require('../../middleware/upload');

// POST /api/materials/courses/:courseId/upload — Teacher only
router.post(
  '/courses/:courseId/upload',
  verifyToken,
  authorizeRoles('teacher'),
  upload.single('file'),
  [
    body('title').trim().notEmpty().withMessage('File title is required'),
    body('section').notEmpty().withMessage('Section is required'),
  ],
  validate,
  uploadMaterial
);

// GET /api/materials/courses/:courseId — Teacher + enrolled Students
router.get(
  '/courses/:courseId',
  verifyToken,
  authorizeRoles('teacher', 'student'),
  getCourseMaterials
);

// DELETE /api/materials/:materialId — Teacher only
router.delete(
  '/:materialId',
  verifyToken,
  authorizeRoles('teacher'),
  deleteMaterial
);

module.exports = router;
