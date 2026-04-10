/**
 * /ai-processing/index.js
 * Public API of the AI processing module.
 * Exports the two functions that the backend wires into:
 *   - runBatchProcessor → called by /server/utils/cronJob.js (nightly)
 *   - scoreAnswer       → called by /server/controllers/studentController.js (per submission)
 */

const { runBatchProcessor } = require('./jobs/batchProcessor');
const { scoreAnswer } = require('./utils/answerScorer');

module.exports = { runBatchProcessor, scoreAnswer };
