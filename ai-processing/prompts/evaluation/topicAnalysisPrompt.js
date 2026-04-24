/**
 * topicAnalysisPrompt.js
 *
 * Builds the FIRST prompt in the two-step pipeline.
 * Responsible ONLY for analyzing a single topic and returning:
 *   - importance_score, complexity_level, weightage_tag
 *   - generation_flags (what content should be generated next)
 *
 * Does NOT generate any interview questions, use cases, tasks, or projects.
 *
 * @param {Object} topicInput
 *   {
 *     topic: string,
 *     subject: string,
 *     completed_topics: string[]
 *   }
 * @returns {string} Prompt string ready to send to Claude
 */
function buildTopicAnalysisPrompt(topicInput) {
  return `You are the topic analysis engine for a Learning Management System used by
B.Tech Computer Science and Engineering students in India.

Your ONLY job in this step is to ANALYZE a topic and decide:
1. How important and complex it is
2. What categories of content should be generated for it

You must NOT generate interview questions, use cases, tasks, or mini projects here.
That happens in a separate step. Your output is purely metadata and generation decisions.

=== TOPIC TO ANALYZE ===

${JSON.stringify(topicInput, null, 2)}

=== ANALYSIS RULES ===

--- importance_score (integer 1–10) ---

How critical is this topic in the CS/Engineering industry?
  1–3  = rarely asked, niche or purely historical
  4–6  = moderately important, appears in mid-level interviews
  7–8  = frequently asked, core to most software systems
  9–10 = absolutely fundamental, appears in almost every CS interview

--- complexity_level ---

How difficult is this topic conceptually for a 2nd year B.Tech student?
  'beginner'     = introductory concept, straightforward
  'intermediate' = requires understanding of prior concepts
  'advanced'     = deep theory, system-level thinking required

--- weightage_tag ---

  'core'       = must know to work in the software industry
  'supporting' = helpful but not mandatory
  'optional'   = advanced or niche — good to know

--- generation_flags ---

Decide what content categories should be generated for this topic.

generate_questions:
  ALWAYS true. Every topic gets interview questions. No exceptions.

generate_use_cases:
  true  = topic has clear, modern, real-world industrial relevance
          (used by software teams, cloud systems, production APIs, etc.)
  false = topic is purely theoretical, historical, or academic with
          no direct real-world tooling application
          Example: "History of Computing", "Formal Languages (theory only)"

generate_tasks:
  true  = topic can be practically implemented by a student in code
          (a student can write, run, and test something meaningful)
  false = topic is conceptual/definitional only with no buildable output
          Example: "OSI Model Layers" as pure theory

generate_project:
  true  = topic supports building a meaningful system or feature
          that integrates multiple concepts and fits MERN stack
  false = topic is too narrow, historical, or conceptual to build a project around

=== OUTPUT FORMAT ===

Return ONLY a JSON object. No explanation, no markdown, no preamble.
The response must be directly parseable by JSON.parse().

{
  "topic": "<topic title from input>",
  "importance_score": <integer 1–10>,
  "complexity_level": "beginner" | "intermediate" | "advanced",
  "weightage_tag": "core" | "supporting" | "optional",
  "generation_flags": {
    "generate_questions": true,
    "generate_use_cases": <boolean>,
    "generate_tasks": <boolean>,
    "generate_project": <boolean>
  }
}

ABSOLUTE RULES:
1. Return ONLY the JSON object. Nothing else.
2. generate_questions MUST always be true. Never set it to false.
3. Base your flag decisions on real-world CS industry standards — not academic tradition.
4. Do NOT include any content (questions, tasks, use cases, projects) in this response.`;
}

module.exports = { buildTopicAnalysisPrompt };
