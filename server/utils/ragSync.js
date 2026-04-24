/*
 * ragSync.js
 * Fire-and-forget helpers that keep ChromaDB in sync with MongoDB/Cloudinary.
 * Called after upload and delete in materialController.js.
 * Never throws — all errors are caught and logged so the HTTP response is unaffected.
 */

/**
 * Lazy require for ingestMaterial
 */
function getIngestMaterial() {
  try {
    return require('../../ai-processing/utils/ragService').ingestMaterial;
  } catch (e) {
    console.warn('[ragSync] Could not load ragService. RAG sync disabled:', e.message);
    return null;
  }
}

/**
 * syncMaterialToChroma(material)
 * Ingests a new material into ChromaDB.
 */
async function syncMaterialToChroma(material) {
  try {
    const ingestMaterial = getIngestMaterial();
    if (!ingestMaterial) return;

    await ingestMaterial(material);
    console.log(`[ragSync] Ingested material ${material._id} (${material.section}) into ChromaDB.`);
  } catch (error) {
    console.error(`[ragSync] Failed to ingest material ${material._id}: ${error.message}`);
  }
}

/**
 * removeChunksForMaterial(materialId, courseId)
 * Removes all chunks associated with a material from ChromaDB.
 */
async function removeChunksForMaterial(materialId, courseId) {
  try {
    let ChromaClient;
    try {
      const chromadb = require('../../ai-processing/node_modules/chromadb');
      ChromaClient = chromadb.ChromaClient;
    } catch (e) {
      console.warn('[ragSync] Could not load ChromaDB client. Removal disabled:', e.message);
      return;
    }

    const client = new ChromaClient({ 
      path: process.env.CHROMA_DATA_PATH || 'http://localhost:8000' 
    });
    const collectionName = `lms_course_${courseId}`;

    let collection;
    try {
      collection = await client.getCollection({ name: collectionName });
    } catch (e) {
      // If collection doesn't exist, there's nothing to delete - this is not an error
      if (e.message && e.message.includes('does not exist')) {
        return;
      }
      // Re-throw other errors (like connection refused) to be caught by the outer catch
      throw e;
    }

    if (collection) {
      await collection.delete({
        where: { materialId: materialId.toString() }
      });
      console.log(`[ragSync] Removed ChromaDB chunks for material ${materialId}.`);
    }
  } catch (error) {
    console.error(`[ragSync] Failed to remove chunks for material ${materialId}: ${error.message}`);
  }
}

module.exports = { syncMaterialToChroma, removeChunksForMaterial };
