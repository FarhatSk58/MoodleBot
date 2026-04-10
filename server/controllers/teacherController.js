const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const fs = require('fs').promises;
const https = require('https');
const http = require('http');

const Course = require('../models/Course');
const Topic = require('../models/Topic');
const AIContent = require('../models/AIContent');
const Material = require('../models/Material');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const cloudinary = require('../config/cloudinary');

const PARSER_SCRIPT_PATH = path.join(__dirname, '..', 'utils', 'syllabusParser.py');
const PYTHON_EXECUTABLE = process.env.PYTHON_PATH || 'python';

// ─────────────────────────────────────────────
// GET /api/teacher/courses
// ─────────────────────────────────────────────
const getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ assignedTeacher: req.user._id })
      .populate('topics')
      .lean();

    return sendSuccess(res, 200, 'Courses fetched successfully.', courses);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findOne({
      _id: courseId,
      assignedTeacher: req.user._id,
    })
      .populate('topics')
      .lean();

    if (!course) return sendError(res, 404, 'Course not found.');

    return sendSuccess(res, 200, 'Course fetched successfully.', course);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────────
// GET /api/teacher/courses/:courseId/topics
// ─────────────────────────────────────────────
const getCourseTopics = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findOne({
      _id: courseId,
      assignedTeacher: req.user._id,
    });
    if (!course) return sendError(res, 403, 'Access denied. Course not assigned to you.');

    const topics = await Topic.find({ courseId }).sort({ syllabusOrder: 1 });
    return sendSuccess(res, 200, 'Topics fetched successfully.', topics);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────────
// GET /api/teacher/topics/pending-review
// ─────────────────────────────────────────────
const getPendingReviewTopics = async (req, res) => {
  try {
    // We optionally could filter by courses assigned to req.user._id,
    // but typically pending_review is safe or we can add course filtering if required.
    // Let's filter by the user's courses to be extra safe:
    const courses = await Course.find({ assignedTeacher: req.user._id }).select('_id');
    const courseIds = courses.map(c => c._id);

    const topics = await Topic.find({ 
      aiStatus: 'pending_review',
      courseId: { $in: courseIds }
    })
      .populate('courseId', 'title')
      .lean();

    return sendSuccess(res, 200, 'Pending review topics fetched successfully.', topics);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};


// ─────────────────────────────────────────────
// PATCH /api/teacher/topics/:topicId/complete
// ─────────────────────────────────────────────
const markTopicComplete = async (req, res) => {
  try {
    const { topicId } = req.params;

    const topic = await Topic.findById(topicId);
    if (!topic) return sendError(res, 404, 'Topic not found.');

    const course = await Course.findOne({
      _id: topic.courseId,
      assignedTeacher: req.user._id,
    });
    if (!course) return sendError(res, 403, 'Access denied. Topic does not belong to your course.');

    // Toggle logic
    if (topic.completedAt) {
      topic.completedAt = null;
      if (topic.aiStatus === 'pending_ai') {
        topic.aiStatus = 'not_started';
      }
    } else {
      topic.completedAt = Date.now();
      topic.aiStatus = 'pending_ai';
    }
    
    await topic.save();

    return sendSuccess(res, 200, 'Topic completion status updated.', topic);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────────
// PATCH /api/teacher/topics/:topicId/subtopics/:index/complete
// Mark a single subtopic as complete; auto-completes topic when all done
// ─────────────────────────────────────────────
const markSubtopicComplete = async (req, res) => {
  try {
    const { topicId, index } = req.params;
    const subtopicIndex = Number(index);

    if (isNaN(subtopicIndex) || subtopicIndex < 0) {
      return sendError(res, 400, 'Invalid subtopic index.');
    }

    const topic = await Topic.findById(topicId);
    if (!topic) return sendError(res, 404, 'Topic not found.');

    const course = await Course.findOne({
      _id: topic.courseId,
      assignedTeacher: req.user._id,
    });
    if (!course) return sendError(res, 403, 'Access denied.');

    if (subtopicIndex >= topic.subtopics.length) {
      return sendError(res, 400, `Subtopic index ${subtopicIndex} is out of range.`);
    }

    // Find or create a completion entry for this subtopic
    const existing = topic.subtopicCompletions.find((sc) => sc.index === subtopicIndex);
    if (existing) {
      // Toggle: if already completed, unmark it
      if (existing.completedAt) {
        existing.completedAt = null;
      } else {
        existing.completedAt = new Date();
      }
    } else {
      topic.subtopicCompletions.push({ index: subtopicIndex, completedAt: new Date() });
    }

    // Auto-complete the parent topic if ALL subtopics are done
    const totalSubtopics = topic.subtopics.length;
    if (totalSubtopics > 0) {
      const completedCount = topic.subtopicCompletions.filter(
        (sc) => sc.completedAt != null && sc.index < totalSubtopics
      ).length;

      if (completedCount >= totalSubtopics) {
        // All done — mark topic complete and queue AI
        if (!topic.completedAt) {
          topic.completedAt = new Date();
          topic.aiStatus = 'pending_ai';
        }
      } else {
        // Not all done — unmark topic complete if it was set
        if (topic.completedAt) {
          topic.completedAt = null;
          if (topic.aiStatus === 'pending_ai') {
            topic.aiStatus = 'not_started';
          }
        }
      }
    }

    await topic.save();

    return sendSuccess(res, 200, 'Subtopic completion updated.', {
      topicId,
      subtopicIndex,
      subtopicCompletions: topic.subtopicCompletions,
      topicCompletedAt: topic.completedAt,
      aiStatus: topic.aiStatus,
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────────
// GET /api/teacher/topics/:topicId/ai-content
// ─────────────────────────────────────────────
const getAIContent = async (req, res) => {
  try {
    const { topicId } = req.params;

    const topic = await Topic.findById(topicId).populate('aiContent');
    if (!topic) return sendError(res, 404, 'Topic not found.');

    if (topic.aiStatus !== 'pending_review') {
      return sendError(res, 400, `AI content is not available for review. Current status: ${topic.aiStatus}`);
    }

    const course = await Course.findOne({
      _id: topic.courseId,
      assignedTeacher: req.user._id,
    });
    if (!course) return sendError(res, 403, 'Access denied.');

    return sendSuccess(res, 200, 'AI content fetched for review.', topic.aiContent);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────────
// PATCH /api/teacher/topics/:topicId/ai-content/approve
// ─────────────────────────────────────────────
const approveAIContent = async (req, res) => {
  try {
    const { topicId } = req.params;

    const topic = await Topic.findById(topicId);
    if (!topic) return sendError(res, 404, 'Topic not found.');

    const course = await Course.findOne({
      _id: topic.courseId,
      assignedTeacher: req.user._id,
    });
    if (!course) return sendError(res, 403, 'Access denied.');

    if (!topic.aiContent) {
      return sendError(res, 400, 'No AI content linked to this topic.');
    }

    await AIContent.findByIdAndUpdate(topic.aiContent, {
      review_status: 'approved',
      published: true,
    });

    topic.aiStatus = 'published';
    await topic.save();

    return sendSuccess(res, 200, 'AI content approved and published.', { topicId, aiStatus: 'published' });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────────
// PATCH /api/teacher/topics/:topicId/ai-content/reject
// ─────────────────────────────────────────────
const rejectAIContent = async (req, res) => {
  try {
    const { topicId } = req.params;

    const topic = await Topic.findById(topicId);
    if (!topic) return sendError(res, 404, 'Topic not found.');

    const course = await Course.findOne({
      _id: topic.courseId,
      assignedTeacher: req.user._id,
    });
    if (!course) return sendError(res, 403, 'Access denied.');

    if (topic.aiContent) {
      await AIContent.findByIdAndUpdate(topic.aiContent, {
        review_status: 'rejected',
      });
    }

    topic.aiStatus = 'rejected';
    await topic.save();

    return sendSuccess(res, 200, 'AI content rejected.', {
      topicId,
      aiStatus: 'rejected',
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────────
// PATCH /api/teacher/topics/:topicId/retrigger
// ─────────────────────────────────────────────
const retriggerAIProcessing = async (req, res) => {
  try {
    const { topicId } = req.params;

    const topic = await Topic.findById(topicId);
    if (!topic) return sendError(res, 404, 'Topic not found.');

    const course = await Course.findOne({
      _id: topic.courseId,
      assignedTeacher: req.user._id,
    });
    if (!course) return sendError(res, 403, 'Access denied.');

    topic.aiStatus = 'pending_ai';
    await topic.save();

    return sendSuccess(res, 200, 'Topic queued for AI re-processing.', { topicId, aiStatus: 'pending_ai' });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────────
// PATCH /api/teacher/topics/:topicId/department-extras
// ─────────────────────────────────────────────
const updateDepartmentExtras = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { department, notes, additionalTasks } = req.body;

    if (!['CSE-AIML', 'CSE-DS'].includes(department)) {
      return sendError(res, 400, 'Invalid department. Must be CSE-AIML or CSE-DS.');
    }

    const topic = await Topic.findById(topicId);
    if (!topic) return sendError(res, 404, 'Topic not found.');

    const course = await Course.findOne({
      _id: topic.courseId,
      assignedTeacher: req.user._id,
    });
    if (!course) return sendError(res, 403, 'Access denied.');

    const updateField = {};
    if (notes !== undefined) updateField[`departmentExtras.${department}.notes`] = notes;
    if (additionalTasks !== undefined)
      updateField[`departmentExtras.${department}.additionalTasks`] = additionalTasks;

    const updated = await Topic.findByIdAndUpdate(
      topicId,
      { $set: updateField },
      { new: true }
    );

    return sendSuccess(res, 200, `Department extras updated for ${department}.`, updated);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────────
// PATCH /api/teacher/topics/:topicId/order
// ─────────────────────────────────────────────
const updateTopicOrder = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { syllabusOrder } = req.body;

    const topic = await Topic.findById(topicId);
    if (!topic) return sendError(res, 404, 'Topic not found.');

    const course = await Course.findOne({
      _id: topic.courseId,
      assignedTeacher: req.user._id,
    });
    if (!course) return sendError(res, 403, 'Access denied.');

    topic.syllabusOrder = syllabusOrder;
    await topic.save();

    return sendSuccess(res, 200, 'Syllabus order updated.', topic);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/teacher/courses/:courseId/syllabi/parse
// Downloads uploaded syllabus + micro-syllabus files, runs Python parser,
// returns structured preview WITHOUT saving to DB.
// ─────────────────────────────────────────────────────────────────────────────
const parseSyllabi = async (req, res) => {
  const tempFiles = [];

  try {
    const { courseId } = req.params;

    const course = await Course.findOne({
      _id: courseId,
      assignedTeacher: req.user._id,
    });
    if (!course) return sendError(res, 403, 'Access denied. Course not assigned to you.');

    // Fetch the latest uploaded syllabus and micro-syllabus materials
    const [syllabusMaterial, microMaterial] = await Promise.all([
      Material.findOne({ courseId, section: 'syllabus' }).sort({ createdAt: -1 }).lean(),
      Material.findOne({ courseId, section: 'micro-syllabus' }).sort({ createdAt: -1 }).lean(),
    ]);

    if (!syllabusMaterial && !microMaterial) {
      return sendError(res, 400, 'No syllabus or micro-syllabus files found. Please upload them first.');
    }

    // Download files to temp
    const args = [];

    if (syllabusMaterial) {
      const ext = path.extname(syllabusMaterial.fileName || '.docx') || '.docx';
      const tmpPath = path.join(os.tmpdir(), `syllabus-${Date.now()}${ext}`);
      await downloadFile(syllabusMaterial.fileUrl, tmpPath);
      tempFiles.push(tmpPath);
      args.push('--syllabus', tmpPath);
    }

    if (microMaterial) {
      const ext = path.extname(microMaterial.fileName || '.docx') || '.docx';
      const tmpPath = path.join(os.tmpdir(), `micro-${Date.now()}${ext}`);
      await downloadFile(microMaterial.fileUrl, tmpPath);
      tempFiles.push(tmpPath);
      args.push('--micro', tmpPath);
    }

    // Run Python parser
    const parsed = await runParser(args);

    if (!parsed.units || !parsed.units.length) {
      return sendError(res, 422, 'Parser returned no units. Check the document structure.');
    }

    return sendSuccess(res, 200, 'Syllabi parsed successfully.', {
      units: parsed.units,
      syllabusFileName: syllabusMaterial?.fileName || null,
      microFileName: microMaterial?.fileName || null,
    });
  } catch (error) {
    console.error('[parseSyllabi]', error.message);
    return sendError(res, 500, error.message);
  } finally {
    // Clean up temp files
    for (const f of tempFiles) {
      await fs.unlink(f).catch(() => {});
    }
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/teacher/courses/:courseId/syllabi/confirm
// Teacher has reviewed the parsed units — save Topics to DB.
// Body: { units: [{ unitNumber, topics: [{ title, subtopics }] }] }
// ─────────────────────────────────────────────────────────────────────────────
const confirmSyllabi = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { units } = req.body;

    if (!units || !Array.isArray(units) || units.length === 0) {
      return sendError(res, 400, 'units array is required and must not be empty.');
    }

    const course = await Course.findOne({
      _id: courseId,
      assignedTeacher: req.user._id,
    });
    if (!course) return sendError(res, 403, 'Access denied. Course not assigned to you.');

    // Delete all existing topics + their AI content for this course
    const existingTopics = await Topic.find({ courseId });
    const topicIds = existingTopics.map((t) => t._id);
    if (topicIds.length > 0) {
      await AIContent.deleteMany({ topicId: { $in: topicIds } });
      await Topic.deleteMany({ _id: { $in: topicIds } });
    }

    // Create new Topic documents
    const newTopics = [];
    let orderCounter = 1;

    for (const unit of units) {
      const unitNumber = Number(unit.unitNumber) || 1;
      const unitName = `Unit ${unitNumber}`;

      const topicList = Array.isArray(unit.topics) ? unit.topics : [];
      for (const topicData of topicList) {
        const title = typeof topicData === 'string' ? topicData.trim() : (topicData.title || '').trim();
        if (!title) continue;

        const subtopics = Array.isArray(topicData.subtopics)
          ? topicData.subtopics.filter((s) => typeof s === 'string' && s.trim())
          : [];

        const topic = new Topic({
          title,
          courseId,
          unitNumber,
          unitName,
          syllabusOrder: orderCounter++,
          subtopics,
          subtopicCompletions: [],
          aiStatus: 'not_started',
        });
        await topic.save();
        newTopics.push(topic);
      }
    }

    // Update course document
    course.topics = newTopics.map((t) => t._id);
    await course.save();

    return sendSuccess(res, 200, 'Topics saved successfully.', {
      topicsCreated: newTopics.length,
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────────
// GET /api/teacher/courses/:courseId/topics/by-unit
// Returns topics grouped by unitNumber (with subtopics and completions)
// ─────────────────────────────────────────────
const getTopicsByUnit = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findOne({
      _id: courseId,
      assignedTeacher: req.user._id,
    });
    if (!course) return sendError(res, 403, 'Access denied. Course not assigned to you.');

    const topics = await Topic.find({ courseId }).sort({ unitNumber: 1, syllabusOrder: 1 });

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

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Download a file from a URL (http or https) to a local path.
 */
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = require('fs').createWriteStream(destPath);
    protocol.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        // Follow redirect
        file.close();
        return downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        file.close();
        return reject(new Error(`Failed to download file: HTTP ${response.statusCode}`));
      }
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      file.close();
      reject(err);
    });
  });
}

/**
 * Spawn the Python parser and return parsed JSON.
 * @param {string[]} args - CLI args for the parser (e.g. ['--syllabus', path, '--micro', path])
 */
function runParser(args) {
  return new Promise((resolve, reject) => {
    const python = spawn(PYTHON_EXECUTABLE, [PARSER_SCRIPT_PATH, ...args], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    python.stderr.on('data', (chunk) => { stderr += chunk.toString(); });

    python.on('error', (error) => {
      if (error.code === 'ENOENT') {
        return reject(new Error('Python executable not found. Set PYTHON_PATH environment variable.'));
      }
      return reject(new Error(`Failed to launch parser: ${error.message}`));
    });

    python.on('close', (code) => {
      if (stderr.trim()) {
        console.warn('[syllabusParser stderr]', stderr.trim());
      }
      if (code !== 0) {
        const message = stderr.trim() || `Parser exited with code ${code}`;
        return reject(new Error(message));
      }
      if (!stdout.trim()) {
        return reject(new Error('Parser produced no output.'));
      }
      try {
        const parsed = JSON.parse(stdout);
        if (parsed.error) {
          return reject(new Error(parsed.error));
        }
        resolve(parsed);
      } catch {
        reject(new Error('Parser returned invalid JSON.'));
      }
    });
  });
}

module.exports = {
  getMyCourses,
  getCourseById,
  getCourseTopics,
  getPendingReviewTopics,
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
};
