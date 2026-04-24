const Course = require('../../models/curriculum/Course');
const Topic = require('../../models/curriculum/Topic');
const AIContent = require('../../models/curriculum/AIContent');
const User = require('../../models/identity/User');
const StudentProgress = require('../../models/progress/StudentProgress');
const { sendSuccess, sendError } = require('../../utils/responseHelper');

const assignCourseToMatchingStudents = async (course) => {
  const courseDepartments = Array.from(
    new Set([course.department, ...(course.departments || [])].filter(Boolean))
  );

  const matchingStudents = await User.find({
    role: 'student',
    department: { $in: courseDepartments },
    year: course.year,
    semester: course.semester,
  });

  let enrolledCount = 0;
  let skippedCount = 0;

  for (const student of matchingStudents) {
    const alreadyEnrolled = student.enrolledCourses
      .map((id) => id.toString())
      .includes(course._id.toString());

    if (alreadyEnrolled) {
      skippedCount++;
      continue;
    }

    student.enrolledCourses.push(course._id);
    await student.save();

    await StudentProgress.findOneAndUpdate(
      { studentId: student._id, courseId: course._id },
      { studentId: student._id, courseId: course._id },
      { upsert: true, new: true }
    );

    enrolledCount++;
  }

  return {
    enrolled: enrolledCount,
    skipped: skippedCount,
    total: matchingStudents.length,
  };
};

// ─────────────────────────────────────────────
// POST /api/admin/courses
// ─────────────────────────────────────────────
const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      courseCode,
      department,
      departments,
      year,
      semester,
      assignedTeacherId,
      sections,
      credits,
      category,
      lectureTutorial,
      courseType,
      prerequisites,
      continuousEvaluation,
      semesterEndExamination,
      totalMarks,
      status,
    } = req.body;

    // Verify teacher exists and has teacher role
    const teacher = await User.findById(assignedTeacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return sendError(res, 400, 'Invalid teacher ID — user not found or not a teacher.');
    }

    const course = new Course({
      title,
      description,
      courseCode,
      department: department || departments?.[0] || '',
      departments,
      year,
      semester,
      sections,
      credits,
      category,
      lectureTutorial,
      courseType,
      prerequisites,
      continuousEvaluation,
      semesterEndExamination,
      totalMarks,
      status,
      assignedTeacher: assignedTeacherId,
      createdBy: req.user._id,
    });

    await course.save();
    const enrollmentSummary = await assignCourseToMatchingStudents(course);

    return sendSuccess(res, 201, 'Course created successfully.', {
      course,
      enrollmentSummary,
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────────
// GET /api/admin/courses
// ─────────────────────────────────────────────
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('assignedTeacher', 'name email')
      .lean();

    const result = courses.map((course) => ({
      ...course,
      topicCount: course.topics ? course.topics.length : 0,
    }));

    return sendSuccess(res, 200, 'Courses fetched successfully.', result);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId)
      .populate('assignedTeacher', 'name email')
      .lean();

    if (!course) return sendError(res, 404, 'Course not found.');

    return sendSuccess(res, 200, 'Course fetched successfully.', course);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────────
// PATCH /api/admin/courses/:courseId
// ─────────────────────────────────────────────
const updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const {
      title,
      description,
      courseCode,
      department,
      departments,
      year,
      semester,
      sections,
      credits,
      category,
      lectureTutorial,
      courseType,
      prerequisites,
      continuousEvaluation,
      semesterEndExamination,
      totalMarks,
      status,
      assignedTeacherId,
    } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (courseCode !== undefined) updateData.courseCode = courseCode;
    if (department !== undefined) updateData.department = department;
    if (departments !== undefined) updateData.departments = departments;
    if (year !== undefined) updateData.year = year;
    if (semester !== undefined) updateData.semester = semester;
    if (sections !== undefined) updateData.sections = sections;
    if (credits !== undefined) updateData.credits = credits;
    if (category !== undefined) updateData.category = category;
    if (lectureTutorial !== undefined) updateData.lectureTutorial = lectureTutorial;
    if (courseType !== undefined) updateData.courseType = courseType;
    if (prerequisites !== undefined) updateData.prerequisites = prerequisites;
    if (continuousEvaluation !== undefined) updateData.continuousEvaluation = continuousEvaluation;
    if (semesterEndExamination !== undefined) updateData.semesterEndExamination = semesterEndExamination;
    if (totalMarks !== undefined) updateData.totalMarks = totalMarks;
    if (status !== undefined) updateData.status = status;

    if (assignedTeacherId) {
      const teacher = await User.findById(assignedTeacherId);
      if (!teacher || teacher.role !== 'teacher') {
        return sendError(res, 400, 'Invalid teacher ID.');
      }
      updateData.assignedTeacher = assignedTeacherId;
    }

    const course = await Course.findByIdAndUpdate(courseId, updateData, {
      new: true,
      runValidators: true,
    }).populate('assignedTeacher', 'name email');

    if (!course) return sendError(res, 404, 'Course not found.');
    return sendSuccess(res, 200, 'Course updated successfully.', course);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────────
// DELETE /api/admin/courses/:courseId
// ─────────────────────────────────────────────
const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) return sendError(res, 404, 'Course not found.');

    // Delete all AIContent for topics in this course
    const topicIds = course.topics;
    if (topicIds.length > 0) {
      await AIContent.deleteMany({ topicId: { $in: topicIds } });
      await Topic.deleteMany({ _id: { $in: topicIds } });
    }

    await Course.findByIdAndDelete(courseId);

    return sendSuccess(res, 200, 'Course and all related data deleted successfully.', null);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────────
// POST /api/admin/courses/:courseId/topics
// ─────────────────────────────────────────────
const addTopic = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, syllabusOrder } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return sendError(res, 404, 'Course not found.');

    const topic = new Topic({ title, syllabusOrder, courseId });
    await topic.save();

    course.topics.push(topic._id);
    await course.save();

    return sendSuccess(res, 201, 'Topic added successfully.', topic);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────────
// GET /api/admin/users
// ─────────────────────────────────────────────
const getUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) {
      filter.role = req.query.role;
    }

    const users = await User.find(filter).lean();
    return sendSuccess(res, 200, 'Users fetched successfully.', users);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────────
// PATCH /api/admin/users/:userId/enroll
// ─────────────────────────────────────────────
const enrollStudent = async (req, res) => {
  try {
    const { userId } = req.params;
    const { courseId } = req.body;

    const student = await User.findById(userId);
    if (!student || student.role !== 'student') {
      return sendError(res, 404, 'Student not found.');
    }

    const course = await Course.findById(courseId);
    if (!course) return sendError(res, 404, 'Course not found.');

    // Prevent duplicate enrollment
    if (student.enrolledCourses.includes(courseId)) {
      return sendError(res, 400, 'Student is already enrolled in this course.');
    }

    student.enrolledCourses.push(courseId);
    await student.save();

    // Create StudentProgress document for this student + course
    await StudentProgress.findOneAndUpdate(
      { studentId: userId, courseId },
      { studentId: userId, courseId },
      { upsert: true, new: true }
    );

    return sendSuccess(res, 200, 'Student enrolled successfully.', {
      studentId: userId,
      courseId,
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────────
// DELETE /api/admin/users/:userId
// ─────────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);
    if (!user) return sendError(res, 404, 'User not found.');

    return sendSuccess(res, 200, 'User deleted successfully.', null);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────────
// POST /api/admin/courses/:courseId/auto-enroll-batch
// Finds all students whose dept+year+semester matches the course
// ─────────────────────────────────────────────
const autoEnrollBatch = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) return sendError(res, 404, 'Course not found.');
    const summary = await assignCourseToMatchingStudents(course);

    return sendSuccess(res, 200,
      `Auto-enrollment complete. ${summary.enrolled} enrolled, ${summary.skipped} already enrolled.`,
      summary
    );
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = {
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
};
