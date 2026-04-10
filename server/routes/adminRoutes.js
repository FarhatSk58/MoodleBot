const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  addTopic,
  getUsers,
  enrollStudent,
  deleteUser,
  autoEnrollBatch,
} = require('../controllers/adminController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Apply auth + admin role guard to all routes
router.use(verifyToken, authorizeRoles('admin'));

// POST /api/admin/courses
router.post(
  '/courses',
  [
    body('title').trim().notEmpty().withMessage('Course title is required'),
    body('courseCode').optional().isString(),
    body('departments')
      .isArray({ min: 1 })
      .withMessage('At least one department is required'),
    body('year').notEmpty().withMessage('Course year is required'),
    body('semester').notEmpty().withMessage('Course semester is required'),
    body('assignedTeacherId').notEmpty().withMessage('Assigned teacher ID is required'),
  ],
  validate,
  createCourse
);

// GET /api/admin/courses
router.get('/courses', getCourses);
router.get('/courses/:courseId', getCourseById);

// PATCH /api/admin/courses/:courseId
router.patch('/courses/:courseId', updateCourse);

// DELETE /api/admin/courses/:courseId
router.delete('/courses/:courseId', deleteCourse);

// POST /api/admin/courses/:courseId/topics
router.post(
  '/courses/:courseId/topics',
  [
    body('title').trim().notEmpty().withMessage('Topic title is required'),
    body('syllabusOrder')
      .isInt({ min: 1 })
      .withMessage('Syllabus order must be a positive integer'),
  ],
  validate,
  addTopic
);

// GET /api/admin/users
router.get('/users', getUsers);

// PATCH /api/admin/users/:userId/enroll
router.patch(
  '/users/:userId/enroll',
  [body('courseId').notEmpty().withMessage('Course ID is required')],
  validate,
  enrollStudent
);

// DELETE /api/admin/users/:userId
router.delete('/users/:userId', deleteUser);

// POST /api/admin/courses/:courseId/auto-enroll-batch
router.post('/courses/:courseId/auto-enroll-batch', autoEnrollBatch);

module.exports = router;
