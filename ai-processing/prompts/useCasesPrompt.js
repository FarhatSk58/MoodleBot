/**
 * buildUseCasesPrompt — Generates industry use cases.
 *
 * @param {Object} topicData - { topic, subject, completed_topics }
 * @returns {string} - Prompt for Claude
 */
function buildUseCasesPrompt(topicData, courseContext = '') {
  let contextBlock = '';
  if (courseContext && courseContext.trim()) {
    contextBlock = `The following is verified course material for this topic. Use it as your PRIMARY reference.
Do not invent facts. If the course material covers this topic, base your response on it.

--- COURSE CONTEXT START ---
${courseContext}
--- COURSE CONTEXT END ---

\n\n`;
  }

  return contextBlock + `You are the AI content generation engine for a Learning Management System used by
B.Tech Computer Science and Engineering students in India. Your role is to generate
real-world industry use cases for a given topic.

=== BATCH INPUT ===
Topic: ${topicData.topic}
Subject: ${topicData.subject}
Completed Topics: ${topicData.completed_topics.join(', ')}

=== TASK: INDUSTRY USE CASES ===

Generate 2-5 real-world use cases showing how this topic is used in the industry.

FRAMING RULES — follow these strictly:
  - Always describe at the DOMAIN level: 'E-commerce platforms use X to...'
    not 'Amazon uses X to...' unless you are 100% certain it is publicly
    documented and verifiable. When in doubt, use the domain, not the company.
  - verified_company_example: only fill this if it is a well-known, publicly
    documented fact (e.g., 'Google uses MapReduce for distributed processing').
    If not certain, set to null. NEVER fabricate company claims.
  - Descriptions must be practical and specific. Explain the actual problem
    the topic solves in that domain, not just 'it is used for performance'.

For each use case, generate:
  domain: string (e.g. 'E-commerce Platforms', 'Banking Systems',
          'Real-Time Communication Apps', 'Search Engines')
  title: string (short, descriptive title)
  description: string (2-3 sentences — be specific and practical)
  tools: array of strings of tools or technologies involved
  
=== OUTPUT FORMAT ===
Return ONLY raw JSON with exactly this shape:
{
  "use_cases": [
    {
      "domain": "string",
      "title": "string",
      "description": "string",
      "tools": ["string"]
    }
  ]
}

No markdown fencings, no explanations, no preamble. Just valid JSON.`;
}

module.exports = { buildUseCasesPrompt };
