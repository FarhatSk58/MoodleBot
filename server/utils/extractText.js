const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

/**
 * Extract plain text from a file buffer.
 * @param {Buffer} buffer - The raw file buffer
 * @param {string} mimetype - The MIME type of the file
 * @returns {Promise<string>} Plain text content
 */
async function extractTextFromFile(buffer, mimetype) {
  if (mimetype === 'application/pdf') {
    const result = await pdfParse(buffer);
    return result.text;
  }

  if (
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimetype === 'application/msword'
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  throw new Error(
    'Unsupported file type. Only PDF and Word (.docx) files are supported.'
  );
}

module.exports = { extractTextFromFile };
