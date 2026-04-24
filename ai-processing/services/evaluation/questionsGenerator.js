/*
 * questionsGenerator.js
 * Generates interview questions for a topic, enriched with RAG course context if available.
 */

const { generateContent } = require('../core/llmService');
const { buildQuestionsPrompt } = require('../../prompts/content/questionsPrompt');
const { enrichPromptWithContext } = require('../core/ragMiddleware');

async function generateQuestions(topicData, importanceScore, courseId = null) {
  let courseContext = '';

  if (courseId) {
    try {
      const { retrieveContext } = require('../core/ragService');
      courseContext = await retrieveContext(courseId, topicData.topic, 4);
    } catch (ragError) {
      console.warn('[questionsGenerator] RAG retrieval failed, proceeding without context:', ragError.message);
    }
  }

  const prompt = buildQuestionsPrompt(topicData, importanceScore, courseContext);
  const result = await generateContent(prompt, { taskType: 'generation', maxTokens: 4000 });

  if (!result || !Array.isArray(result.questions)) {
    throw new Error('[questionsGenerator] Invalid response: missing questions array.');
  }

  return result.questions;
}

module.exports = { generateQuestions };
