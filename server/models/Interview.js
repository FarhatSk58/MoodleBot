const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    domain: {
      type: String,
      required: true,
    },
    subtopics: {
      type: [String],
      default: [],
    },
    /** Optional: course this interview is based on. Used for RAG context retrieval. */
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      default: null,
    },
    /** Topics the agent has already covered during this session (for breadth tracking). */
    coveredTopics: {
      type: [String],
      default: [],
    },
    /** Per-turn evaluation log: stores brief agent notes on each candidate answer. */
    turnEvaluations: {
      type: [
        {
          questionNumber: Number,
          topic: String,
          quality: {
            type: String,
            enum: ['strong', 'adequate', 'weak', 'no_answer'],
          },
          note: String,
        }
      ],
      default: [],
    },
    duration: {
      type: Number,
      required: true, // in minutes
    },
    /** Planned main questions for this session (4–6). Set when session opens. */
    plannedQuestionCount: {
      type: Number,
      default: null,
    },
    /** Running count of main questions the interviewer has asked (from AI). */
    mainQuestionsAsked: {
      type: Number,
      default: 0,
    },
    messages: {
      type: [
        {
          role: {
            type: String,
            enum: ['interviewer', 'candidate'],
            required: true,
          },
          content: {
            type: String,
            default: '',
          },
        },
      ],
      default: [],
    },
    difficulty: {
      type: String,
      default: 'medium',
    },
    audioUrl: {
      type: String,
      default: null,
    },
    transcript: {
      type: String,
      default: '',
    },
    feedback: {
      type: mongoose.Schema.Types.Mixed,
      default: {
        strengths: [],
        weaknesses: [],
        suggestions: [],
      },
    },
    score: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      enum: ['ai', 'manual'],
      default: 'ai',
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Interview', interviewSchema);
