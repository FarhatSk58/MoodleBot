const mongoose = require('mongoose');

const subtopicCompletionSchema = new mongoose.Schema(
  {
    index: { type: Number, required: true },      // 0-based index into subtopics[]
    completedAt: { type: Date, default: null },
  },
  { _id: false }
);

const topicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Topic title is required'],
      trim: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required'],
    },
    syllabusOrder: {
      type: Number,
      required: [true, 'Syllabus order is required'],
    },
    // subtopics text array — populated from the parser
    subtopics: {
      type: [String],
      default: [],
    },
    // per-subtopic completion records (teacher marks each one)
    subtopicCompletions: {
      type: [subtopicCompletionSchema],
      default: [],
    },
    completedAt: {
      type: Date,
      default: null,
    },
    aiStatus: {
      type: String,
      enum: [
        'not_started',
        'pending_ai',
        'processing',
        'pending_review',
        'published',
        'rejected',
      ],
      default: 'not_started',
    },
    aiContent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AIContent',
      default: null,
    },
    departmentExtras: {
      'CSE-AIML': {
        notes: { type: String, default: '' },
        additionalTasks: { type: [String], default: [] },
      },
      'CSE-DS': {
        notes: { type: String, default: '' },
        additionalTasks: { type: [String], default: [] },
      },
    },
    unitNumber: {
      type: Number,
      default: 1,
    },
    unitName: {
      type: String,
      default: 'Unit 1',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Topic', topicSchema);
