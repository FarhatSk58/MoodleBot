const Course = require('../models/Course');
const Topic = require('../models/Topic');
const AIContent = require('../models/AIContent');
const StudentAnswer = require('../models/StudentAnswer');
const StudentProgress = require('../models/StudentProgress');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const { scoreAnswer } = require('../../ai-processing');

const canAccessCourse = (student, course) => {
  if (!student || !course) return false;

  const studentYear = String(student.year || '');
  const studentSemester = String(student.semester || '');
  const studentDepartment = String(student.department || '');
  const courseYear = String(course.year || '');
  const courseSemester = String(course.semester || '');

  const departmentMatches =
    course.department === studentDepartment ||
    (Array.isArray(course.departments) && course.departments.includes(studentDepartment));

  return studentYear === courseYear && studentSemester === courseSemester && departmentMatches;
};

const JUDGE0_SUBMISSIONS_URL = 'https://judge0-ce.p.rapidapi.com/submissions';
const JUDGE0_ALLOWED_LANGUAGES = new Set([50, 54, 62, 63, 71, 82]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getJudge0Headers = () => {
  const apiKey = process.env.JUDGE0_API_KEY;
  if (!apiKey) {
    throw new Error('JUDGE0_API_KEY is not set in environment variables.');
  }

  return {
    'Content-Type': 'application/json',
    'X-RapidAPI-Key': apiKey,
    'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
  };
};

const submitJudge0Code = async ({ code, languageId }) => {
  if (!JUDGE0_ALLOWED_LANGUAGES.has(Number(languageId))) {
    throw new Error('Unsupported Judge0 language selected.');
  }

  const submitResponse = await fetch(`${JUDGE0_SUBMISSIONS_URL}?base64_encoded=false&wait=false`, {
    method: 'POST',
    headers: getJudge0Headers(),
    body: JSON.stringify({
      source_code: code,
      language_id: Number(languageId),
    }),
  });

  if (!submitResponse.ok) {
    const errorBody = await submitResponse.text().catch(() => '');
    throw new Error(`Judge0 submit failed: ${submitResponse.status} ${errorBody}`);
  }

  const submitData = await submitResponse.json();
  const token = submitData?.token;
  if (!token) {
    throw new Error('Judge0 did not return a submission token.');
  }

  let result = null;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const pollResponse = await fetch(
      `${JUDGE0_SUBMISSIONS_URL}/${token}?base64_encoded=false&fields=stdout,stderr,compile_output,message,status,time,memory`,
      {
        headers: getJudge0Headers(),
      }
    );

    if (!pollResponse.ok) {
      const errorBody = await pollResponse.text().catch(() => '');
      throw new Error(`Judge0 poll failed: ${pollResponse.status} ${errorBody}`);
    }

    result = await pollResponse.json();
    const statusId = result?.status?.id;
    if (statusId !== 1 && statusId !== 2) {
      break;
    }

    await sleep(1500);
  }

  const stdout = result?.stdout || '';
  const stderr = result?.stderr || result?.compile_output || result?.message || '';

  return {
    stdout,
    stderr,
    status: result?.status || null,
  };
};

// ─────────────────────────────────────────────
// GET /api/student/courses
// ─────────────────────────────────────────────
const getEnrolledCourses = async (req, res) => {
  try {
    const student = await User.findById(req.user._id).lean();
    if (!student) {
      return sendError(res, 404, 'Student not found.');
    }

    const courses = await Course.find({
      year: student.year,
      semester: student.semester,
      $or: [
        { department: student.department },
        { departments: student.department },
      ],
    })
      .populate('topics', '_id')
      .lean();

    // Fetch progress for each course
    const progressDocs = await StudentProgress.find({
      studentId: req.user._id,
      courseId: { $in: courses.map((course) => course._id) },
    }).lean();

    const progressMap = {};
    progressDocs.forEach((p) => {
      progressMap[p.courseId.toString()] = p.overallAverageScore;
    });

    const result = courses.map((course) => ({
      _id: course._id,
      title: course.title,
      description: course.description,
      departments: course.departments,
      topicCount: course.topics ? course.topics.length : 0,
      overallAverageScore: progressMap[course._id.toString()] || 0,
    }));

    return sendSuccess(res, 200, 'Enrolled courses fetched.', result);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────────
// GET /api/student/courses/:courseId/topics
// ─────────────────────────────────────────────
const getCourseTopics = async (req, res) => {
  try {
    const { courseId } = req.params;

    const [student, course] = await Promise.all([
      User.findById(req.user._id).lean(),
      Course.findById(courseId).lean(),
    ]);

    if (!student || !course) {
      return sendError(res, 404, 'Course not found.');
    }

    if (!canAccessCourse(student, course)) {
      return sendError(res, 403, 'You are not enrolled in this course.');
    }

    // Only return published topics
    const topics = await Topic.find({
      courseId,
      aiStatus: 'published',
    })
      .sort({ syllabusOrder: 1 })
      .select('_id title syllabusOrder aiStatus completedAt')
      .lean();

    // Check if student has attempted any questions per topic
    const topicIds = topics.map((t) => t._id);
    const answers = await StudentAnswer.find({
      studentId: req.user._id,
      topicId: { $in: topicIds },
    })
      .select('topicId')
      .lean();

    const attemptedTopicIds = new Set(answers.map((a) => a.topicId.toString()));

    const result = topics.map((topic) => ({
      ...topic,
      hasAttempted: attemptedTopicIds.has(topic._id.toString()),
    }));

    return sendSuccess(res, 200, 'Published topics fetched.', result);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// -------------------------------------------------------------------
// GET /api/student/learning
// Returns teacher-approved AI content across the student's enrolled courses
// -------------------------------------------------------------------
const getLearningContent = async (req, res) => {
  try {
    const student = await User.findById(req.user._id).lean();
    if (!student) {
      return sendError(res, 404, 'Student not found.');
    }

    const courses = await Course.find({
      year: student.year,
      semester: student.semester,
      $or: [
        { department: student.department },
        { departments: student.department },
      ],
    })
      .select('_id title')
      .lean();

    const courseIds = courses.map((course) => course._id);
    const courseMap = new Map(courses.map((course) => [course._id.toString(), course]));

    const topics = await Topic.find({
      courseId: { $in: courseIds },
      aiStatus: 'published',
      aiContent: { $ne: null },
    })
      .sort({ syllabusOrder: 1 })
      .populate('aiContent')
      .lean();

    const topicIds = topics.map((topic) => topic._id);
    const answers = await StudentAnswer.find({
      studentId: req.user._id,
      topicId: { $in: topicIds },
    })
      .select('topicId')
      .lean();
    const attemptedTopicIds = new Set(answers.map((answer) => answer.topicId.toString()));

    const learningTopics = topics
      .filter((topic) => topic.aiContent && topic.aiContent.published)
      .map((topic) => ({
        _id: topic._id,
        title: topic.title,
        syllabusOrder: topic.syllabusOrder,
        unitNumber: topic.unitNumber || null,
        unitName: topic.unitName || null,
        completed: attemptedTopicIds.has(topic._id.toString()),
        course: courseMap.get(topic.courseId.toString())
          ? {
              _id: courseMap.get(topic.courseId.toString())._id,
              title: courseMap.get(topic.courseId.toString()).title,
            }
          : null,
        aiContent: topic.aiContent,
      }));

    return sendSuccess(res, 200, 'Learning content fetched successfully.', learningTopics);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// -------------------------------------------------------------------
// GET /api/student/topics/:topicId/mini-project/submission
// Returns the current student's repo submission for a topic, if any
// -------------------------------------------------------------------
const getMiniProjectSubmission = async (req, res) => {
  try {
    const { topicId } = req.params;
    const studentId = req.user._id;

    const topic = await Topic.findById(topicId).lean();
    if (!topic || topic.aiStatus !== 'published') {
      return sendError(res, 403, 'Topic is not published or not found.');
    }

    const [student, course] = await Promise.all([
      User.findById(studentId).lean(),
      Course.findById(topic.courseId).lean(),
    ]);

    if (!student || !course) {
      return sendError(res, 404, 'Course not found.');
    }

    if (!canAccessCourse(student, course)) {
      return sendError(res, 403, 'You are not enrolled in this course.');
    }

    const submission = await StudentAnswer.findOne({
      studentId,
      topicId,
      type: 'mini_project',
    }).lean();

    return sendSuccess(res, 200, 'Mini project submission fetched successfully.', {
      repoUrl: submission?.repoUrl || null,
      submittedAt: submission?.submittedAt || null,
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// -------------------------------------------------------------------
// POST /api/student/topics/:topicId/mini-project/submit
// Stores the student's GitHub repository URL for the mini project
// -------------------------------------------------------------------
const submitMiniProjectRepository = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { repoUrl } = req.body;
    const studentId = req.user._id;
    const normalizedRepoUrl = String(repoUrl || '').trim();

    if (!normalizedRepoUrl.startsWith('https://github.com/')) {
      return sendError(res, 400, 'Repository URL must start with https://github.com/.');
    }

    const topic = await Topic.findById(topicId).lean();
    if (!topic || topic.aiStatus !== 'published') {
      return sendError(res, 403, 'Topic is not published or not found.');
    }

    const [student, course] = await Promise.all([
      User.findById(studentId).lean(),
      Course.findById(topic.courseId).lean(),
    ]);

    if (!student || !course) {
      return sendError(res, 404, 'Course not found.');
    }

    if (!canAccessCourse(student, course)) {
      return sendError(res, 403, 'You are not enrolled in this course.');
    }

    let submission = await StudentAnswer.findOne({
      studentId,
      topicId,
      type: 'mini_project',
    });

    if (!submission) {
      submission = new StudentAnswer({
        studentId,
        topicId,
        type: 'mini_project',
        questionId: null,
      });
    }

    submission.repoUrl = normalizedRepoUrl;
    submission.submittedAt = new Date();
    await submission.save();

    return sendSuccess(res, 200, 'Mini project repository submitted successfully.', {
      repoUrl: submission.repoUrl,
      submittedAt: submission.submittedAt,
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// -------------------------------------------------------------------
// POST /api/student/judge0/run
// Proxy code execution through Judge0
// -------------------------------------------------------------------
const runJudge0Code = async (req, res) => {
  try {
    const { code, languageId } = req.body;
    const normalizedCode = String(code || '');

    if (!normalizedCode.trim()) {
      return sendError(res, 400, 'Code is required.');
    }

    const result = await submitJudge0Code({
      code: normalizedCode,
      languageId,
    });

    return sendSuccess(res, 200, 'Code executed successfully.', result);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────────
// GET /api/student/topics/:topicId
// ─────────────────────────────────────────────
const getTopicContent = async (req, res) => {
  try {
    const { topicId } = req.params;

    const topic = await Topic.findById(topicId).populate('aiContent');
    if (!topic) return sendError(res, 404, 'Topic not found.');

    if (topic.aiStatus !== 'published') {
      return sendError(res, 403, 'This topic content is not yet published.');
    }

    const [student, course] = await Promise.all([
      User.findById(req.user._id).lean(),
      Course.findById(topic.courseId).lean(),
    ]);

    if (!student || !course) {
      return sendError(res, 404, 'Course not found.');
    }

    if (!canAccessCourse(student, course)) {
      return sendError(res, 403, 'You are not enrolled in this course.');
    }

    const aiContent = topic.aiContent;
    const studentDept = student.department;

    // Return only the student's department extras
    const departmentExtras = topic.departmentExtras
      ? topic.departmentExtras[studentDept] || null
      : null;

    return sendSuccess(res, 200, 'Topic content fetched.', {
      topic: {
        _id: topic._id,
        title: topic.title,
        syllabusOrder: topic.syllabusOrder,
        completedAt: topic.completedAt,
      },
      aiContent,
      departmentExtras,
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────────
// POST /api/student/topics/:topicId/questions/:questionId/answer
// ─────────────────────────────────────────────
const submitAnswer = async (req, res) => {
  try {
    const { topicId, questionId } = req.params;
    const { answerText } = req.body;
    const studentId = req.user._id;

    const topic = await Topic.findById(topicId).populate('aiContent');
    if (!topic || topic.aiStatus !== 'published') {
      return sendError(res, 403, 'Topic is not published or not found.');
    }

    const [student, course] = await Promise.all([
      User.findById(studentId).lean(),
      Course.findById(topic.courseId).lean(),
    ]);

    if (!student || !course) {
      return sendError(res, 404, 'Course not found.');
    }

    if (!canAccessCourse(student, course)) {
      return sendError(res, 403, 'You are not enrolled in this course.');
    }

    // Find the question in AIContent
    const aiContent = topic.aiContent;
    const question = aiContent
      ? aiContent.interview_questions.find((q) => q.question_id === questionId)
      : null;
    if (!question) return sendError(res, 404, 'Question not found in AI content.');

    // Find or create a StudentAnswer document
    let studentAnswer = await StudentAnswer.findOne({ studentId, topicId, questionId, type: 'question' });

    if (!studentAnswer) {
      studentAnswer = new StudentAnswer({ studentId, topicId, questionId, type: 'question' });
    }

    // === Live AI Scoring via answerScorer ===
    let scoringResult;
    try {
      scoringResult = await scoreAnswer({
        topic: topic.title,
        question: question.question,
        difficulty: question.difficulty,
        question_type: question.type,
        expected_answer_outline: question.expected_answer_outline,
        student_answer: answerText,
      });
    } catch (scoringError) {
      console.error('[submitAnswer] AI scoring failed:', scoringError.message);
      return sendError(res, 500, 'Answer submitted but AI scoring failed. Please try again.');
    }

    // Increment attempts and unlock answer on first submission
    studentAnswer.totalAttempts += 1;
    studentAnswer.answerUnlocked = true;

    // Keep only best (highest) score
    if (
      !studentAnswer.bestAttempt ||
      scoringResult.overall_score > studentAnswer.bestAttempt.score
    ) {
      studentAnswer.bestAttempt = {
        answerText,
        score: scoringResult.overall_score,
        scoringType: scoringResult.scoring_type,
        criteriaScores: scoringResult.criteria_scores || null,
        feedback: scoringResult.feedback,
        attemptedAt: new Date(),
      };
    }

    await studentAnswer.save();

    // Update StudentProgress
    await updateStudentProgress(studentId, topic.courseId, topicId);

    return sendSuccess(res, 200, 'Answer submitted successfully.', {
      score: scoringResult.overall_score,
      scoring_type: scoringResult.scoring_type,
      criteria_scores: scoringResult.criteria_scores || null,
      feedback: scoringResult.feedback,
      totalAttempts: studentAnswer.totalAttempts,
      answerUnlocked: true,
      expected_answer_outline: question.expected_answer_outline,
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────────
// Helper: Recalculate and update StudentProgress
// ─────────────────────────────────────────────
const updateStudentProgress = async (studentId, courseId, topicId) => {
  // Get all answers for this student in this topic
  const topicAnswers = await StudentAnswer.find({ studentId, topicId }).lean();

  const questionsAttempted = topicAnswers.length;
  const avgTopicScore =
    questionsAttempted > 0
      ? topicAnswers.reduce((sum, a) => sum + (a.bestAttempt ? a.bestAttempt.score : 0), 0) /
        questionsAttempted
      : 0;

  // Get all published topics in this course
  const publishedTopics = await Topic.find({ courseId, aiStatus: 'published' }).select('_id').lean();
  const publishedTopicIds = publishedTopics.map((t) => t._id.toString());

  // Get all answers for this student in this course (across all topics)
  const allCourseAnswers = await StudentAnswer.find({
    studentId,
    topicId: { $in: publishedTopicIds },
  }).lean();

  const totalScore = allCourseAnswers.reduce(
    (sum, a) => sum + (a.bestAttempt ? a.bestAttempt.score : 0),
    0
  );
  const overallAvg = allCourseAnswers.length > 0 ? totalScore / allCourseAnswers.length : 0;

  await StudentProgress.findOneAndUpdate(
    { studentId, courseId },
    {
      $set: {
        lastActive: new Date(),
        overallAverageScore: overallAvg,
      },
      $addToSet: {}, // handled below
    },
    { upsert: true }
  );

  // Update or push topic entry in topicsAttempted
  const progress = await StudentProgress.findOne({ studentId, courseId });
  const topicEntry = progress.topicsAttempted.find(
    (t) => t.topicId.toString() === topicId.toString()
  );

  if (topicEntry) {
    topicEntry.questionsAttempted = questionsAttempted;
    topicEntry.averageScore = avgTopicScore;
    topicEntry.lastAttemptAt = new Date();
  } else {
    progress.topicsAttempted.push({
      topicId,
      questionsAttempted,
      averageScore: avgTopicScore,
      lastAttemptAt: new Date(),
    });
  }

  progress.overallAverageScore = overallAvg;
  progress.lastActive = new Date();
  await progress.save();
};

// ─────────────────────────────────────────────
// GET /api/student/topics/:topicId/questions/:questionId/result
// ─────────────────────────────────────────────
const getQuestionResult = async (req, res) => {
  try {
    const { topicId, questionId } = req.params;
    const studentId = req.user._id;

    const topic = await Topic.findById(topicId).lean();
    if (!topic) {
      return sendError(res, 404, 'Topic not found.');
    }

    const [student, course] = await Promise.all([
      User.findById(studentId).lean(),
      Course.findById(topic.courseId).lean(),
    ]);

    if (!student || !course) {
      return sendError(res, 404, 'Course not found.');
    }

    if (!canAccessCourse(student, course)) {
      return sendError(res, 403, 'You are not enrolled in this course.');
    }

    const studentAnswer = await StudentAnswer.findOne({ studentId, topicId, questionId, type: 'question' });
    if (!studentAnswer || !studentAnswer.answerUnlocked) {
      return sendError(res, 403, 'Answer not yet submitted. Submit an answer first to view results.');
    }

    // Get expected_answer_outline
    const topicWithContent = await Topic.findById(topicId).populate('aiContent');
    const aiContent = topicWithContent ? topicWithContent.aiContent : null;
    const question = aiContent
      ? aiContent.interview_questions.find((q) => q.question_id === questionId)
      : null;

    return sendSuccess(res, 200, 'Result fetched.', {
      bestAttempt: studentAnswer.bestAttempt,
      totalAttempts: studentAnswer.totalAttempts,
      answerUnlocked: true,
      expected_answer_outline: question ? question.expected_answer_outline : [],
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────────
// GET /api/student/progress/:courseId
// ─────────────────────────────────────────────
const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;

    const progress = await StudentProgress.findOne({ studentId, courseId })
      .populate('topicsAttempted.topicId', 'title syllabusOrder')
      .lean();

    if (!progress) return sendError(res, 404, 'Progress record not found.');
    return sendSuccess(res, 200, 'Progress fetched.', progress);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────────
// GET /api/student/courses/:courseId/topics/by-unit
// Returns topics grouped by unit with subtopics (for Progress page)
// ─────────────────────────────────────────────
const getTopicsByUnit = async (req, res) => {
  try {
    const { courseId } = req.params;

    const [student, course] = await Promise.all([
      User.findById(req.user._id).lean(),
      Course.findById(courseId).lean(),
    ]);

    if (!student || !course) return sendError(res, 404, 'Course not found.');
    if (!canAccessCourse(student, course)) return sendError(res, 403, 'You are not enrolled in this course.');

    // Return all topics (not just published) so students see the full syllabus structure
    const topics = await Topic.find({ courseId })
      .sort({ unitNumber: 1, syllabusOrder: 1 })
      .select('_id title unitNumber unitName syllabusOrder subtopics subtopicCompletions completedAt aiStatus')
      .lean();

    const unitMap = {};
    for (const topic of topics) {
      const uNum = topic.unitNumber || 1;
      if (!unitMap[uNum]) {
        unitMap[uNum] = {
          unit_number: uNum,
          unit_name: topic.unitName || `Unit ${uNum}`,
          topics: [],
        };
      }
      unitMap[uNum].topics.push(topic);
    }

    const units = Object.values(unitMap).sort((a, b) => a.unit_number - b.unit_number);
    return sendSuccess(res, 200, 'Topics grouped by unit.', { units });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = {
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
};
