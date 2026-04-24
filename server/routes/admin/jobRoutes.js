const express = require('express');
const router = express.Router();
const {
  createJob,
  getTeacherJobs,
  getJobDetail,
  addAnnouncement,
  getStudentJobs,
  registerJob,
} = require('../../controllers/admin/jobController');
const { verifyToken, authorizeRoles } = require('../../middleware/auth');

// All job routes require auth
router.use(verifyToken);

// Teacher-only routes
router.post('/', authorizeRoles('teacher'), createJob);
router.get('/teacher', authorizeRoles('teacher'), getTeacherJobs);
router.post('/:id/announcement', authorizeRoles('teacher'), addAnnouncement);

// Student-only routes
router.get('/student', authorizeRoles('student'), getStudentJobs);
router.post('/:id/register', authorizeRoles('student'), registerJob);

// Shared routes
router.get('/:id', getJobDetail);

module.exports = router;
