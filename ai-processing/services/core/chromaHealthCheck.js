/*
 * chromaHealthCheck.js
 * Checks if the local ChromaDB server is reachable.
 * Called on ai-processing startup to warn if RAG will be unavailable.
 */

require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');

/**
 * Checks if the local ChromaDB server is reachable or the data path is valid
 */
async function checkChromaConnection() {
  const path = process.env.CHROMA_DATA_PATH || 'http://localhost:8000';
  
  if (path.startsWith('http')) {
    try {
      const response = await fetch(`${path.replace(/\/$/, '')}/api/v2/heartbeat`, { timeout: 2000 });
      if (response.ok) {
        return { connected: true };
      }
      return { connected: false, error: `HTTP ${response.status}` };
    } catch (error) {
      return { connected: false, error: error.message };
    }
  } else {
    // Local path check
    try {
      if (fs.existsSync(path)) {
        return { connected: true, type: 'local' };
      }
      // If it doesn't exist, it might be created on first use, but we'll warn
      return { connected: true, type: 'local', warning: 'Path does not exist yet, will be created' };
    } catch (error) {
      return { connected: false, error: error.message };
    }
  }
}

module.exports = { checkChromaConnection };
