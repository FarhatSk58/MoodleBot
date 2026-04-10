const mongoose = require('mongoose');

const dsaProgressSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    solvedKeys: {
      type: [String],
      default: [],
    },
    revisionKeys: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// One DSA progress doc per student
dsaProgressSchema.index({ studentId: 1 }, { unique: true });

module.exports = mongoose.model('DsaProgress', dsaProgressSchema);

