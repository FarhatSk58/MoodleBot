const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getEnrolledCourses,
  getCourseTopics,
  getLearningContent,
  getTopicContent,
  submitAnswer,
  getQuestionResult,
  getMiniProjectSubmission,
  submitMiniProjectRepository,
  runJudge0Code,
  getCourseProgress,
  getTopicsByUnit,
} = require('../controllers/studentController');
const { getDsaProgress, patchDsaItem } = require('../controllers/dsaController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Apply auth + student role guard to all routes
router.use(verifyToken, authorizeRoles('student'));

// GET /api/student/courses
router.get('/courses', getEnrolledCourses);

// GET /api/student/learning
router.get('/learning', getLearningContent);

// GET /api/student/courses/:courseId/topics
router.get('/courses/:courseId/topics', getCourseTopics);

// GET /api/student/topics/:topicId
router.get('/topics/:topicId', getTopicContent);

// GET /api/student/topics/:topicId/mini-project/submission
router.get('/topics/:topicId/mini-project/submission', getMiniProjectSubmission);

// POST /api/student/topics/:topicId/mini-project/submit
router.post(
  '/topics/:topicId/mini-project/submit',
  [
    body('repoUrl')
      .trim()
      .notEmpty()
      .withMessage('Repository URL is required')
      .custom((value) => value.startsWith('https://github.com/'))
      .withMessage('Repository URL must start with https://github.com/'),
  ],
  validate,
  submitMiniProjectRepository
);

// POST /api/student/topics/:topicId/questions/:questionId/answer
router.post(
  '/topics/:topicId/questions/:questionId/answer',
  [
    body('answerText').trim().notEmpty().withMessage('Answer text is required'),
  ],
  validate,
  submitAnswer
);

// GET /api/student/topics/:topicId/questions/:questionId/result
router.get('/topics/:topicId/questions/:questionId/result', getQuestionResult);

// POST /api/student/judge0/run
router.post(
  '/judge0/run',
  [
    body('code').trim().notEmpty().withMessage('Code is required'),
    body('languageId').isInt().withMessage('languageId must be a valid Judge0 language id'),
  ],
  validate,
  runJudge0Code
);

// GET /api/student/progress/:courseId
router.get('/progress/:courseId', getCourseProgress);

// GET /api/student/courses/:courseId/topics/by-unit
router.get('/courses/:courseId/topics/by-unit', getTopicsByUnit);

// DSA sheet progress
// GET /api/student/dsa/progress
router.get('/dsa/progress', getDsaProgress);
// PATCH /api/student/dsa/items
router.patch(
  '/dsa/items',
  [
    body('itemKey').trim().notEmpty().withMessage('itemKey is required'),
    body('solved').optional().isBoolean().withMessage('solved must be a boolean'),
    body('revision').optional().isBoolean().withMessage('revision must be a boolean'),
  ],
  validate,
  patchDsaItem
);

module.exports = router;
