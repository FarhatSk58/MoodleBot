const Job = require('../../models/jobs/Job');
const JobApplication = require('../../models/jobs/JobApplication');
const JobAnnouncement = require('../../models/jobs/JobAnnouncement');
const { sendSuccess, sendError } = require('../../utils/responseHelper');

/**
 * @desc    Create a new job posting
 * @route   POST /api/jobs
 * @access  Private (Teacher)
 */
const createJob = async (req, res) => {
  try {
    const { companyName, role, applyLink, deadline } = req.body;
    const deadlineDate = deadline ? new Date(deadline) : null;
    if (!deadlineDate || Number.isNaN(deadlineDate.getTime())) {
      return sendError(res, 400, 'A valid deadline is required.');
    }

    const job = await Job.create({
      companyName,
      role,
      applyLink,
      deadline: deadlineDate,
      createdBy: req.user._id,
    });

    return sendSuccess(res, 201, 'Job created successfully', job);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

/**
 * @desc    Get all jobs created by the teacher
 * @route   GET /api/jobs/teacher
 * @access  Private (Teacher)
 */
const getTeacherJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    
    // Enrich with registration counts
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const registrationCount = await JobApplication.countDocuments({ jobId: job._id });
        return { ...job.toObject(), registrationCount };
      })
    );

    return sendSuccess(res, 200, 'Teacher jobs fetched', jobsWithCounts);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

/**
 * @desc    Get job detail (metadata + students + announcements)
 * @route   GET /api/jobs/:id
 * @access  Private
 */
const getJobDetail = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('createdBy', 'name');
    if (!job) return sendError(res, 404, 'Job not found');

    const announcements = await JobAnnouncement.find({ jobId: job._id }).sort({ createdAt: -1 });

    let registrations = [];
    if (req.user.role === 'teacher') {
      registrations = await JobApplication.find({ jobId: job._id })
        .populate('studentId', 'name email department year semester')
        .sort({ appliedAt: -1 });
    } else {
      // For student, just check if they are registered
      const myReg = await JobApplication.findOne({ jobId: job._id, studentId: req.user._id });
      registrations = myReg ? [myReg] : [];
    }

    return sendSuccess(res, 200, 'Job details fetched', {
      job,
      announcements,
      registrations,
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

/**
 * @desc    Add announcement to a job
 * @route   POST /api/jobs/:id/announcement
 * @access  Private (Teacher)
 */
const addAnnouncement = async (req, res) => {
  try {
    const { message } = req.body;
    const jobId = req.params.id;

    const job = await Job.findOne({ _id: jobId, createdBy: req.user._id });
    if (!job) return sendError(res, 403, 'Unauthorized or job not found');

    const announcement = await JobAnnouncement.create({ jobId, message });

    return sendSuccess(res, 201, 'Announcement added', announcement);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

/**
 * @desc    Get all available jobs for students
 * @route   GET /api/jobs
 * @access  Private (Student)
 */
const getStudentJobs = async (req, res) => {
  try {
    const jobs = await Job.find({}).sort({ deadline: 1 });
    
    // Check which ones the student has registered for
    const myRegistrations = await JobApplication.find({ studentId: req.user._id }).select('jobId');
    const registeredJobIds = new Set(myRegistrations.map(r => r.jobId.toString()));

    const enrichedJobs = jobs.map(job => ({
      ...job.toObject(),
      isRegistered: registeredJobIds.has(job._id.toString())
    }));

    return sendSuccess(res, 200, 'Jobs board fetched', enrichedJobs);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

/**
 * @desc    Register for a job
 * @route   POST /api/jobs/:id/register
 * @access  Private (Student)
 */
const registerJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const studentId = req.user._id;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) return sendError(res, 404, 'Job not found');

    // Prevent duplicates
    const existing = await JobApplication.findOne({ jobId, studentId });
    if (existing) return sendError(res, 400, 'You are already registered for this job');

    const app = await JobApplication.create({ jobId, studentId });

    return sendSuccess(res, 201, 'Successfully registered for job', app);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = {
  createJob,
  getTeacherJobs,
  getJobDetail,
  addAnnouncement,
  getStudentJobs,
  registerJob,
};
