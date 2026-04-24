const mongoose = require('mongoose');

const topicAttemptSchema = new mongoose.Schema(
  {
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
    },
    questionsAttempted: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    masteryStatus: {
      type: String,
      enum: ['Not Started', 'Partial', 'Mastered'],
      default: 'Not Started',
    },
    lastAttemptAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const studentProgressSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    topicsAttempted: {
      type: [topicAttemptSchema],
      default: [],
    },
    overallAverageScore: {
      type: Number,
      default: 0,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound unique index: one progress document per student per course
studentProgressSchema.index(
  { studentId: 1, courseId: 1 },
  { unique: true }
);

module.exports = mongoose.model('StudentProgress', studentProgressSchema);
