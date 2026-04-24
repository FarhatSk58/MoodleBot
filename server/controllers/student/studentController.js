const Course = require('../../models/curriculum/Course');
const Topic = require('../../models/curriculum/Topic');
const AIContent = require('../../models/curriculum/AIContent');
const StudentAnswer = require('../../models/interviews/StudentAnswer');
const StudentProgress = require('../../models/progress/StudentProgress');
const DsaProgress = require('../../models/progress/DsaProgress');
const SQLProgress = require('../../models/progress/SQLProgress');
const Interview = require('../../models/interviews/Interview');
const User = require('../../models/identity/User');
const { sendSuccess, sendError } = require('../../utils/responseHelper');
const {
  scoreAnswer,
  generateInterviewFeedback,
  generateInterviewOpening,
  generateInterviewNextTurn,
} = require('../../../ai-processing');

function formatInterviewMessagesTranscript(messages) {
  if (!Array.isArray(messages)) return '';
  return messages
    .map((m) => {
      const label = m.role === 'interviewer' ? 'Interviewer' : 'Candidate';
      return `${label}: ${m.content || ''}`;
    })
    .join('\n\n');
}
const fetch = require('node-fetch');
const { executeCode } = require('../../utils/localExecutor');
const { SHEET_SECTIONS } = require('../../data/dsaSheet');
const { SQL_PROBLEMS } = require('../../data/sqlProblems');

const round1 = (n) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return 0;
  return Number(num.toFixed(1));
};

const clamp0100 = (n) => Math.max(0, Math.min(100, Number(n) || 0));

const percent = (solved, total) => {
  const s = Number(solved) || 0;
  const t = Number(total) || 0;
  if (t <= 0) return 0;
  return clamp0100(Math.round((s / t) * 100));
};

const score0to10 = (solved, total) => {
  const s = Number(solved) || 0;
  const t = Number(total) || 0;
  if (t <= 0) return 0;
  return round1((s / t) * 10);
};

const slugify = (value) => String(value || '')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

const makeDsaItemKey = ({ sectionId, groupId, item, itemIndex }) => {
  const raw = (item && item.id) || slugify(item && item.title) || String(itemIndex + 1);
  return `${sectionId}::${groupId}::${raw}`;
};

const buildDsaItemsFlat = () => {
  const items = [];
  const seenKeys = new Map();

  for (let sectionIndex = 0; sectionIndex < (SHEET_SECTIONS || []).length; sectionIndex += 1) {
    const section = SHEET_SECTIONS[sectionIndex];
    const sectionId = section?.id || `section-${sectionIndex + 1}`;
    const sectionTitle = section?.title || `Section ${sectionIndex + 1}`;
    const groups = Array.isArray(section?.groups) ? section.groups : [];

    for (let groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
      const group = groups[groupIndex];
      const groupId = group?.id || `group-${groupIndex + 1}`;
      const groupItems = Array.isArray(group?.items) ? group.items : [];

      for (let itemIndex = 0; itemIndex < groupItems.length; itemIndex += 1) {
        const item = groupItems[itemIndex];
        let itemKey = makeDsaItemKey({ sectionId, groupId, item, itemIndex });

        if (seenKeys.has(itemKey)) {
          const next = (seenKeys.get(itemKey) || 1) + 1;
          seenKeys.set(itemKey, next);
          itemKey = `${itemKey}__dup${next}`;
        } else {
          seenKeys.set(itemKey, 1);
        }

        items.push({
          itemKey,
          sectionTitle,
          difficulty: item?.difficulty || 'easy',
        });
      }
    }
  }

  return items;
};

const computeDsaDashboard = (solvedKeys) => {
  const solvedSet = new Set(Array.isArray(solvedKeys) ? solvedKeys : []);
  const flat = buildDsaItemsFlat();

  const total = flat.length;
  const solved = flat.reduce((acc, item) => (solvedSet.has(item.itemKey) ? acc + 1 : acc), 0);

  const byTopic = new Map();
  const byDiff = new Map([
    ['easy', { solved: 0, total: 0 }],
    ['medium', { solved: 0, total: 0 }],
    ['hard', { solved: 0, total: 0 }],
  ]);

  for (const item of flat) {
    const tKey = item.sectionTitle || 'Topic';
    const diff = String(item.difficulty || 'easy').toLowerCase();

    if (!byTopic.has(tKey)) byTopic.set(tKey, { solved: 0, total: 0 });
    const topicRow = byTopic.get(tKey);
    topicRow.total += 1;
    if (solvedSet.has(item.itemKey)) topicRow.solved += 1;

    const diffRow = byDiff.get(diff) || byDiff.get('easy');
    diffRow.total += 1;
    if (solvedSet.has(item.itemKey)) diffRow.solved += 1;
  }

  const topicBreakdown = Array.from(byTopic.entries())
    .map(([topic, row]) => ({
      topic,
      solved: row.solved,
      total: row.total,
      percentage: percent(row.solved, row.total),
    }))
    .sort((a, b) => a.percentage - b.percentage);

  const weakTopics = topicBreakdown.filter((t) => t.percentage < 30).map((t) => t.topic);

  return {
    score: score0to10(solved, total),
    solved,
    total,
    topicBreakdown,
    weakTopics,
    easyStats: byDiff.get('easy'),
    mediumStats: byDiff.get('medium'),
    hardStats: byDiff.get('hard'),
  };
};

const computeSqlDashboard = (solvedProblems) => {
  const solvedArr = Array.isArray(solvedProblems) ? solvedProblems : [];
  const solvedSet = new Set(solvedArr.map((p) => p?.problemId).filter(Boolean));

  const total = (SQL_PROBLEMS || []).length;
  const solved = (SQL_PROBLEMS || []).reduce((acc, p) => (solvedSet.has(p.id) ? acc + 1 : acc), 0);

  const byTopic = new Map();
  const byDiff = new Map([
    ['easy', { solved: 0, total: 0 }],
    ['medium', { solved: 0, total: 0 }],
    ['hard', { solved: 0, total: 0 }],
  ]);

  for (const p of (SQL_PROBLEMS || [])) {
    const tKey = p.topic || 'Topic';
    if (!byTopic.has(tKey)) byTopic.set(tKey, { solved: 0, total: 0 });
    const row = byTopic.get(tKey);
    row.total += 1;
    if (solvedSet.has(p.id)) row.solved += 1;

    const diff = String(p.difficulty || 'easy').toLowerCase();
    const diffRow = byDiff.get(diff) || byDiff.get('easy');
    diffRow.total += 1;
    if (solvedSet.has(p.id)) diffRow.solved += 1;
  }

  const topicBreakdown = Array.from(byTopic.entries())
    .map(([topic, row]) => ({
      topic,
      solved: row.solved,
      total: row.total,
      percentage: percent(row.solved, row.total),
    }))
    .sort((a, b) => a.percentage - b.percentage);

  const weakTopics = topicBreakdown.filter((t) => t.percentage < 30).map((t) => t.topic);

  return {
    score: score0to10(solved, total),
    solved,
    total,
    topicBreakdown,
    weakTopics,
    easyStats: byDiff.get('easy'),
    mediumStats: byDiff.get('medium'),
    hardStats: byDiff.get('hard'),
  };
};

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

// Code Execution Logic (Internal)
const runSingleExecution = async (code, language, stdin = '') => {
  try {
    const result = await executeCode(language, code, stdin);
    return result;
  } catch (error) {
    throw new Error(error.message || 'Execution failed.');
  }
};

// ─────────────────────────────────────────────
// GET /api/student/courses
// ─────────────────────────────────────────────
// -------------------------------------------------------------------
// GET /api/student/dashboard
// Consolidated dashboard payload for student dashboard UI.
// -------------------------------------------------------------------
const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user?._id;
    if (!studentId) return sendError(res, 401, 'Unauthorized.');

    const [student, dsaDoc, sqlDoc, completedInterviews] = await Promise.all([
      User.findById(studentId).lean(),
      DsaProgress.findOne({ studentId }).lean(),
      SQLProgress.findOne({ studentId }).lean(),
      Interview.find({ userId: studentId, status: 'completed' }).select('score').lean(),
    ]);

    if (!student) return sendError(res, 404, 'Student not found.');

    const courses = await Course.find({
      year: student.year,
      semester: student.semester,
      $or: [{ department: student.department }, { departments: student.department }],
    })
      .select('_id title')
      .lean();

    const courseIds = courses.map((c) => c._id);

    const publishedTopics = await Topic.find({ courseId: { $in: courseIds }, aiStatus: 'published' })
      .select('_id courseId aiContent')
      .populate('aiContent', 'importance_score interview_questions')
      .lean();

    const topicIds = publishedTopics.map((t) => t._id);
    const topicMetaById = new Map();
    let totalQuestionsAvailable = 0;

    for (const t of publishedTopics) {
      const importance = Number(t?.aiContent?.importance_score || 5);
      const questionCount = Array.isArray(t?.aiContent?.interview_questions) ? t.aiContent.interview_questions.length : 0;
      totalQuestionsAvailable += questionCount;
      topicMetaById.set(String(t._id), {
        courseId: String(t.courseId),
        importance: Number.isFinite(importance) && importance > 0 ? importance : 5,
      });
    }

    const answers = await StudentAnswer.find({
      studentId,
      type: 'question',
      answerUnlocked: true,
      topicId: { $in: topicIds },
    })
      .select('topicId bestAttempt')
      .lean();

    const totalQuestionsAttempted = answers.length;

    let weightedSum = 0;
    let weightedDen = 0;
    const courseAgg = new Map();

    for (const ans of answers) {
      const meta = topicMetaById.get(String(ans.topicId));
      if (!meta) continue;
      const weight = meta.importance;
      const score = Number(ans?.bestAttempt?.score || 0);

      weightedSum += score * weight;
      weightedDen += weight;

      const cid = meta.courseId;
      if (!courseAgg.has(cid)) courseAgg.set(cid, { sum: 0, den: 0 });
      const row = courseAgg.get(cid);
      row.sum += score * weight;
      row.den += weight;
    }

    const coreScore = weightedDen > 0 ? round1(weightedSum / weightedDen) : 0;

    const courseTitleById = new Map(courses.map((c) => [String(c._id), c.title || 'Course']));
    const strongCourses = [];
    const weakCourses = [];

    for (const [courseId, agg] of courseAgg.entries()) {
      const avgScore = agg.den > 0 ? round1(agg.sum / agg.den) : 0;
      const row = { courseId, title: courseTitleById.get(courseId) || 'Course', avgScore };
      if (avgScore >= 7) strongCourses.push(row);
      if (avgScore < 5) weakCourses.push(row);
    }

    strongCourses.sort((a, b) => b.avgScore - a.avgScore);
    weakCourses.sort((a, b) => a.avgScore - b.avgScore);

    const mockInterviewsAttended = Array.isArray(completedInterviews) ? completedInterviews.length : 0;
    const mockInterviewAvgScore =
      mockInterviewsAttended > 0
        ? round1(completedInterviews.reduce((sum, i) => sum + Number(i?.score || 0), 0) / mockInterviewsAttended)
        : 0;

    const coreCS = {
      score: coreScore,
      totalQuestionsAttempted,
      totalQuestionsAvailable,
      strongCourses,
      weakCourses,
      mockInterviewsAttended,
      mockInterviewAvgScore,
    };

    const dsa = computeDsaDashboard(dsaDoc?.solvedKeys || []);
    const sql = computeSqlDashboard(sqlDoc?.solvedProblems || []);

    const webDev = {
      score: 0,
      completedTopics: 0,
      totalTopics: 0,
      currentRoadmap: null,
      percentageComplete: 0,
    };

    const overallScore = round1((coreCS.score * 0.40) + (dsa.score * 0.25) + (sql.score * 0.20) + (webDev.score * 0.15));

    const pillarScores = [
      { pillar: 'corecs', score: coreCS.score },
      { pillar: 'dsa', score: dsa.score },
      { pillar: 'sql', score: sql.score },
      { pillar: 'webdev', score: webDev.score },
    ].sort((a, b) => a.score - b.score);

    const lowestThree = pillarScores.slice(0, 3);

    const focusAreas = lowestThree.map((p, idx) => {
      if (p.pillar === 'dsa') {
        const weak = dsa.weakTopics?.[0] || 'your weakest topic';
        return { pillar: 'dsa', message: `You've solved ${dsa.solved} of ${dsa.total} DSA problems. Focus on ${weak}`, priority: idx + 1 };
      }
      if (p.pillar === 'sql') {
        const weak = sql.weakTopics?.[0] || 'your weakest topic';
        return { pillar: 'sql', message: `You've completed ${sql.solved} of ${sql.total} SQL problems. Work on ${weak}`, priority: idx + 1 };
      }
      if (p.pillar === 'corecs') {
        const weakest = coreCS.weakCourses?.[0] || null;
        if (weakest) {
          return { pillar: 'corecs', message: `Your weakest course is ${weakest.title} with an average score of ${weakest.avgScore}`, priority: idx + 1 };
        }
        return { pillar: 'corecs', message: 'Keep practicing Core CS interview questions to strengthen your fundamentals.', priority: idx + 1 };
      }

      if (!webDev.currentRoadmap) {
        return { pillar: 'webdev', message: "You haven't started the Web Dev roadmap yet. Pick a path to begin.", priority: idx + 1 };
      }
      return { pillar: 'webdev', message: `Your Web Dev roadmap is ${webDev.percentageComplete}% complete. Keep going.`, priority: idx + 1 };
    });

    const webDevIndex = focusAreas.findIndex((f) => f.pillar === 'webdev');
    if (webDevIndex >= 0 && webDev.score === 0 && !webDev.currentRoadmap) {
      focusAreas[webDevIndex].priority = 3;
      const others = focusAreas.filter((f) => f.pillar !== 'webdev').sort((a, b) => a.priority - b.priority);
      if (others[0]) others[0].priority = 1;
      if (others[1]) others[1].priority = 2;
      focusAreas.sort((a, b) => a.priority - b.priority);
    }

    return sendSuccess(res, 200, 'Dashboard fetched.', {
      coreCS,
      dsa,
      sql,
      webDev,
      overallScore,
      focusAreas: focusAreas.slice(0, 3),
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

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

    const taskAnswers = await StudentAnswer.find({
      studentId: req.user._id,
      topicId: { $in: topicIds },
      type: 'task',
    }).lean();

    const taskAnswersByTopic = {};
    for (const a of taskAnswers) {
      const k = a.topicId.toString();
      if (!taskAnswersByTopic[k]) taskAnswersByTopic[k] = [];
      taskAnswersByTopic[k].push(a);
    }

    const learningTopics = topics
      .filter((topic) => topic.aiContent && topic.aiContent.published)
      .map((topic) => {
        const tasksList = topic.aiContent.tasks || [];
        const ansList = taskAnswersByTopic[topic._id.toString()] || [];
        const taskProgress = tasksList.map((t, index) => {
          const taskId = t.task_id || `task-${index}`;
          const doc = ansList.find((x) => String(x.questionId) === String(taskId));
          return {
            bestScore: doc?.bestAttempt?.score ?? null,
            totalAttempts: doc?.totalAttempts ?? 0,
          };
        });

        return {
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
          taskProgress,
        };
      });

    return sendSuccess(res, 200, 'Learning content fetched successfully.', learningTopics);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// Controller for generic /run-code endpoint
const runLocalCode = async (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code || !language) {
      return sendError(res, 400, 'Code and language are required.');
    }

    const result = await executeCode(language, code);
    return sendSuccess(res, 200, 'Code executed.', result);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// -------------------------------------------------------------------
// POST /api/student/code/run
// Proxy code execution through Piston (for tasks)
// -------------------------------------------------------------------

const languageMap = {
  python: 'python',
  javascript: 'javascript',
  java: 'java',
  cpp: 'c++',
  c: 'c',
  sql: null,
};

const runPistonExecute = async (req, res) => {
  try {
    const { code, language, stdin } = req.body;
    if (!code || !language) {
      return sendError(res, 400, 'Code and language are required.');
    }

    const result = await executeCode(language, code, stdin || '');
    return sendSuccess(res, 200, 'Code executed.', result);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

const runPistonCode = async (req, res) => {
  try {
    const { code, language, testCases } = req.body;

    if (code == null || language == null || testCases == null) {
      return sendError(res, 400, 'Code, language, and testCases are required.');
    }

    if (!Array.isArray(testCases)) {
      return sendError(res, 400, 'testCases must be an array.');
    }

    const results = [];
    let totalPassed = 0;
    let totalFailed = 0;

    for (const tc of testCases) {
      let runResult;
      try {
        runResult = await executeCode(language, code, tc.input != null ? String(tc.input) : '');
      } catch (e) {
        return sendError(res, 500, `Execution error: ${e.message}`);
      }

      const stdout = runResult.stdout;
      const stderr = runResult.stderr;

      const actualOutput = stdout.trim();
      const expectedOutput = (tc.expected_output != null ? String(tc.expected_output) : '').trim();
      const passed = actualOutput === expectedOutput;

      if (passed) {
        totalPassed += 1;
      } else {
        totalFailed += 1;
      }

      results.push({
        input: tc.input != null ? String(tc.input) : '',
        expected_output: tc.expected_output != null ? String(tc.expected_output) : '',
        actual_output: actualOutput,
        passed,
        stderr,
      });
    }

    return sendSuccess(res, 200, 'Tests executed.', {
      results,
      totalPassed,
      totalFailed,
      allPassed: totalFailed === 0 && testCases.length > 0,
    });
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

    let taskProgress = [];
    const tasks = aiContent?.tasks || [];
    if (tasks.length > 0) {
      const taskAnswers = await StudentAnswer.find({
        studentId: req.user._id,
        topicId,
        type: 'task',
      }).lean();

      taskProgress = tasks.map((task, index) => {
        const taskId = task.task_id || `task-${index}`;
        const ans = taskAnswers.find((a) => String(a.questionId) === String(taskId));
        return {
          bestScore: ans?.bestAttempt?.score ?? null,
          totalAttempts: ans?.totalAttempts ?? 0,
        };
      });
    }

    return sendSuccess(res, 200, 'Topic content fetched.', {
      topic: {
        _id: topic._id,
        title: topic.title,
        syllabusOrder: topic.syllabusOrder,
        completedAt: topic.completedAt,
      },
      aiContent,
      departmentExtras,
      taskProgress,
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
      console.error('[submitAnswer] AI scoring failed:', scoringError);
      return sendError(res, 503, 'AI scoring failed. Please try again later.');
    }

    // Increment attempts and unlock answer for every submission
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
      expected_answer_outline: question.expected_answer_outline,
      answerUnlocked: true,
      totalAttempts: studentAnswer.totalAttempts,
      isBestAttempt: scoringResult.overall_score === studentAnswer.bestAttempt.score,
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────────
// Helper: Recalculate and update StudentProgress
// ─────────────────────────────────────────────
const updateStudentProgress = async (studentId, courseId, topicId) => {
  // Get all unlocked answers for this student in this topic
  const topicAnswers = await StudentAnswer.find({
    studentId,
    topicId,
    type: 'question',
    answerUnlocked: true,
  }).lean();

  const questionsAttempted = topicAnswers.length;
  const avgTopicScore =
    questionsAttempted > 0
      ? topicAnswers.reduce((sum, a) => sum + (a.bestAttempt ? a.bestAttempt.score : 0), 0) /
        questionsAttempted
      : 0;

  const topic = await Topic.findById(topicId).populate('aiContent').lean();
  const interviewQuestions = topic?.aiContent?.interview_questions || [];

  const masteryFlags = {
    easy: false,
    medium: false,
    hard: false,
  };

  for (const answer of topicAnswers) {
    if (!answer.bestAttempt) continue;
    const questionMeta = interviewQuestions.find(
      (q) => q.question_id === answer.questionId
    );
    if (!questionMeta) continue;

    const score = answer.bestAttempt.score || 0;
    if (questionMeta.difficulty === 'easy' && score >= 7) masteryFlags.easy = true;
    if (questionMeta.difficulty === 'medium' && score >= 7) masteryFlags.medium = true;
    if (questionMeta.difficulty === 'hard' && score >= 6) masteryFlags.hard = true;
  }

  let masteryStatus = 'Not Started';
  if (questionsAttempted > 0) {
    masteryStatus =
      masteryFlags.easy && masteryFlags.medium && masteryFlags.hard
        ? 'Mastered'
        : 'Partial';
  }

  // Get all published topics in this course
  const publishedTopics = await Topic.find({ courseId, aiStatus: 'published' })
    .select('_id')
    .lean();
  const publishedTopicIds = publishedTopics.map((t) => t._id.toString());

  // Get all unlocked answers for this student in this course (across all topics)
  const allCourseAnswers = await StudentAnswer.find({
    studentId,
    answerUnlocked: true,
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
    },
    { upsert: true, new: true }
  );

  const progress = await StudentProgress.findOne({ studentId, courseId });
  const topicEntry = progress.topicsAttempted.find(
    (t) => t.topicId.toString() === topicId.toString()
  );

  if (topicEntry) {
    topicEntry.questionsAttempted = questionsAttempted;
    topicEntry.averageScore = avgTopicScore;
    topicEntry.masteryStatus = masteryStatus;
    topicEntry.lastAttemptAt = new Date();
  } else {
    progress.topicsAttempted.push({
      topicId,
      questionsAttempted,
      averageScore: avgTopicScore,
      masteryStatus,
      lastAttemptAt: new Date(),
    });
  }

  progress.overallAverageScore = overallAvg;
  progress.lastActive = new Date();
  await progress.save();
};

// -------------------------------------------------------------------
// POST /api/student/topics/:topicId/tasks/:taskIndex/score
// Updates the best score for a specific task after Piston tests are run
// -------------------------------------------------------------------
const submitTaskScore = async (req, res) => {
  try {
    const { topicId, taskIndex } = req.params;
    const numericScore = Number(req.body.score);
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

    const aiContent = topic.aiContent;
    const task = aiContent?.tasks?.[taskIndex];
    if (!task) return sendError(res, 404, 'Task not found.');

    const taskId = task.task_id || `task-${taskIndex}`;

    let studentAnswer = await StudentAnswer.findOne({ studentId, topicId, questionId: taskId, type: 'task' });

    if (!studentAnswer) {
      studentAnswer = new StudentAnswer({ studentId, topicId, questionId: taskId, type: 'task' });
    }

    studentAnswer.totalAttempts += 1;
    studentAnswer.answerUnlocked = true;

    if (
      !studentAnswer.bestAttempt ||
      numericScore > (studentAnswer.bestAttempt.score || 0)
    ) {
      studentAnswer.bestAttempt = {
        score: numericScore,
        attemptedAt: new Date(),
      };
    }

    await studentAnswer.save();

    await updateStudentProgress(studentId, topic.courseId, topicId);

    return sendSuccess(res, 200, 'Task score updated successfully.', {
      score: studentAnswer.bestAttempt.score,
      totalAttempts: studentAnswer.totalAttempts,
      answerUnlocked: true,
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
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
    const answerUnlocked = !!(studentAnswer && studentAnswer.answerUnlocked);

    let bestAttempt = null;
    let expectedAnswerOutline = null;
    let score = null;
    let scoring_type = null;
    let criteria_scores = null;
    let feedback = null;

    if (answerUnlocked) {
      bestAttempt = studentAnswer.bestAttempt;
      score = bestAttempt?.score ?? null;
      scoring_type = bestAttempt?.scoringType || null;
      criteria_scores = bestAttempt?.criteriaScores || null;
      feedback = bestAttempt?.feedback || null;

      const topicWithContent = await Topic.findById(topicId).populate('aiContent');
      const aiContent = topicWithContent ? topicWithContent.aiContent : null;
      const question = aiContent
        ? aiContent.interview_questions.find((q) => q.question_id === questionId)
        : null;
      expectedAnswerOutline = question ? question.expected_answer_outline : null;
    }

    return sendSuccess(res, 200, 'Result fetched.', {
      answerUnlocked,
      totalAttempts: studentAnswer ? studentAnswer.totalAttempts : 0,
      bestAttempt: answerUnlocked ? bestAttempt : null,
      expected_answer_outline: expectedAnswerOutline,
      score,
      scoring_type,
      criteria_scores,
      feedback,
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

// -------------------------------------------------------------------
// GET /api/student/sql/progress
// -------------------------------------------------------------------
const getSqlProgress = async (req, res) => {
  try {
    const studentId = req.user?._id;
    if (!studentId) return sendError(res, 401, 'Unauthorized.');

    const doc = await SQLProgress.findOne({ studentId }).lean();
    if (!doc) {
      return sendSuccess(res, 200, 'SQL progress fetched.', { solvedProblems: [] });
    }

    return sendSuccess(res, 200, 'SQL progress fetched.', {
      solvedProblems: doc.solvedProblems || [],
      updatedAt: doc.updatedAt,
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// -------------------------------------------------------------------
// POST /api/student/sql/solve
// Body: { problemId, topic, difficulty }
// -------------------------------------------------------------------
const markSqlSolved = async (req, res) => {
  try {
    const studentId = req.user?._id;
    if (!studentId) return sendError(res, 401, 'Unauthorized.');

    const { problemId, topic, difficulty } = req.body || {};
    if (!problemId) return sendError(res, 400, 'problemId is required.');

    const doc = await SQLProgress.findOneAndUpdate(
      { studentId },
      { $setOnInsert: { studentId } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const exists = (doc.solvedProblems || []).some((p) => String(p.problemId) === String(problemId));
    if (!exists) {
      doc.solvedProblems.push({
        problemId: String(problemId),
        topic: String(topic || ''),
        difficulty: String(difficulty || ''),
        solvedAt: new Date(),
      });
      await doc.save();
    }

    return sendSuccess(res, 200, 'Problem marked as solved.', { solvedProblems: doc.solvedProblems || [] });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// -------------------------------------------------------------------
// DELETE /api/student/sql/solve/:problemId
// -------------------------------------------------------------------
const unmarkSqlSolved = async (req, res) => {
  try {
    const studentId = req.user?._id;
    if (!studentId) return sendError(res, 401, 'Unauthorized.');

    const { problemId } = req.params || {};
    if (!problemId) return sendError(res, 400, 'problemId is required.');

    const doc = await SQLProgress.findOneAndUpdate(
      { studentId },
      { $pull: { solvedProblems: { problemId: String(problemId) } } },
      { new: true }
    ).lean();

    return sendSuccess(res, 200, 'Problem unmarked.', { solvedProblems: doc?.solvedProblems || [] });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// -------------------------------------------------------------------
// GET /api/student/progress/overview
// -------------------------------------------------------------------
const getProgressOverview = async (req, res) => {
  try {
    const studentId = req.user?._id;
    if (!studentId) return sendError(res, 401, 'Unauthorized.');

    const docs = await StudentProgress.find({ studentId })
      .populate('courseId', 'title')
      .lean();

    const courses = docs.map((d) => ({
      courseId: d?.courseId?._id || d.courseId,
      title: d?.courseId?.title || 'Course',
      overallAverageScore: Number(d?.overallAverageScore || 0),
      lastActive: d?.lastActive || null,
    }));

    return sendSuccess(res, 200, 'Progress overview fetched.', { courses });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// -------------------------------------------------------------------
// GET /api/student/interviews
// -------------------------------------------------------------------
const getInterviews = async (req, res) => {
  try {
    const studentId = req.user?._id;
    if (!studentId) return sendError(res, 401, 'Unauthorized.');

    const interviews = await Interview.find({ userId: studentId })
      .sort({ createdAt: -1 })
      .lean();

    return sendSuccess(res, 200, 'Interviews fetched.', interviews);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// -------------------------------------------------------------------
// POST /api/student/interviews
// Body: { domain, duration }
// -------------------------------------------------------------------
const startInterview = async (req, res) => {
  try {
    const studentId = req.user?._id;
    if (!studentId) return sendError(res, 401, 'Unauthorized.');

    const { domain, duration, difficulty, subtopics, courseId } = req.body || {};
    if (!domain) return sendError(res, 400, 'Domain is required.');

    const topics = Array.isArray(subtopics)
      ? subtopics.map((t) => String(t).trim()).filter(Boolean)
      : [];

    const interview = await Interview.create({
      userId: studentId,
      domain: String(domain),
      duration: Number(duration) || 30,
      difficulty: difficulty ? String(difficulty) : 'medium',
      subtopics: topics,
      courseId: courseId ? courseId : null,
      type: 'ai',
      status: 'pending',
    });

    return sendSuccess(res, 201, 'Interview started.', interview);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// -------------------------------------------------------------------
// GET /api/student/interviews/:interviewId
// -------------------------------------------------------------------
const getInterviewById = async (req, res) => {
  try {
    const studentId = req.user?._id;
    if (!studentId) return sendError(res, 401, 'Unauthorized.');

    const { interviewId } = req.params;
    const interview = await Interview.findOne({ _id: interviewId, userId: studentId }).lean();
    if (!interview) return sendError(res, 404, 'Interview not found.');

    return sendSuccess(res, 200, 'Interview fetched.', interview);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// -------------------------------------------------------------------
// POST /api/student/interviews/:interviewId/open
// AI speaks first — greeting + first question
// -------------------------------------------------------------------
const openInterviewSession = async (req, res) => {
  try {
    const studentId = req.user?._id;
    if (!studentId) return sendError(res, 401, 'Unauthorized.');

    const { interviewId } = req.params;
    const interview = await Interview.findOne({ _id: interviewId, userId: studentId });
    if (!interview) return sendError(res, 404, 'Interview not found.');
    if (interview.status === 'completed') return sendError(res, 400, 'Interview already completed.');

    if (interview.status === 'in_progress' && interview.messages?.length) {
      const lastAi = [...interview.messages].reverse().find((m) => m.role === 'interviewer');
      return sendSuccess(res, 200, 'Session resumed.', {
        resumed: true,
        messages: interview.messages,
        plannedQuestionCount: interview.plannedQuestionCount,
        mainQuestionsAsked: interview.mainQuestionsAsked,
        currentAiMessage: lastAi?.content || '',
      });
    }

    const durationMinutes = Number(interview.duration) || 30;
    const plannedQuestionCount = Math.max(8, Math.min(20, Math.round(durationMinutes / 3)));
    const courseId = interview.courseId ? interview.courseId.toString() : null;

    let opening;
    try {
      opening = await generateInterviewOpening({
        domain: interview.domain,
        difficulty: interview.difficulty,
        subtopics: interview.subtopics || [],
        plannedQuestionCount,
        courseId,
      });
    } catch (aiError) {
      console.error('[openInterviewSession] AI failed:', aiError);
      return sendError(res, 503, 'Could not start the interview. Please try again.');
    }

    interview.plannedQuestionCount = plannedQuestionCount;
    interview.mainQuestionsAsked = opening.mainQuestionsAsked;
    interview.messages = [{ role: 'interviewer', content: opening.message }];
    interview.status = 'in_progress';
    await interview.save();

    return sendSuccess(res, 200, 'Interview opened.', {
      resumed: false,
      aiMessage: opening.message,
      plannedQuestionCount,
      mainQuestionsAsked: opening.mainQuestionsAsked,
      messages: interview.messages,
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// -------------------------------------------------------------------
// POST /api/student/interviews/:interviewId/turn
// Body: { userText }
// -------------------------------------------------------------------
const interviewTurn = async (req, res) => {
  try {
    const studentId = req.user?._id;
    if (!studentId) return sendError(res, 401, 'Unauthorized.');

    const { interviewId } = req.params;
    const { userText } = req.body || {};

    const interview = await Interview.findOne({ _id: interviewId, userId: studentId });
    if (!interview) return sendError(res, 404, 'Interview not found.');
    if (interview.status !== 'in_progress') {
      return sendError(res, 400, 'Interview is not active.');
    }

    const candidate = typeof userText === 'string' ? userText.trim() : '';
    const planned = interview.plannedQuestionCount || 5;

    if (!candidate) {
      const clarification = "I didn't quite catch that—could you elaborate on your thinking?";
      interview.messages.push({ role: 'candidate', content: '(no response)' });
      interview.messages.push({ role: 'interviewer', content: clarification });
      await interview.save();
      return sendSuccess(res, 200, 'Turn.', {
        aiMessage: clarification,
        interviewComplete: false,
        mainQuestionsAsked: interview.mainQuestionsAsked,
        messages: interview.messages,
      });
    }

    interview.messages.push({ role: 'candidate', content: candidate });

    const conversationTranscript = formatInterviewMessagesTranscript(interview.messages.slice(0, -1));
    const courseId = interview.courseId ? interview.courseId.toString() : null;

    let next;
    try {
      next = await generateInterviewNextTurn({
        domain: interview.domain,
        difficulty: interview.difficulty,
        subtopics: interview.subtopics || [],
        plannedQuestionCount: planned,
        mainQuestionsAskedSoFar: interview.mainQuestionsAsked,
        conversationTranscript,
        lastCandidateAnswer: candidate,
        courseId,
        coveredTopics: interview.coveredTopics || [],
      });
    } catch (aiError) {
      console.error('[interviewTurn] AI failed:', aiError);
      return sendError(res, 503, 'Could not continue the interview. Please try again.');
    }

    interview.mainQuestionsAsked = next.mainQuestionsAsked;
    interview.messages.push({ role: 'interviewer', content: next.message });

    // Track covered topics if agent reported one
    if (next.topicCovered && !interview.coveredTopics.includes(next.topicCovered)) {
      interview.coveredTopics.push(next.topicCovered);
    }

    // Log turn evaluation if agent returned one
    if (next.turnEvaluation) {
      interview.turnEvaluations.push({
        questionNumber: interview.mainQuestionsAsked,
        topic: next.turnEvaluation.topic || '',
        quality: next.turnEvaluation.quality || 'adequate',
        note: next.turnEvaluation.note || '',
      });
    }

    await interview.save();

    return sendSuccess(res, 200, 'Turn.', {
      aiMessage: next.message,
      interviewComplete: next.interviewComplete,
      mainQuestionsAsked: next.mainQuestionsAsked,
      messages: interview.messages,
      coveredTopics: interview.coveredTopics,
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// -------------------------------------------------------------------
// POST /api/student/interviews/:interviewId/end-early
// -------------------------------------------------------------------
const endInterviewSessionEarly = async (req, res) => {
  try {
    const studentId = req.user?._id;
    if (!studentId) return sendError(res, 401, 'Unauthorized.');

    const { interviewId } = req.params;
    const interview = await Interview.findOne({ _id: interviewId, userId: studentId });
    if (!interview) return sendError(res, 404, 'Interview not found.');
    if (interview.status === 'completed') return sendError(res, 400, 'Interview already completed.');
    if (!interview.messages?.length) {
      return sendError(res, 400, 'Nothing to submit yet.');
    }

    const closing =
      "Let's wrap up here. That concludes the interview for now—here's your feedback.";
    if (interview.status === 'in_progress') {
      interview.messages.push({ role: 'interviewer', content: closing });
    }

    const transcriptText =
      formatInterviewMessagesTranscript(interview.messages) ||
      String(interview.transcript || '');

    if (!transcriptText.trim()) {
      return sendError(res, 400, 'No conversation to analyze.');
    }

    let feedbackResult;
    try {
      feedbackResult = await generateInterviewFeedback({
        domain: interview.domain,
        difficulty: interview.difficulty,
        subtopics: interview.subtopics || [],
        duration: interview.duration,
        transcript: transcriptText,
        earlyEndNote: 'The session was ended before the planned question flow finished.',
        courseId: interview.courseId ? interview.courseId.toString() : null,
        turnEvaluations: interview.turnEvaluations || [],
      });
    } catch (aiError) {
      console.error('[endInterviewSessionEarly] AI feedback failed:', aiError);
      return sendError(res, 503, 'AI feedback failed. Please try again later.');
    }

    interview.transcript = transcriptText;
    interview.feedback = {
      recommendation: feedbackResult.recommendation,
      overallSummary: feedbackResult.overallSummary,
      technicalSkills: feedbackResult.technicalSkills,
      communicationSkills: feedbackResult.communicationSkills,
      strengths: feedbackResult.strengths || [],
      weaknesses: feedbackResult.weaknesses || [],
      suggestions: feedbackResult.suggestions || [],
    };
    interview.score = Number(feedbackResult.score || 0);
    interview.status = 'completed';
    await interview.save();

    return sendSuccess(res, 200, 'Interview ended.', interview);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// -------------------------------------------------------------------
// POST /api/student/interviews/generate-feedback
// Body: { interviewId, transcript? }
// -------------------------------------------------------------------
const generateAiInterviewFeedback = async (req, res) => {
  try {
    const studentId = req.user?._id;
    if (!studentId) return sendError(res, 401, 'Unauthorized.');

    const { interviewId, transcript } = req.body || {};
    if (!interviewId) return sendError(res, 400, 'Interview ID is required.');

    const interview = await Interview.findOne({ _id: interviewId, userId: studentId });
    if (!interview) return sendError(res, 404, 'Interview not found.');

    let transcriptText = transcript != null ? String(transcript).trim() : '';
    if (!transcriptText && interview.messages?.length) {
      transcriptText = formatInterviewMessagesTranscript(interview.messages);
    }
    if (!transcriptText) return sendError(res, 400, 'Transcript is required.');

    let feedbackResult;
    try {
      feedbackResult = await generateInterviewFeedback({
        domain: interview.domain,
        difficulty: interview.difficulty,
        subtopics: interview.subtopics || [],
        duration: interview.duration,
        transcript: transcriptText,
        earlyEndNote: '',
        courseId: interview.courseId ? interview.courseId.toString() : null,
        turnEvaluations: interview.turnEvaluations || [],
      });
    } catch (aiError) {
      console.error('[generateAiInterviewFeedback] AI feedback failed:', aiError);
      return sendError(res, 503, 'AI feedback failed. Please try again later.');
    }

    interview.transcript = transcriptText;
    interview.feedback = {
      recommendation: feedbackResult.recommendation,
      overallSummary: feedbackResult.overallSummary,
      technicalSkills: feedbackResult.technicalSkills,
      communicationSkills: feedbackResult.communicationSkills,
      strengths: feedbackResult.strengths || [],
      weaknesses: feedbackResult.weaknesses || [],
      suggestions: feedbackResult.suggestions || [],
    };
    interview.score = Number(feedbackResult.score || 0);
    interview.status = 'completed';

    await interview.save();

    return sendSuccess(res, 200, 'Feedback generated.', interview);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = {
  getStudentDashboard,
  getEnrolledCourses,
  getCourseTopics,
  getLearningContent,
  getTopicContent,
  submitAnswer,
  getQuestionResult,
  runLocalCode,
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
  getCourseProgress,
  getTopicsByUnit,
};
