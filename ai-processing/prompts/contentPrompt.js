/**
 * contentPrompt.js
 *
 * Builds the SECOND prompt in the two-step pipeline.
 * Responsible ONLY for generating content based on analysis results and generation_flags.
 *
 * Inputs include the topic context + the full analysis result from Step 1.
 * Flags strictly control what gets generated — nothing is generated beyond the flags.
 *
 * @param {Object} contentInput
 *   {
 *     topic: string,
 *     subject: string,
 *     completed_topics: string[],
 *     importance_score: number,
 *     complexity_level: string,
 *     weightage_tag: string,
 *     generation_flags: {
 *       generate_questions: true,
 *       generate_use_cases: boolean,
 *       generate_tasks: boolean,
 *       generate_project: boolean
 *     }
 *   }
 * @returns {string} Prompt string ready to send to Claude
 */
function buildContentPrompt(contentInput) {
  const { generation_flags } = contentInput;

  return `You are the content generation engine for a Learning Management System used by
B.Tech Computer Science and Engineering students in India.

A topic has already been analyzed. You have been given the analysis results and a set of
generation flags. Your job is to generate ONLY the content categories that are flagged true.
Do NOT generate content for categories that are flagged false.

=== TOPIC CONTEXT ===

${JSON.stringify(contentInput, null, 2)}

=== GENERATION INSTRUCTIONS ===

Read the generation_flags carefully before generating anything.

${generation_flags.generate_questions ? `
--- INTERVIEW QUESTIONS (generate_questions = true) ---

Generate interview questions based on importance_score:
  Score 1–4:  1 easy, 1 medium, 1 hard  (3 total)
  Score 5–7:  2 easy, 2 medium, 2 hard  (6 total)
  Score 8–10: 3 easy, 3 medium, 3 hard  (9 total)

Difficulty definitions:
  easy   = conceptual or definition-based. Tests if student understands the concept.
           Example: 'What is a Binary Search Tree?'
  medium = scenario or application-based. Tests if student can apply the concept.
           Example: 'Given a BST, how would you find the kth smallest element?'
  hard   = system-design or trade-off analysis. Tests deep understanding.
           Example: 'When would you use a BST over a hash map and why? Discuss time complexity trade-offs.'

Question quality rules:
  - Questions must reflect what actual CS companies ask in technical interviews
  - Do NOT generate textbook definition questions for medium/hard
  - Hard questions must involve trade-offs, design decisions, or real constraints
  - expected_answer_outline must have 4–6 specific, scoreable points

For each question:
  question_id: string (e.g. 'q1', 'q2', ...)
  question: string
  difficulty: 'easy' | 'medium' | 'hard'
  type: 'conceptual' (easy) | 'scenario' (medium) | 'system-design' (hard)
  expected_answer_outline: array of 4–6 strings (specific, not vague)
` : ''}

${generation_flags.generate_use_cases ? `
--- INDUSTRY USE CASES (generate_use_cases = true) ---

Generate 2–5 real-world use cases. More for higher importance_score.

Rules:
  - Describe at the DOMAIN level: 'E-commerce platforms use X to...'
    not 'Amazon uses X to...' unless publicly documented and verifiable.
  - verified_company_example: only fill if it is a well-known, publicly documented fact.
    If uncertain, set to null. NEVER fabricate.
  - Descriptions must be practical and specific — explain the actual problem solved.

For each use case:
  domain: string (e.g. 'E-commerce Platforms', 'Banking Systems')
  use_case_title: string
  description: string (2–3 specific sentences)
  tools_or_technologies_involved: array of strings
  verified_company_example: string | null
` : ''}

${generation_flags.generate_tasks ? `
--- TASKS (generate_tasks = true) ---

Generate tasks based on importance_score:
  Score 6–7:  2 tasks
  Score 8–10: 3 tasks

Rules:
  - Tasks must be practical and buildable by a 2nd year B.Tech student
  - Chain tasks with completed_topics where relevant
  - For data-heavy topics (SQL, databases, ML): reference a real public dataset/API.
    Set uses_real_data: true and specify data_source.
  - For other topics: keep tasks self-contained and realistic (junior dev quality)
  - Tasks should be completable in 30 mins to 2 hours

For each task:
  task_id: string (e.g. 't1', 't2')
  task_title: string
  description: string (clear, specific — what exactly to build)
  chained_topics: array of strings from completed_topics
  estimated_time: string (e.g. '45 minutes', '1.5 hours')
  uses_real_data: boolean
  data_source: string | null
  skills_practiced: array of strings
` : ''}

${generation_flags.generate_project ? `
--- MINI PROJECT (generate_project = true) ---

Generate ONE mini project. It must be more substantial than a task (2–5 hours).

Rules:
  - Must be MERN stack friendly (MongoDB, Express, React, Node.js)
  - Problem statement must reflect a real startup/product scenario
  - Features must be specific and implementable — not vague goals
  - Chain with completed_topics where relevant

Fields:
  project_title: string
  problem_statement: string (2–3 sentences)
  features_to_implement: array of 4–6 specific strings
  chained_topics: array from completed_topics
  estimated_time: string (e.g. '3–4 hours')
  tech_stack_suggestion: array of strings
  uses_real_data: boolean
  data_source: string | null
` : ''}

=== OUTPUT FORMAT ===

Return ONLY a JSON object. No explanation, no markdown, no preamble.
The response must be directly parseable by JSON.parse().

{
  "topic": "<topic title from input>",
  "processed_at": "<ISO timestamp string>",
  "interview_questions": ${generation_flags.generate_questions ? '[ ... ]' : '[]'},
  "industry_use_cases": ${generation_flags.generate_use_cases ? '[ ... ]' : '[]'},
  "tasks": ${generation_flags.generate_tasks ? '[ ... ]' : '[]'},
  "mini_project": ${generation_flags.generate_project ? '{ ... }' : 'null'}
}

=== ABSOLUTE RULES ===

1. Return ONLY the JSON object. No markdown, no explanation.
2. If a flag is false, that field MUST be an empty array [] or null as specified above.
   Do NOT generate content for false flags even if you think it would be helpful.
3. interview_questions MUST always be present and non-empty (generate_questions is always true).
4. expected_answer_outline points must be specific enough to score a student answer against.
   Vague points like 'explain the concept' are NOT acceptable.
5. Never fabricate verified_company_example claims you are not certain about.`;
}

module.exports = { buildContentPrompt };
