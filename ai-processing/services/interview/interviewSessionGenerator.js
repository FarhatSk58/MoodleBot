const { generateContent } = require('../core/llmService');
const {
  buildInterviewOpeningPrompt,
  buildInterviewNextTurnPrompt,
} = require('../../prompts/interview/interviewSessionPrompt');

function normalizeMainCount(n, fallback) {
  const x = Number(n);
  if (!Number.isFinite(x) || x < 0) return fallback;
  return Math.floor(x);
}

async function generateInterviewOpening(input) {
  let enrichedPrompt;
  try {
    const rawPrompt = buildInterviewOpeningPrompt(input);
    if (input.courseId) {
      const { enrichPromptWithContext } = require('../core/ragMiddleware');
      enrichedPrompt = await enrichPromptWithContext(input.courseId, rawPrompt, 4);
    } else {
      enrichedPrompt = rawPrompt;
    }
  } catch (ragError) {
    console.warn('[interviewSessionGenerator] RAG enrichment failed, using raw prompt:', ragError.message);
    enrichedPrompt = buildInterviewOpeningPrompt(input);
  }

  const result = await generateContent(enrichedPrompt, { taskType: 'mock_interview', maxTokens: 1200 });
  if (!result || typeof result.message !== 'string' || !result.message.trim()) {
    throw new Error('[interviewSessionGenerator] Opening response missing message.');
  }
  return {
    message: result.message.trim(),
    mainQuestionsAsked: normalizeMainCount(result.mainQuestionsAsked, 1) || 1,
  };
}

async function generateInterviewNextTurn(input) {
  let enrichedPrompt;
  try {
    const rawPrompt = buildInterviewNextTurnPrompt(input);
    if (input.courseId) {
      const { enrichPromptWithContext } = require('../core/ragMiddleware');
      enrichedPrompt = await enrichPromptWithContext(input.courseId, rawPrompt, 4);
    } else {
      enrichedPrompt = rawPrompt;
    }
  } catch (ragError) {
    console.warn('[interviewSessionGenerator] RAG enrichment failed, using raw prompt:', ragError.message);
    enrichedPrompt = buildInterviewNextTurnPrompt(input);
  }

  const result = await generateContent(enrichedPrompt, { taskType: 'mock_interview', maxTokens: 1800 });
  if (!result || typeof result.message !== 'string' || !result.message.trim()) {
    throw new Error('[interviewSessionGenerator] Turn response missing message.');
  }
  const planned = Number(input.plannedQuestionCount) || 5;
  let mainQuestionsAsked = normalizeMainCount(result.mainQuestionsAsked, input.mainQuestionsAskedSoFar);
  mainQuestionsAsked = Math.min(Math.max(mainQuestionsAsked, 0), planned);

  return {
    message: result.message.trim(),
    mainQuestionsAsked,
    interviewComplete: Boolean(result.interviewComplete),
    topicCovered: typeof result.topicCovered === 'string' ? result.topicCovered.trim() : null,
    turnEvaluation: result.turnEvaluation && typeof result.turnEvaluation === 'object'
      ? {
          topic: String(result.turnEvaluation.topic || '').trim(),
          quality: ['strong', 'adequate', 'weak', 'no_answer'].includes(result.turnEvaluation.quality)
            ? result.turnEvaluation.quality
            : 'adequate',
          note: String(result.turnEvaluation.note || '').trim(),
        }
      : null,
  };
}

module.exports = {
  generateInterviewOpening,
  generateInterviewNextTurn,
};
