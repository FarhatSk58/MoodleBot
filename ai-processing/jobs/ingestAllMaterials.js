/*
 * ingestAllMaterials.js
 * One-time (or periodic) script to ingest all course materials into ChromaDB.
 * Run manually with: node jobs/ingestAllMaterials.js
 * Make sure ChromaDB is running (chroma run --path C:/dev-data/moodlebot-chroma) before executing.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Material = require('../../server/models/curriculum/Material');
const { ingestMaterial } = require('../services/core/ragService');

async function runIngestion() {
  let successCount = 0;
  let failureCount = 0;

  try {
    console.log('[Ingest] Connecting to MongoDB...');
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing in .env');
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[Ingest] Connected.');

    const materials = await Material.find({});
    console.log(`[Ingest] Found ${materials.length} materials to process.`);

    for (let i = 0; i < materials.length; i++) {
      const material = materials[i];
      const { courseId, section } = material;
      
      console.log(`[Ingest] Processing material ${i + 1} of ${materials.length}: section="${section}" course="${courseId}"`);
      
      try {
        const result = await ingestMaterial(material);
        if (result.success) {
          successCount++;
        } else {
          console.warn(`[Ingest] Material skipped: ${result.reason}`);
          failureCount++;
        }
      } catch (err) {
        console.error(`[Ingest] Error processing material ${material._id}:`, err.message);
        failureCount++;
      }
    }

    console.log('[Ingest] Ingestion completed.');
    console.log(`[Ingest] Total Success: ${successCount}`);
    console.log(`[Ingest] Total Failure: ${failureCount}`);

  } catch (error) {
    console.error('[Ingest] Fatal error during ingestion:', error.message);
  } finally {
    try {
      await mongoose.disconnect();
      console.log('[Ingest] MongoDB disconnected.');
    } catch (e) {}
    process.exit(0);
  }
}

runIngestion();
