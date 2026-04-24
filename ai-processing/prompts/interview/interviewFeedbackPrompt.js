/**
 * /ai-processing/prompts/interviewFeedbackPrompt.js
 */

const buildInterviewFeedbackPrompt = ({
  domain,
  difficulty,
  subtopics,
  duration,
  transcript,
  earlyEndNote,
  courseContext = '',       // ADD
  turnEvaluations = [],     // ADD
}) => `
${courseContext ? `
The following is verified course material for this domain.
Use it to evaluate whether the candidate's answers were aligned with the curriculum.

--- COURSE CONTEXT START ---
${courseContext}
--- COURSE CONTEXT END ---
` : ''}

You are a senior technical interviewer. The candidate has finished a mock interview.
Evaluate performance strictly from the transcript. Be specific: reference what they said or failed to address.

### Interview Context:
- **Domain:** ${domain}
- **Topics/Subtopics Focus:** ${subtopics && subtopics.length > 0 ? subtopics.join(', ') : 'General'}
- **Difficulty:** ${difficulty}
- **Target Duration:** ${duration} minutes
${earlyEndNote ? `- **Note:** ${earlyEndNote}` : ''}

### Transcript:
"""
${transcript}
"""

${turnEvaluations.length > 0 ? `
### Agent Turn Evaluations (internal notes per question):
${turnEvaluations.map((t, i) =>
  `Q${i + 1} [${t.topic}] — Quality: ${t.quality}. ${t.note}`
).join('\n')}

Use these to inform the strengths, weaknesses, and suggestions sections.
` : ''}

### Instructions:
Account for Speech-to-Text artifacts (filler words, minor errors) without heavy penalty.

Return the response in strict JSON only (no markdown):

{
  "score": <number 0-100>,
  "recommendation": "<exactly one of: Strong Fit | Good Fit | Weak Fit>",
  "overallSummary": "<one detailed paragraph citing concrete observations from the transcript>",
  "technicalSkills": "<paragraph on technical depth, accuracy, and problem-solving as shown>",
  "communicationSkills": "<paragraph on clarity, structure, and confidence>",
  "strengths": ["<specific, transcript-based>", "<...>"],
  "weaknesses": ["<specific, transcript-based>", "<...>"],
  "suggestions": ["<actionable, specific next steps>", "<...>"]
}
`;

module.exports = { buildInterviewFeedbackPrompt };
