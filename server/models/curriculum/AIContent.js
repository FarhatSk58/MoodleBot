const mongoose = require('mongoose');

const interviewQuestionSchema = new mongoose.Schema(
  {
    question_id: { type: String, required: true },
    question: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
    type: {
      type: String,
      enum: ['conceptual', 'scenario', 'system-design'],
    },
    expected_answer_outline: { type: [String], default: [] },
  },
  { _id: false }
);

const industryUseCaseSchema = new mongoose.Schema(
  {
    domain: { type: String },
    use_case_title: { type: String },
    description: { type: String },
    tools_or_technologies_involved: { type: [String], default: [] },
    verified_company_example: { type: String, default: null },
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    task_id: { type: String },
    task_title: { type: String },
    description: { type: String },
    difficulty: { type: String, default: 'medium' },
    chained_topics: { type: [String], default: [] },
    estimated_time: { type: String },
    uses_real_data: { type: Boolean, default: false },
    data_source: { type: String, default: null },
    skills_practiced: { type: [String], default: [] },
    test_cases: {
      type: [
        new mongoose.Schema(
          {
            input: { type: String },
            expected_output: { type: String },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
  },
  { _id: false }
);

const miniProjectSchema = new mongoose.Schema(
  {
    project_title: { type: String },
    problem_statement: { type: String },
    features_to_implement: { type: [String], default: [] },
    chained_topics: { type: [String], default: [] },
    estimated_time: { type: String },
    tech_stack_suggestion: { type: [String], default: [] },
    uses_real_data: { type: Boolean, default: false },
    data_source: { type: String, default: null },
  },
  { _id: false }
);

const aiContentSchema = new mongoose.Schema(
  {
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
      unique: true,
    },
    importance_score: {
      type: Number,
      min: 1,
      max: 10,
    },
    complexity_level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
    },
    weightage_tag: {
      type: String,
      enum: ['core', 'supporting', 'optional'],
    },
    interview_questions: {
      type: [interviewQuestionSchema],
      default: [],
    },
    industry_use_cases: {
      type: [industryUseCaseSchema],
      default: [],
    },
    tasks: {
      type: [taskSchema],
      default: [],
    },
    mini_project: {
      type: miniProjectSchema,
      default: null,
    },
    generationFlags: {
      generate_questions: { type: Boolean, default: true },
      generate_use_cases: { type: Boolean, required: true },
      generate_tasks:     { type: Boolean, required: true },
      generate_project:   { type: Boolean, required: true },
    },
    review_status: {
      type: String,
      enum: ['pending_review', 'approved', 'rejected'],
      default: 'pending_review',
    },
    published: {
      type: Boolean,
      default: false,
    },
    processedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AIContent', aiContentSchema);
