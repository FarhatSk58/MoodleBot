const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getMyCourses,
  getCourseById,
  getCourseTopics,
  markTopicComplete,
  markSubtopicComplete,
  getAIContent,
  approveAIContent,
  rejectAIContent,
  retriggerAIProcessing,
  updateDepartmentExtras,
  updateTopicOrder,
  parseSyllabi,
  confirmSyllabi,
  getTopicsByUnit,
  getPendingReviewTopics,
} = require('../controllers/teacherController');
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Apply auth + teacher role guard to all routes
router.use(verifyToken, authorizeRoles('teacher'));

// GET /api/teacher/courses
router.get('/courses', getMyCourses);
router.get('/courses/:courseId', getCourseById);

// GET /api/teacher/courses/:courseId/topics
router.get('/courses/:courseId/topics', getCourseTopics);

// GET /api/teacher/courses/:courseId/topics/by-unit
// IMPORTANT: must come BEFORE the generic /courses/:courseId/topics route to avoid param conflict
router.get('/courses/:courseId/topics/by-unit', getTopicsByUnit);

// PATCH /api/teacher/topics/:topicId/complete
router.patch('/topics/:topicId/complete', markTopicComplete);

// GET /api/teacher/topics/pending-review
// IMPORTANT: must come before /topics/:topicId routes that use path params
router.get('/topics/pending-review', getPendingReviewTopics);

// PATCH /api/teacher/topics/:topicId/subtopics/:index/complete
router.patch('/topics/:topicId/subtopics/:index/complete', markSubtopicComplete);

// GET /api/teacher/topics/:topicId/ai-content
router.get('/topics/:topicId/ai-content', getAIContent);

// PATCH /api/teacher/topics/:topicId/ai-content/approve
router.patch('/topics/:topicId/ai-content/approve', approveAIContent);

// PATCH /api/teacher/topics/:topicId/ai-content/reject
router.patch('/topics/:topicId/ai-content/reject', rejectAIContent);

// PATCH /api/teacher/topics/:topicId/retrigger
router.patch('/topics/:topicId/retrigger', retriggerAIProcessing);

// PATCH /api/teacher/topics/:topicId/department-extras
router.patch(
  '/topics/:topicId/department-extras',
  [
    body('department')
      .isIn(['CSE-AIML', 'CSE-DS'])
      .withMessage('Department must be CSE-AIML or CSE-DS'),
    body('notes').optional().isString(),
    body('additionalTasks').optional().isArray(),
  ],
  validate,
  updateDepartmentExtras
);

// PATCH /api/teacher/topics/:topicId/order
router.patch(
  '/topics/:topicId/order',
  [
    body('syllabusOrder')
      .isInt({ min: 1 })
      .withMessage('Syllabus order must be a positive integer'),
  ],
  validate,
  updateTopicOrder
);

// ─── Syllabi Parse / Confirm ────────────────────────────────────────────────

// POST /api/teacher/courses/:courseId/syllabi/parse
// Downloads uploaded syllabus + micro-syllabus, runs Python parser, returns preview
router.post('/courses/:courseId/syllabi/parse', parseSyllabi);

// POST /api/teacher/courses/:courseId/syllabi/confirm
// Teacher confirms the reviewed parsed structure — saves Topics to DB
router.post('/courses/:courseId/syllabi/confirm', confirmSyllabi);

module.exports = router;
