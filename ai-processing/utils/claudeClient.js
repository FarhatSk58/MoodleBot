// Native fetch is used (Node.js 18+). No import needed.

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

/**
 * callClaude — Kept the function name for full compatibility with other files, 
 * but this now securely routes exactly to the Google Gemini API (which has a true free tier!)
 *
 * @param {string} prompt     - The full prompt string to send
 * @param {number} maxTokens  - Max tokens for response
 * @returns {Object}          - Parsed JSON object from Gemini's response
 * @throws {Error}            - If API call fails or response is not valid JSON
 */
async function callClaude(prompt, maxTokens = 4000) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('[aiClient] GEMINI_API_KEY is not set in environment variables. Please add it to your .env file.');
  }

  async function sendGeminiRequest(outputTokenLimit) {
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        maxOutputTokens: outputTokenLimit,
        temperature: 0.2, // Kept low for deterministic JSON
        responseMimeType: "application/json",
        // Disable model thinking so token budget is spent on the actual JSON payload.
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
      throw new Error(`[aiClient] Network error reaching Gemini API: ${networkError.message}`);
    }

    if (!response.ok) {
      let errorBody = '';
      try {
        errorBody = await response.text();
      } catch (_) {}
      throw new Error(
        `[aiClient] Gemini API returned HTTP ${response.status}: ${errorBody}`
      );
    }

    try {
      return await response.json();
    } catch (parseError) {
      throw new Error(`[aiClient] Failed to parse Gemini API response as JSON: ${parseError.message}`);
    }
  }

  function extractJsonPayload(responseData) {
    // Extract text content from Gemini response structure
    if (
      !responseData.candidates ||
      !Array.isArray(responseData.candidates) ||
      responseData.candidates.length === 0 ||
      !responseData.candidates[0].content ||
      !responseData.candidates[0].content.parts ||
      responseData.candidates[0].content.parts.length === 0
    ) {
      throw new Error(`[aiClient] Unexpected response structure from Gemini API: ${JSON.stringify(responseData).substring(0, 500)}`);
    }

    let rawText = responseData.candidates[0].content.parts[0].text.trim();
    const finishReason = responseData.candidates[0].finishReason;

    // Parse and return (defensively stripping just in case)
    rawText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();

    try {
      return JSON.parse(rawText);
    } catch (jsonError) {
      const retryableError = new Error(
        `[aiClient] Gemini response is not valid JSON. Parse error: ${jsonError.message}\n` +
        `FinishReason was: ${finishReason}\n` +
        `Raw response (first 500 chars): ${rawText.substring(0, 500)}`
      );
      retryableError.finishReason = finishReason;
      throw retryableError;
    }
  }

  const initialTokenLimit = Math.max(maxTokens, 1024);

  try {
    const responseData = await sendGeminiRequest(initialTokenLimit);
    return extractJsonPayload(responseData);
  } catch (error) {
    if (error.finishReason !== 'MAX_TOKENS') {
      throw error;
    }

    const retryTokenLimit = Math.max(initialTokenLimit * 2, 4096);
    const responseData = await sendGeminiRequest(retryTokenLimit);
    return extractJsonPayload(responseData);
  }
}

module.exports = { callClaude };
