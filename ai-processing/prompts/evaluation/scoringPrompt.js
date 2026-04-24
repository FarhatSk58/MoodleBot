/**
 * buildScoringPrompt — Builds the complete prompt string for live answer scoring.
 *
 * @param {Object} input
 *   {
 *     topic: string,
 *     question: string,
 *     difficulty: 'easy' | 'medium' | 'hard',
 *     question_type: 'conceptual' | 'scenario' | 'system-design',
 *     expected_answer_outline: string[],
 *     student_answer: string
 *   }
 * @returns {string} - Complete prompt string ready to send to Claude
 */
function buildScoringPrompt(input, courseContext = '') {
  let contextBlock = '';
  if (courseContext && courseContext.trim()) {
    contextBlock = `The following is verified course material for this topic. Use it as your PRIMARY reference.
Do not invent facts. If the course material covers this topic, base your response on it.

--- COURSE CONTEXT START ---
${courseContext}
--- COURSE CONTEXT END ---

\n\n`;
  }

  return contextBlock + `You are an expert technical interview evaluator for a Computer Science and
Engineering Learning Management System. A student has submitted an answer to
an interview-style question. Your job is to evaluate it honestly and return
detailed, actionable feedback.

Your feedback directly helps students improve. Be honest — do not inflate
scores to be encouraging. A student who gets 4/10 with clear feedback
learns more than one who gets 8/10 with vague praise.

=== INPUT ===

Topic: ${input.topic}
Question: ${input.question}
Difficulty: ${input.difficulty}
Question Type: ${input.question_type}
Expected Answer Outline: ${JSON.stringify(input.expected_answer_outline)}
Student's Answer: ${input.student_answer}

=== SCORING APPROACH ===

IF difficulty is 'easy':
  Use HOLISTIC scoring.
  Read the student's full answer. Compare it against the expected_answer_outline.
  Assign a single overall_score from 0 to 10.
  Scoring guide:
    0-3:  Answer is incorrect, missing, or completely off-topic
    4-5:  Partial understanding, major gaps
    6-7:  Correct understanding but missing important details
    8-9:  Strong answer covering most key points
    10:   Perfect — covers all key points clearly and concisely

IF difficulty is 'medium' or 'hard':
  Use CRITERIA-BASED scoring.
  Score the answer across 4 dimensions, each out of 10.
  Then compute the weighted overall_score based on question_type:

  For 'conceptual' questions (medium):
    accuracy:        weight 0.40
    depth:           weight 0.25
    use_of_examples: weight 0.20
    clarity:         weight 0.15

  For 'scenario' questions (medium):
    accuracy:        weight 0.30
    depth:           weight 0.30
    use_of_examples: weight 0.25
    clarity:         weight 0.15

  For 'system-design' questions (hard):
    accuracy:        weight 0.25
    depth:           weight 0.35
    use_of_examples: weight 0.25
    clarity:         weight 0.15

  Dimension definitions:
    accuracy:        Is the core concept correct? Are there factual errors?
    depth:           Did the student go beyond surface level? Did they explain
                     why, not just what? For hard questions: did they discuss
                     trade-offs, edge cases, or design decisions?
    use_of_examples: Did they use a concrete example, analogy, or real-world
                     scenario to support their answer?
    clarity:         Is the answer well-structured and easy to follow?

  Compute overall_score = sum of (dimension_score * weight) for all 4 dimensions.
  Round to 1 decimal place.

=== FEEDBACK RULES ===

Always generate these three feedback fields regardless of difficulty:

correct_parts:
  What did the student get right? Be specific — reference their actual words
  or ideas. Do not give generic praise like 'good understanding'.
  Say exactly what was correct and why it matters.

missing_parts:
  What key points from the expected_answer_outline were absent or weak?
  Be direct. If they missed something important, say it clearly.
  Do not soften this section — students need to know what they missed.

improvement_tips:
  2 tips for easy questions, 3 tips for medium/hard questions.
  Each tip must be specific to CS/Engineering — not generic study advice.
  Good: 'Practice tracing through BST insertion with paper — draw the tree
        at each step to build intuition for rotations'
  Bad:  'Study more about this topic'

Tone: Write like a senior engineer doing a code review — direct, honest,
constructive. Not harsh, not overly encouraging. Just clear and useful.

=== OUTPUT FORMAT ===

Return ONLY a JSON object. No explanation, no markdown, no preamble.
The response must be directly parseable by JSON.parse().

For easy questions:
{
  "difficulty": "easy",
  "scoring_type": "holistic",
  "overall_score": <number 0-10>,
  "feedback": {
    "correct_parts": "string",
    "missing_parts": "string",
    "improvement_tips": ["tip1", "tip2"]
  }
}

For medium or hard questions:
{
  "difficulty": "medium" or "hard",
  "scoring_type": "criteria-based",
  "criteria_scores": {
    "accuracy":        { "score": <0-10>, "weight": <decimal>, "comment": "string" },
    "depth":           { "score": <0-10>, "weight": <decimal>, "comment": "string" },
    "use_of_examples": { "score": <0-10>, "weight": <decimal>, "comment": "string" },
    "clarity":         { "score": <0-10>, "weight": <decimal>, "comment": "string" }
  },
  "overall_score": <computed weighted score, 1 decimal>,
  "feedback": {
    "correct_parts": "string",
    "missing_parts": "string",
    "improvement_tips": ["tip1", "tip2", "tip3"]
  }
}

NOTE: The comment field in each criteria_score should be 1-2 sentences explaining
why that dimension received that score. This helps students understand what they
lacked in each area specifically.`;
}

module.exports = { buildScoringPrompt };
