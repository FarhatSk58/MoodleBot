/*
 * ragMiddleware.js
 * Wraps any LLM prompt with relevant course context retrieved from ChromaDB.
 * Call enrichPromptWithContext() before passing a prompt to llmService.generateContent().
 */

const { retrieveContext } = require('./ragService');

/**
 * Enriches a prompt with retrieved context from course materials
 */
async function enrichPromptWithContext(courseId, rawPrompt, topK = 5) {
  const TIMEOUT_MS = 5000;

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("ChromaDB timeout")), TIMEOUT_MS)
  );

  try {
    const context = await Promise.race([
      retrieveContext(courseId, rawPrompt, topK),
      timeoutPromise
    ]);
    
    if (context && context.trim().length > 0) {
      return `Use the following course material as your PRIMARY reference.
Base your response strictly on this content. Do not hallucinate or invent facts.

--- COURSE CONTEXT START ---
${context}
--- COURSE CONTEXT END ---

${rawPrompt}`;
    } else {
      console.log(`[RAG] No context found for courseId: ${courseId}. Proceeding without RAG.`);
      return rawPrompt;
    }
  } catch (error) {
    console.warn(`[RAG] ChromaDB unreachable or timed out for courseId: ${courseId}:`, error.message);
    return rawPrompt;
  }
}

module.exports = { enrichPromptWithContext };
