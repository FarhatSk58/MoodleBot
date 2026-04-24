const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    courseCode: {
      type: String,
      trim: true,
      default: '',
    },
    department: {
      type: String,
      enum: ['CSE-AIML', 'CSE-DS'],
      default: '',
    },
    departments: {
      type: [String],
      enum: ['CSE-AIML', 'CSE-DS'],
      default: [],
    },
    year: {
      type: String,
      required: [true, 'Course year is required'],
    },
    semester: {
      type: String,
      required: [true, 'Course semester is required'],
    },
    sections: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      default: 'Draft',
    },
    assignedTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Assigned teacher is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator (admin) is required'],
    },
    topics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Topic',
      },
    ],
    materials: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Material',
      },
    ],
    microSyllabusUrl: {
      type: String,
      default: null,
    },
    microSyllabusPublicId: {
      type: String,
      default: null,
    },
    credits: {
      type: Number,
      default: null,
    },
    category: {
      type: String,
      default: '',
    },
    lectureTutorial: {
      type: String,
      default: '',
    },
    courseType: {
      type: String,
      default: '',
    },
    prerequisites: {
      type: String,
      default: '',
    },
    continuousEvaluation: {
      type: Number,
      default: null,
    },
    semesterEndExamination: {
      type: Number,
      default: null,
    },
    totalMarks: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);
