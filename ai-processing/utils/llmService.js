let Groq;
try {
  Groq = require('groq-sdk');
} catch (e) {
  Groq = require('../../server/node_modules/groq-sdk');
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Initialize Groq client
let groqClient = null;
if (process.env.GROQ_API_KEY) {
  groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
}

/**
 * Maps logical task types to specific Groq models to balance cost and performance.
 */
function getGroqModel(taskType) {
  switch (taskType) {
    case 'mock_interview':
      return 'llama-3.1-8b-instant'; // Fast, lightweight for quick back-and-forth
    case 'evaluation':
    case 'generation':
    default:
      return 'llama-3.3-70b-versatile'; // Standard heavier model for evaluation and batch generation
  }
}

/**
 * Robustly extracts and parses a JSON object/array from a raw LLM text response.
 */
function extractJsonPayload(rawText, source) {
  let cleanedText = rawText.trim();
  
  // aggressively strip triple backticks
  cleanedText = cleanedText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();

  try {
    return JSON.parse(cleanedText);
  } catch (jsonError) {
    const retryableError = new Error(
      `[llmService] ${source} response is not valid JSON. Parse error: ${jsonError.message}\n` +
      `Raw response (first 500 chars): ${cleanedText.substring(0, 500)}`
    );
    throw retryableError;
  }
}

/**
 * SILENT FALLBACK: Native implementation of the Gemini API request via fetch.
 */
async function callGeminiFallback(prompt, maxTokens) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('[llmService] Both GROQ_API_KEY and GEMINI_API_KEY are missing.');
  }

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.2,
      responseMimeType: "application/json",
      thinkingConfig: {
        thinkingBudget: 0
      }
    }
  };

  let response;
  try {
    response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
  } catch (networkError) {
    throw new Error(`[llmService] Network error reaching Gemini API: ${networkError.message}`);
  }

  if (!response.ok) {
    let errorBody = '';
    try {
      errorBody = await response.text();
    } catch (_) {}
    throw new Error(
      `[llmService] Gemini API returned HTTP ${response.status}: ${errorBody}`
    );
  }

  let responseData;
  try {
    responseData = await response.json();
  } catch (parseError) {
    throw new Error(`[llmService] Failed to parse Gemini API response as JSON: ${parseError.message}`);
  }

  if (
    !responseData.candidates ||
    !Array.isArray(responseData.candidates) ||
    responseData.candidates.length === 0 ||
    !responseData.candidates[0].content ||
    !responseData.candidates[0].content.parts ||
    responseData.candidates[0].content.parts.length === 0
  ) {
    throw new Error(`[llmService] Unexpected response structure from Gemini API: ${JSON.stringify(responseData).substring(0, 500)}`);
  }

  const rawText = responseData.candidates[0].content.parts[0].text;
  return extractJsonPayload(rawText, 'Gemini');
}

/**
 * PRIMARY PROVIDER: Attempts to fulfill the generation request using Groq.
 */
async function callGroqPrimary(prompt, model, maxTokens) {
  if (!groqClient) {
    throw new Error('Groq client not initialized (missing API key).');
  }

  const chatCompletion = await groqClient.chat.completions.create({
    messages: [
      {
        role: "user",
        content: prompt,
      }
    ],
    model: model,
    temperature: 0.2, // Consistent with Gemini
    max_tokens: maxTokens,
    response_format: { type: "json_object" }, // Enforce JSON
  });

  const rawText = chatCompletion.choices[0]?.message?.content || "";
  return extractJsonPayload(rawText, 'Groq');
}

/**
 * generateContent — Centralized service for LLM tasks.
 * 
 * Attempts to fulfill the request using Groq (Primary). 
 * If it fails (due to connection, rate limit, timeout, or JSON strictness), 
 * it silently routes the request through Google Gemini (Fallback).
 * 
 * @param {string} prompt     - The full prompt string to send
 * @param {Object} options    - Options block
 *        {string} taskType   - Classifies the task (e.g., 'evaluation', 'mock_interview', 'generation')
 *        {number} maxTokens  - Maximum tokens for output
 * @returns {Object}          - Parsed JSON object from the LLM
 */
async function generateContent(prompt, options = {}) {
  const taskType = options.taskType || 'default';
  const maxTokens = Math.max(options.maxTokens || 4000, 1024);
  const groqModel = getGroqModel(taskType);

  // Attempt Primary: Groq
  try {
    const groqResult = await callGroqPrimary(prompt, groqModel, maxTokens);
    return groqResult;
  } catch (groqError) {
    console.warn(`[llmService] Groq primary failed for task '${taskType}' using model '${groqModel}'. Failing over to Gemini...`);
    console.warn(`[llmService] Groq Error Details: ${groqError.message}`);
    
    // Attempt Fallback: Gemini
    try {
      const geminiResult = await callGeminiFallback(prompt, maxTokens);
      return geminiResult;
    } catch (geminiError) {
      if (geminiError.finishReason === 'MAX_TOKENS') {
        const retryTokenLimit = Math.max(maxTokens * 2, 4096);
        console.warn(`[llmService] Gemini hit output token limit. Retrying with ${retryTokenLimit} tokens...`);
        return await callGeminiFallback(prompt, retryTokenLimit);
      }
      // If both fail, escalate exception
      throw new Error(`[llmService] FATAL: Both Groq (Primary) and Gemini (Fallback) failed. Final Gemini Error: ${geminiError.message}`);
    }
  }
}

module.exports = { generateContent };
