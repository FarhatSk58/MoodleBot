/*
 * ragSync.test.js
 * Manual smoke test for ragSync helpers.
 * Run with: node utils/ragSync.test.js
 * Requires ChromaDB running: chroma run --path ./chroma_db
 */

const { syncMaterialToChroma, removeChunksForMaterial } = require('./ragSync');

async function runTest() {
  console.log('--- Starting RAG Sync Smoke Test ---');

  const testMaterial = {
    _id: 'test_material_001',
    courseId: 'test_course_001',
    section: 'syllabus',
    unitNumber: null,
    fileUrl: 'https://res.cloudinary.com/demo/raw/upload/sample.pdf',
    fileType: 'application/pdf'
  };

  try {
    console.log('\n1. Testing syncMaterialToChroma...');
    // syncMaterialToChroma is internally fire-and-forget but it's an async function we can await here for the test
    await syncMaterialToChroma(testMaterial);
    
    console.log('\n2. Testing removeChunksForMaterial...');
    await removeChunksForMaterial('test_material_001', 'test_course_001');

    console.log('\n--- Smoke Test Completed ---');
  } catch (err) {
    console.error('\n!!! Smoke Test Error:', err.message);
  } finally {
    process.exit(0);
  }
}

runTest();
