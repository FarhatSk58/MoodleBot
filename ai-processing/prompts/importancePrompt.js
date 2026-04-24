/**
 * buildImportancePrompt — Extracts importance score, complexity level, and weightage tag.
 *
 * @param {Object} topicData - { topic, subject, completed_topics }
 * @returns {string} - Prompt for Claude
 */
function buildImportancePrompt(topicData) {
  return `You are the AI content generation engine for a Learning Management System used by
B.Tech Computer Science and Engineering students in India. Your role is to analyze
the given academic topic and assess its real-world software industry relevance.

=== BATCH INPUT ===
Topic: ${topicData.topic}
Subject: ${topicData.subject}
Completed Topics: ${topicData.completed_topics.join(', ')}

=== TASK: IMPORTANCE SCORING ===

Analyze the topic and determine its importance, complexity, and weightage.

importance_score (integer 1-10):
  Score based on how critical this topic is in the CS/Engineering industry.
  Ask yourself: how often does this appear in technical interviews at product
  companies, how commonly is it used in real software systems, and how
  foundational is it to other topics?
  1-3 = rarely asked, niche usage
  4-6 = moderately important, appears in mid-level interviews
  7-8 = frequently asked, core to most software systems
  9-10 = absolutely fundamental, appears in almost every CS interview

complexity_level: 'beginner' | 'intermediate' | 'advanced'
  How difficult is this topic conceptually for a 2nd year B.Tech student?

weightage_tag: 'core' | 'supporting' | 'optional'
  core = must know to work in software industry
  supporting = helpful but not mandatory
  optional = advanced/niche, good to know

=== OUTPUT FORMAT ===
Return ONLY raw JSON with exactly this shape:
{
  "importance_score": 8,
  "complexity_level": "intermediate",
  "weightage_tag": "core"
}

No markdown fencings, no explanations, no preamble. Just valid JSON.`;
}

module.exports = { buildImportancePrompt };
