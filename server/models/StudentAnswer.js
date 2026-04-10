const mongoose = require('mongoose');

const bestAttemptSchema = new mongoose.Schema(
  {
    answerText: { type: String },
    score: { type: Number, default: 0 },
    scoringType: { type: String },
    criteriaScores: { type: mongoose.Schema.Types.Mixed, default: {} },
    feedback: { type: mongoose.Schema.Types.Mixed, default: {} },
    attemptedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const studentAnswerSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
    },
    questionId: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      enum: ['question', 'mini_project'],
      default: 'question',
    },
    bestAttempt: {
      type: bestAttemptSchema,
      default: null,
    },
    totalAttempts: {
      type: Number,
      default: 0,
    },
    answerUnlocked: {
      type: Boolean,
      default: false,
    },
    repoUrl: {
      type: String,
      default: null,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// One document per student/topic/question or mini-project submission
studentAnswerSchema.index(
  { studentId: 1, topicId: 1, type: 1, questionId: 1 },
  { unique: true }
);

module.exports = mongoose.model('StudentAnswer', studentAnswerSchema);
