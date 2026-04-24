/**
 * /ai-processing/index.js
 * Public API of the AI processing module.
 * Exports the two functions that the backend wires into:
 *   - runBatchProcessor → called by /server/utils/cronJob.js (nightly)
 *   - scoreAnswer       → called by /server/controllers/studentController.js (per submission)
 */

require('dotenv').config();
const { runBatchProcessor } = require('./jobs/batchProcessor');
const { scoreAnswer } = require('./utils/answerScorer');
const { generateInterviewFeedback } = require('./utils/interviewFeedbackGenerator');
const {
  generateInterviewOpening,
  generateInterviewNextTurn,
} = require('./utils/interviewSessionGenerator');
const { checkChromaConnection } = require('./utils/chromaHealthCheck');

// Startup health check for ChromaDB
checkChromaConnection().then(result => {
  if (result.connected) {
    console.log('[RAG] ChromaDB is reachable. RAG pipeline is active.');
  } else {
    console.warn(`[RAG] ChromaDB is NOT reachable. RAG will be skipped. Start it with: chroma run --path ${process.env.CHROMA_DATA_PATH || './chroma_db'}`);
  }
});

module.exports = {
  runBatchProcessor,
  scoreAnswer,
  generateInterviewFeedback,
  generateInterviewOpening,
  generateInterviewNextTurn,
};
