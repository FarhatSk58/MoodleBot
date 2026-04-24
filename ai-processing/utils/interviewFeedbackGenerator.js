//feebackGenerator.js
const { generateContent } = require('./llmService');
const { buildInterviewFeedbackPrompt } = require('../prompts/interviewFeedbackPrompt');

/**
 * Generates structured feedback for a mock interview based on the transcript.
 *
 * @param {Object} input
 *   {
 *     domain: string,
 *     difficulty: string,
 *     subtopics: string[],
 *     duration: number,
 *     transcript: string
 *   }
 * @returns {Object} { score: number, strengths: string[], weaknesses: string[], suggestions: string[] }
 */
async function generateInterviewFeedback(input) {
  const {
    domain, difficulty, subtopics, duration,
    transcript, earlyEndNote,
    courseId = null,
    turnEvaluations = [],
  } = input;

  if (!domain || !transcript) {
    throw new Error('[interviewFeedbackGenerator] Missing required fields: domain or transcript.');
  }

  console.log(`[interviewFeedbackGenerator] Generating feedback for ${domain} | Course: ${courseId} | Transcript length: ${transcript.length}`);

  let courseContext = '';
  if (courseId) {
    try {
      const { retrieveContext } = require('./ragService');
      // Use domain as query to retrieve broad course context for feedback
      courseContext = await retrieveContext(courseId, `${domain} interview evaluation`, 5);
    } catch (ragError) {
      console.warn('[interviewFeedbackGenerator] RAG failed, proceeding without context:', ragError.message);
    }
  }

  const prompt = buildInterviewFeedbackPrompt({
    ...input,
    earlyEndNote: earlyEndNote || '',
    courseContext,
    turnEvaluations,
  });

  // Centralized wrapper with Groq primary and Gemini fallback
  const result = await generateContent(prompt, { taskType: 'evaluation', maxTokens: 2500 });

  if (typeof result.score !== 'number') {
    throw new Error('[interviewFeedbackGenerator] AI response is missing a numeric score.');
  }

  const rec = String(result.recommendation || '').trim();
  const allowed = ['Strong Fit', 'Good Fit', 'Weak Fit'];
  const recommendation = allowed.includes(rec) ? rec : 'Good Fit';

  return {
    score: result.score,
    recommendation,
    overallSummary: String(result.overallSummary || '').trim(),
    technicalSkills: String(result.technicalSkills || '').trim(),
    communicationSkills: String(result.communicationSkills || '').trim(),
    strengths: Array.isArray(result.strengths) ? result.strengths : [],
    weaknesses: Array.isArray(result.weaknesses) ? result.weaknesses : [],
    suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
  };
}

module.exports = { generateInterviewFeedback };
