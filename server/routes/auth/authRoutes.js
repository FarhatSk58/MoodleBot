const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getMe, updateMe, uploadProfilePhoto, uploadResume } = require('../../controllers/auth/authController');
const { verifyToken } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const uploadProfile = require('../../middleware/uploadProfile');

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email')
      .isEmail()
      .withMessage('A valid email is required')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('role')
      .isIn(['admin', 'teacher', 'student'])
      .withMessage('Role must be admin, teacher, or student'),
    body('department')
      .if((value, { req }) => ['student', 'teacher'].includes(req.body.role))
      .notEmpty()
      .withMessage('Department is required')
      .isIn(['CSE-AIML', 'CSE-DS'])
      .withMessage('Department must be CSE-AIML or CSE-DS'),
    body('year')
      .if(body('role').equals('student'))
      .notEmpty()
      .withMessage('Year is required for students'),
    body('semester')
      .if(body('role').equals('student'))
      .notEmpty()
      .withMessage('Semester is required for students'),
  ],
  validate,
  register
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

// GET /api/auth/me — All logged-in users
router.get('/me', verifyToken, getMe);

router.patch(
  '/me',
  verifyToken,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('currentPassword')
      .optional()
      .isLength({ min: 8 })
      .withMessage('Current password is invalid'),
    body('newPassword')
      .optional()
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters'),
  ],
  validate,
  updateMe
);

router.post('/me/photo', verifyToken, uploadProfile.single('photo'), uploadProfilePhoto);
router.post('/me/resume', verifyToken, uploadProfile.single('resume'), uploadResume);

module.exports = router;
