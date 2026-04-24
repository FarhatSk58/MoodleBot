const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getEnrolledCourses,
  getStudentDashboard,
  getCourseTopics,
  getLearningContent,
  getTopicContent,
  submitAnswer,
  getQuestionResult,
  runLocalCode,
  getCourseProgress,
  getTopicsByUnit,
  runPistonCode,
  runPistonExecute,
  submitTaskScore,
  getSqlProgress,
  markSqlSolved,
  unmarkSqlSolved,
  getProgressOverview,
  getInterviews,
  getInterviewById,
  startInterview,
  openInterviewSession,
  interviewTurn,
  endInterviewSessionEarly,
  generateAiInterviewFeedback,
} = require('../../controllers/student/studentController');
const { getDsaProgress, patchDsaItem } = require('../../controllers/student/dsaController');
const { verifyToken, authorizeRoles } = require('../../middleware/auth');
const validate = require('../../middleware/validate');

// Apply auth + student role guard to all routes
router.use(verifyToken, authorizeRoles('student'));

// GET /api/student/dashboard
router.get('/dashboard', getStudentDashboard);

// GET /api/student/courses
router.get('/courses', getEnrolledCourses);

// GET /api/student/learning
router.get('/learning', getLearningContent);

// GET /api/student/courses/:courseId/topics
router.get('/courses/:courseId/topics', getCourseTopics);

// GET /api/student/topics/:topicId
router.get('/topics/:topicId', getTopicContent);

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

// POST /api/student/run-code (generic local run)
router.post(
  '/run-code',
  [
    body('code').trim().notEmpty().withMessage('Code is required'),
    body('language').trim().notEmpty().withMessage('Language is required'),
  ],
  validate,
  runLocalCode
);

// POST /api/student/code/execute (single run — stdout/stderr for IDE "Run Code")
router.post(
  '/code/execute',
  [
    body('code').trim().notEmpty().withMessage('Code is required'),
    body('language').trim().notEmpty().withMessage('Language is required'),
  ],
  validate,
  runPistonExecute
);

// POST /api/student/code/run (Piston execution for tasks)
router.post(
  '/code/run',
  [
    body('code').trim().notEmpty().withMessage('Code is required'),
    body('language').trim().notEmpty().withMessage('Language is required'),
    body('testCases').isArray().withMessage('testCases must be an array'),
  ],
  validate,
  runPistonCode
);

// POST /api/student/topics/:topicId/tasks/:taskIndex/score
router.post(
  '/topics/:topicId/tasks/:taskIndex/score',
  [
    body('score').isNumeric().withMessage('Score must be a number'),
  ],
  validate,
  submitTaskScore
);

// GET /api/student/progress/:courseId
router.get('/progress/:courseId', getCourseProgress);

// GET /api/student/courses/:courseId/topics/by-unit
router.get('/courses/:courseId/topics/by-unit', getTopicsByUnit);

// Progress overview dashboard
// GET /api/student/progress/overview
router.get('/progress/overview', getProgressOverview);

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

// SQL practice progress
// GET /api/student/sql/progress
router.get('/sql/progress', getSqlProgress);
// POST /api/student/sql/solve
router.post(
  '/sql/solve',
  [
    body('problemId').trim().notEmpty().withMessage('problemId is required'),
    body('topic').trim().notEmpty().withMessage('topic is required'),
    body('difficulty').trim().notEmpty().withMessage('difficulty is required'),
  ],
  validate,
  markSqlSolved
);
// DELETE /api/student/sql/solve/:problemId
router.delete('/sql/solve/:problemId', unmarkSqlSolved);

// ==========================================
// AI Mock Interviews
// ==========================================
// GET /api/student/interviews/:interviewId
router.get('/interviews/:interviewId', getInterviewById);

// POST /api/student/interviews/:interviewId/open
router.post('/interviews/:interviewId/open', openInterviewSession);

// POST /api/student/interviews/:interviewId/turn
router.post(
  '/interviews/:interviewId/turn',
  [body('userText').optional()],
  validate,
  interviewTurn
);

// POST /api/student/interviews/:interviewId/end-early
router.post('/interviews/:interviewId/end-early', endInterviewSessionEarly);

// GET /api/student/interviews
router.get('/interviews', getInterviews);

// POST /api/student/interviews
router.post(
  '/interviews',
  [
    body('domain').trim().notEmpty().withMessage('Domain is required'),
    body('duration').isNumeric().withMessage('Duration is required and must be a number'),
  ],
  validate,
  startInterview
);

// POST /api/student/interviews/generate-feedback
router.post(
  '/interviews/generate-feedback',
  [
    body('interviewId').trim().notEmpty().withMessage('Interview ID is required'),
    body('transcript').optional(),
  ],
  validate,
  generateAiInterviewFeedback
);

module.exports = router;
