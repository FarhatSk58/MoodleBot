const Course = require('../models/Course');
const Material = require('../models/Material');
const cloudinary = require('../config/cloudinary');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const { syncMaterialToChroma, removeChunksForMaterial } = require('../utils/ragSync');


const VALID_SECTIONS = [
  'syllabus',
  'micro-syllabus',
  'units',
  'textbooks',
  'notes',
  'mcqs',
  'question-banks',
  'previous-papers',
];

// ─────────────────────────────────────────────
// POST /api/materials/courses/:courseId/upload
// Teacher only
// ─────────────────────────────────────────────
const uploadMaterial = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, section, unitNumber } = req.body;

    if (!section || !VALID_SECTIONS.includes(section)) {
      return sendError(res, 400, `Invalid section. Must be one of: ${VALID_SECTIONS.join(', ')}`);
    }

    // Validate teacher is assigned to this course
    const course = await Course.findOne({
      _id: courseId,
      assignedTeacher: req.user._id,
    });
    if (!course) {
      return sendError(res, 403, 'Access denied. You are not the assigned teacher for this course.');
    }

    if (!req.file) {
      return sendError(res, 400, 'No file uploaded.');
    }

    const material = new Material({
      courseId,
      uploadedBy: req.user._id,
      title,
      description: description || '',
      fileUrl: req.file.path,           // Cloudinary URL
      filePublicId: req.file.filename,  // Cloudinary public_id
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      section,
      unitNumber: unitNumber ? Number(unitNumber) : null,
    });

    await material.save();
    course.materials.push(material._id);
    await course.save();

    // Send response immediately — do not await RAG sync
    const response = sendSuccess(res, 201, 'Material uploaded successfully.', material);

    // Fire-and-forget: sync to ChromaDB in background
    setImmediate(() => {
      syncMaterialToChroma(material).catch(err =>
        console.error('[materialController] Unexpected RAG sync error:', err.message)
      );
    });

    return response;

  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────────
// GET /api/materials/courses/:courseId
// Teacher + enrolled Students
// Optional query: ?section=syllabus&unit=2
// ─────────────────────────────────────────────
const getCourseMaterials = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { role, _id: userId } = req.user;
    const { section, unit } = req.query;

    if (role === 'teacher') {
      const course = await Course.findOne({ _id: courseId, assignedTeacher: userId });
      if (!course) return sendError(res, 403, 'Access denied.');
    } else if (role === 'student') {
      const user = await User.findById(userId);
      if (!user.enrolledCourses.map((id) => id.toString()).includes(courseId)) {
        return sendError(res, 403, 'You are not enrolled in this course.');
      }
    } else {
      return sendError(res, 403, 'Access denied.');
    }

    const filter = { courseId };
    if (section) filter.section = section;
    if (unit !== undefined) filter.unitNumber = Number(unit);

    const materials = await Material.find(filter).sort({ createdAt: 1 }).lean();
    return sendSuccess(res, 200, 'Materials fetched successfully.', materials);
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// ─────────────────────────────────────────────
// DELETE /api/materials/:materialId
// Teacher only
// ─────────────────────────────────────────────
const deleteMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;

    const material = await Material.findById(materialId);
    if (!material) return sendError(res, 404, 'Material not found.');

    const course = await Course.findOne({
      _id: material.courseId,
      assignedTeacher: req.user._id,
    });
    if (!course) return sendError(res, 403, 'Access denied. Only the assigned teacher can delete materials.');

    // Try Cloudinary delete (non-fatal if it fails — file may already be gone)
    try {
      await cloudinary.uploader.destroy(material.filePublicId, { resource_type: 'raw' });
    } catch (_) {}

    await Material.findByIdAndDelete(materialId);

    course.materials = course.materials.filter((id) => id.toString() !== materialId.toString());
    await course.save();

    // Fire-and-forget: remove chunks from ChromaDB
    setImmediate(() => {
      removeChunksForMaterial(materialId.toString(), material.courseId.toString()).catch(err =>
        console.error('[materialController] Unexpected RAG removal error:', err.message)
      );
    });

    return sendSuccess(res, 200, 'Material deleted successfully.', null);

  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = { uploadMaterial, getCourseMaterials, deleteMaterial };
