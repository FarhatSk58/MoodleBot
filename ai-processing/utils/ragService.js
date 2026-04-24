/*
 * ragService.js
 * Core RAG pipeline: downloads materials from Cloudinary, extracts text,
 * chunks it, embeds it locally, and stores/retrieves from ChromaDB.
 * Used by ragMiddleware.js to inject relevant course context into LLM prompts.
 */

require('dotenv').config();
const { pipeline } = require('@xenova/transformers');
const { ChromaClient } = require('chromadb');
const fetch = require('node-fetch');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

let embedder = null;
const chromaClient = new ChromaClient({ 
  path: process.env.CHROMA_DATA_PATH || 'http://localhost:8000' 
});

/**
 * Splits text into overlapping word-based chunks
 */
function chunkText(text, chunkSize = 500, overlap = 50) {
  if (!text) return [];
  const words = text.split(/\s+/);
  const chunks = [];
  
  for (let i = 0; i < words.length; i += (chunkSize - overlap)) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.trim()) {
      chunks.push(chunk);
    }
    // Avoid infinite loop if chunkSize <= overlap
    if (i + chunkSize >= words.length || chunkSize <= overlap) break;
  }
  
  return chunks;
}

/**
 * Uses @xenova/transformers for local embeddings
 */
async function embedChunks(chunks) {
  if (!embedder) {
    console.log('[RAG] Downloading embedding model for the first time (~80MB). This only happens once.');
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }

  const embeddings = [];
  for (const chunk of chunks) {
    const output = await embedder(chunk, { pooling: 'mean', normalize: true });
    embeddings.push(Array.from(output.data));
  }
  return embeddings;
}

/**
 * Gets or creates a ChromaDB collection
 */
async function getOrCreateCollection(collectionName) {
  return await chromaClient.getOrCreateCollection({
    name: collectionName,
  });
}

/**
 * Ingests a material: extracts, chunks, embeds, and stores
 */
async function ingestMaterial(material) {
  const { _id, courseId, section, unitNumber, fileUrl, fileType } = material;
  const materialId = String(_id);
  
  try {
    console.log(`[RAG] Ingesting material: ${materialId} (Course: ${courseId})`);
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error(`Failed to download file from Cloudinary: ${response.statusText}`);
    
    const buffer = await response.buffer();
    let text = '';

    if (fileType === 'pdf' || fileUrl.toLowerCase().endsWith('.pdf')) {
      const data = await pdf(buffer);
      text = data.text;
    } else if (fileType === 'docx' || fileUrl.toLowerCase().endsWith('.docx')) {
      const data = await mammoth.extractRawText({ buffer });
      text = data.value;
    }

    if (!text || text.trim().length === 0) {
      console.warn(`[RAG] Empty text extracted for material ${materialId}`);
      return { success: false, reason: 'empty text' };
    }

    const chunks = chunkText(text);
    const embeddings = await embedChunks(chunks);
    const collection = await getOrCreateCollection(`lms_course_${courseId}`);

    const ids = chunks.map((_, i) => `${materialId}_chunk_${i}`);
    const metadatas = chunks.map((_, i) => ({
      materialId: materialId,
      section: String(section),
      unitNumber: Number(unitNumber || 0),
      chunkIndex: i
    }));

    await collection.add({
      ids,
      embeddings,
      documents: chunks,
      metadatas
    });

    return { success: true, chunksStored: chunks.length };
  } catch (error) {
    console.error(`[RAG] Error ingesting material ${materialId}:`, error.message);
    throw error;
  }
}

/**
 * Retrieves top K relevant context chunks
 */
async function retrieveContext(courseId, query, topK = 5) {
  try {
    const queryEmbedding = await embedChunks([query]);
    const collectionName = `lms_course_${courseId}`;
    
    // Check if collection exists
    let collection;
    try {
      collection = await chromaClient.getCollection({ name: collectionName });
    } catch (e) {
      // Collection doesn't exist
      return '';
    }

    if (!collection) return '';

    const results = await collection.query({
      queryEmbeddings: queryEmbedding,
      nResults: topK,
    });

    if (!results || !results.documents || results.documents[0].length === 0) {
      return '';
    }

    return results.documents[0].join('\n\n---\n\n');
  } catch (error) {
    console.error(`[RAG] Error retrieving context for course ${courseId}:`, error.message);
    return '';
  }
}

module.exports = { ingestMaterial, retrieveContext, chunkText };
