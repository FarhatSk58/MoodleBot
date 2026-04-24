/**
 * buildMiniProjectPrompt — Generates a mini project.
 *
 * @param {Object} topicData - { topic, subject, completed_topics }
 * @returns {string} - Prompt for Claude
 */
function buildMiniProjectPrompt(topicData) {
  return `You are the AI content generation engine for a Learning Management System used by
B.Tech Computer Science and Engineering students in India. Your role is to generate
a comprehensive mini project for a given topic.

=== BATCH INPUT ===
Topic: ${topicData.topic}
Subject: ${topicData.subject}
Completed Topics: ${topicData.completed_topics.join(', ')}

=== TASK: MINI PROJECT ===

Generate one mini project for this topic. It must be more substantial than a task.

MINI PROJECT RULES:
  - Should take 2-5 hours to complete.
  - Must be MERN stack friendly — MongoDB, Express, React, Node.js (or relevant to the topic).
  - Problem statement must be realistic — something a startup or product
    team would actually build, not an academic assignment.
  - Features should be specific and implementable, not vague goals.

=== OUTPUT FORMAT ===
Return ONLY raw JSON with exactly this shape:
{
  "mini_project": {
    "title": "string",
    "description": "string",
    "requirements": ["string"],
    "tech_stack": ["string"],
    "suggested_approach": "string"
  }
}

No markdown fencings, no explanations, no preamble. Just valid JSON.`;
}

module.exports = { buildMiniProjectPrompt };
