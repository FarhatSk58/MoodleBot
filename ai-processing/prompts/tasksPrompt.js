/**
 * buildTasksPrompt — Generates programming tasks and test cases.
 *
 * @param {Object} topicData - { topic, subject, completed_topics }
 * @returns {string} - Prompt for Claude
 */
function buildTasksPrompt(topicData, courseContext = '') {
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
practical programming tasks and robust test cases for a given topic.

=== BATCH INPUT ===
Topic: ${topicData.topic}
Subject: ${topicData.subject}
Completed Topics: ${topicData.completed_topics.join(', ')}

=== TASK: TASKS AND TEST CASES ===

Generate 2-3 practical, buildable programming tasks.

TASK GENERATION RULES:
  - Tasks must be practical and buildable by a 2nd year B.Tech student
  - Look at the completed_topics list provided for this topic. Chain tasks
    meaningfully — if the student already knows Arrays and Recursion, a BST
    task should build on that, not treat the student as a beginner.
  - Keep tasks self-contained but realistic. The task should feel like something 
    a junior developer would be asked to build, not a typical textbook exercise.
  - Tasks should be completable in 30 mins to 2 hours.

--- TASK TEST CASES ---

For each task you generate, also generate 3 to 5 test cases.
Each test case must have exactly two fields: input and expected_output.

Rules for test cases:
- Outputs must be exact and predictable. integers or simple strings only.
- Never use floating point outputs.
- Never use outputs that depend on formatting, spacing, or newlines.
- Never use random or time-dependent outputs.
- Inputs should be passed as a single string that the program reads from stdin.
- Expected output should be exactly what the program prints to stdout, nothing more.
- Test cases must vary in complexity — at least one simple case, one edge case (empty input, zero, single element), one larger input.
- Make sure the test cases are actually solvable with the task description you wrote. They must be consistent with each other.

=== OUTPUT FORMAT ===
Return ONLY raw JSON with exactly this shape:
{
  "tasks": [
    {
      "title": "string",
      "description": "string",
      "estimated_time": "string",
      "skills": ["string"],
      "test_cases": [
        {
          "input": "string",
          "expected_output": "string"
        }
      ]
    }
  ]
}

No markdown fencings, no explanations, no preamble. Just valid JSON.`;
}

module.exports = { buildTasksPrompt };
