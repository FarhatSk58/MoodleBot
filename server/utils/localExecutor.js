const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const TEMP_DIR = path.join(__dirname, '../temp_code');

const ensureTempDir = async () => {
  try {
    await fs.mkdir(TEMP_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create temp directory:', err);
  }
};

const extensions = {
  javascript: 'js',
  python: 'py',
  java: 'java',
};

/**
 * Execute code locally using child_process.exec
 * @param {string} language - javascript | python | java
 * @param {string} code - The source code to run
 * @param {string} stdin - Optional input for the program
 * @returns {Promise<{stdout: string, stderr: string, exitCode: number}>}
 */
const executeCode = async (language, code, stdin = '') => {
  await ensureTempDir();
  const id = crypto.randomUUID();
  const ext = extensions[language.toLowerCase()];
  
  if (!ext) {
    throw new Error(`Unsupported language: ${language}`);
  }

  // Java requires the filename to match the public class name. 
  // For simplicity, we assume the user provides a class named "Main" or we wrap it.
  // Actually, let's just use "Main.java" and unique folders to avoid conflicts.
  const workDir = path.join(TEMP_DIR, id);
  await fs.mkdir(workDir, { recursive: true });

  let filename = `temp.${ext}`;
  if (language.toLowerCase() === 'java') {
    filename = 'Main.java';
  }

  const filePath = path.join(workDir, filename);
  await fs.writeFile(filePath, code);

  let command = '';
  switch (language.toLowerCase()) {
    case 'javascript':
      command = `node ${filename}`;
      break;
    case 'python':
      command = `python ${filename}`;
      break;
    case 'java':
      command = `javac Main.java && java Main`;
      break;
    default:
      throw new Error(`Unsupported language: ${language}`);
  }

  return new Promise((resolve) => {
    const process = exec(command, { cwd: workDir, timeout: 10000 }, async (error, stdout, stderr) => {
      // Cleanup
      try {
        // We use a small delay to ensure files aren't locked on Windows
        setTimeout(async () => {
          try {
            await fs.rm(workDir, { recursive: true, force: true });
          } catch (e) {
            console.error('Cleanup error:', e);
          }
        }, 500);
      } catch (cleanupErr) {
        console.error('Cleanup failed:', cleanupErr);
      }

      const isTimeout = error && error.signal === 'SIGTERM';
      const errorMessage = isTimeout 
        ? 'Execution timed out (10s limit exceeded).' 
        : (error ? error.message : '');

      resolve({
        stdout: stdout || '',
        stderr: stderr || errorMessage,
        exitCode: error ? (error.code || (isTimeout ? 124 : 1)) : 0,
      });
    });

    if (process.stdin) {
      if (stdin) {
        process.stdin.write(stdin);
      }
      process.stdin.end();
    }
  });
};

module.exports = { executeCode };
