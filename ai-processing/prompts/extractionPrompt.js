/**
 * Builds the Claude prompt for extracting units and topics from a micro syllabus document.
 * @param {string} rawText - The plain text content of the uploaded document
 * @returns {string} The prompt string
 */
function buildExtractionPrompt(rawText) {
  return `You are an academic document parser for a Computer Science and Engineering LMS.
A teacher has uploaded a micro syllabus document. Extract all units and topics.

=== DOCUMENT TEXT ===
${rawText}

=== EXTRACTION RULES ===

1. Find each unit. Units may be labeled 'Unit 1', 'Module 1', 'Chapter 1',
   'UNIT I', 'UNIT - 1' or similar patterns. Extract unit_number and unit_name.

2. Under each unit extract every topic listed — whether as bullet points,
   numbered lists, comma-separated, or plain lines. Extract all of them.

3. Clean topic names: remove leading numbers, bullets, extra whitespace.
   Capitalize properly. Keep names concise (under 10 words).

4. Do NOT include learning objectives, outcomes, references, or hours
   as topics. Extract only actual topic/subtopic names.

5. Preserve the original unit order exactly as it appears in the document.

=== OUTPUT FORMAT ===

Return ONLY a JSON object. No explanation. No markdown. No preamble.
Must be directly parseable by JSON.parse().

{
  "units": [
    {
      "unit_number": 1,
      "unit_name": "Introduction to Data Structures",
      "topics": ["Arrays", "Linked Lists", "Stacks", "Queues"]
    },
    {
      "unit_number": 2,
      "unit_name": "Trees and Graphs",
      "topics": ["Binary Trees", "BST", "AVL Trees", "Graph Representations"]
    }
  ]
}

If extraction fails, return: { "units": [], "error": "Could not extract" }`;
}

module.exports = { buildExtractionPrompt };
