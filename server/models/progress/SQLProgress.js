const mongoose = require('mongoose');

const solvedProblemSchema = new mongoose.Schema(
  {
    problemId: { type: String, required: true },
    solvedAt: { type: Date, default: Date.now },
    topic: { type: String, default: '' },
    difficulty: { type: String, default: '' },
  },
  { _id: false }
);

const sqlProgressSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    solvedProblems: {
      type: [solvedProblemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

// One SQL progress doc per student
sqlProgressSchema.index({ studentId: 1 }, { unique: true });

module.exports = mongoose.model('SQLProgress', sqlProgressSchema);

