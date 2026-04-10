const { callClaude } = require('./claudeClient');
const { buildScoringPrompt } = require('../prompts/scoringPrompt');

/**
 * scoreAnswer — Live answer scorer. Called by studentController.js when a
 * student submits an answer to an interview question.
 *
 * @param {Object} input
 *   {
 *     topic: string,
 *     question: string,
 *     difficulty: 'easy' | 'medium' | 'hard',
 *     question_type: 'conceptual' | 'scenario' | 'system-design',
 *     expected_answer_outline: string[],
 *     student_answer: string
 *   }
 *
 * @returns {Object} Scoring result:
 *   For easy:
 *     { difficulty, scoring_type, overall_score, feedback: { correct_parts, missing_parts, improvement_tips } }
 *   For medium/hard:
 *     { difficulty, scoring_type, criteria_scores, overall_score, feedback: { ... } }
 *
 * @throws {Error} If Claude API call fails or returns invalid JSON
 */
async function scoreAnswer(input) {
  if (!input.topic || !input.question || !input.student_answer) {
    throw new Error('[answerScorer] Missing required fields: topic, question, or student_answer.');
  }

  if (!['easy', 'medium', 'hard'].includes(input.difficulty)) {
    throw new Error(`[answerScorer] Invalid difficulty: "${input.difficulty}". Must be easy, medium, or hard.`);
  }

  console.log(
    `[answerScorer] Scoring answer | topic: "${input.topic}" | ` +
    `difficulty: ${input.difficulty} | student_answer length: ${input.student_answer.length} chars`
  );

  const prompt = buildScoringPrompt(input);

  // maxTokens: 1500 is sufficient for scoring responses
  const scoringResult = await callClaude(prompt, 1500);

  // Validate the response has the required structure
  if (typeof scoringResult.overall_score !== 'number') {
    throw new Error(
      '[answerScorer] Claude scoring response is missing overall_score. ' +
      'Raw result: ' + JSON.stringify(scoringResult).substring(0, 300)
    );
  }

  if (!scoringResult.feedback) {
    throw new Error('[answerScorer] Claude scoring response is missing feedback object.');
  }

  console.log(
    `[answerScorer] Scoring complete | overall_score: ${scoringResult.overall_score} | ` +
    `scoring_type: ${scoringResult.scoring_type}`
  );

  return scoringResult;
}

module.exports = { scoreAnswer };
