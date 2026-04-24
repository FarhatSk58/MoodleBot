export function detectLanguageFromSkills(skillsPracticed) {
  if (!skillsPracticed?.length) return 'python';
  const skills = skillsPracticed.map((s) => String(s).toLowerCase());
  if (skills.some((s) => s.includes('java') && !s.includes('script'))) return 'java';
  if (skills.some((s) => s.includes('c++') || s.includes('cpp'))) return 'cpp';
  if (skills.some((s) => s.includes('javascript') || s.includes('js'))) return 'javascript';
  if (skills.some((s) => s.includes('python'))) return 'python';
  return 'python';
}

export function resolveTaskDifficulty(task, topicComplexity) {
  const d = String(task?.difficulty || '').toLowerCase();
  if (d === 'easy' || d === 'medium' || d === 'hard') return d;
  const map = { beginner: 'easy', intermediate: 'medium', advanced: 'hard' };
  return map[topicComplexity] || 'medium';
}

export function resolveTaskStatus(progress) {
  const best = progress?.bestScore;
  const attempts = progress?.totalAttempts ?? 0;
  if (best != null && best >= 10) return 'completed';
  if (attempts > 0 || (best != null && best < 10)) return 'in_progress';
  return 'not_started';
}

export function taskDraftStorageKey(topicId, taskIndex) {
  return `lms_task_draft:${topicId}:${taskIndex}`;
}

const BOILERPLATES = {
  python: `# Write your code below\n\ndef solve():\n    print("Hello from Python!")\n\nif __name__ == "__main__":\n    solve()`,
  javascript: `// Write your code below\n\nfunction solve() {\n    console.log("Hello from JavaScript!");\n}\n\nsolve();`,
  java: `// Write your code below\n// Do not change the class name 'Main'\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n    }\n}`,
  cpp: `// Write your code below\n#include <iostream>\n\nint main() {\n    std::cout << "Hello from C++!" << std::endl;\n    return 0;\n}`,
};

export function getBoilerplate(language) {
  return BOILERPLATES[language] || '';
}
