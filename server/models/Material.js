const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required'],
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader (teacher) is required'],
    },
    title: {
      type: String,
      required: [true, 'Material title is required'],
    },
    description: {
      type: String,
      default: '',
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    filePublicId: {
      type: String,
      required: [true, 'Cloudinary public_id is required'],
    },
    fileName: {
      type: String,
    },
    fileType: {
      type: String,
    },
    fileSize: {
      type: Number,
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
      enum: [
        'syllabus',
        'micro-syllabus',
        'units',
        'textbooks',
        'notes',
        'mcqs',
        'question-banks',
        'previous-papers',
      ],
    },
    unitNumber: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Material', materialSchema);
