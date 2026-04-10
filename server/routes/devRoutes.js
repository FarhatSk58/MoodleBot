const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const Topic = require('../models/Topic');
const AIContent = require('../models/AIContent');
const { runBatchProcessor } = require('../../ai-processing/index');

// Protect all dev routes
router.use(verifyToken, authorizeRoles('admin', 'teacher'));

// Prevent execution in production just in case
router.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ success: false, message: 'This endpoint is not available in production.' });
  }
  next();
});

// POST /api/dev/trigger-batch
router.post('/trigger-batch', async (req, res) => {
  try {
    // Run async in background or await it? 
    // The prompt says "Shows a loading spinner while running. Shows success/error toast on completion."
    // If it takes a few seconds we should await it so the frontend knows when it's done. 
    await runBatchProcessor();
    return res.status(200).json({ success: true, message: 'Batch processor triggered manually. Check /ai-processing/results/ for the log.' });
  } catch (error) {
    console.error('[devRoutes] trigger-batch error:', error);
    return res.status(500).json({ success: false, message: 'Failed to trigger batch: ' + error.message });
  }
});

// PATCH /api/dev/topics/:topicId/reset
router.patch('/topics/:topicId/reset', async (req, res) => {
  try {
    const { topicId } = req.params;
    const topic = await Topic.findById(topicId);
    
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found' });
    }

    topic.aiStatus = 'pending_ai';
    if (!topic.completedAt) {
      topic.completedAt = Date.now();
    }

    if (topic.aiContent) {
      await AIContent.findByIdAndDelete(topic.aiContent);
    }
    
    topic.aiContent = null;
    await topic.save();

    return res.status(200).json({ success: true, message: 'Topic reset to pending_ai. It will be picked up on next batch run.' });
  } catch (error) {
    console.error('[devRoutes] reset error:', error);
    return res.status(500).json({ success: false, message: 'Failed to reset topic: ' + error.message });
  }
});

module.exports = router;
