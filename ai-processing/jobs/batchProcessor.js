const path = require('path');
const fs = require('fs');

// Models — use existing mongoose connection; do not create a new one
const Topic = require('../../server/models/Topic');
const AIContent = require('../../server/models/AIContent');

const { callClaude } = require('../utils/claudeClient');
const { buildTopicAnalysisPrompt } = require('../prompts/topicAnalysisPrompt');
const { buildContentPrompt } = require('../prompts/contentPrompt');

/**
 * runBatchProcessor — Main nightly batch function.
 * Called by the cron job in /server/utils/cronJob.js.
 *
 * Two-step pipeline per topic:
 *   Step 1 — Topic Analysis  : Claude returns metadata + generation_flags
 *   Step 2 — Content Generation: Claude generates content guided by flags
 *   Step 3 — Save to DB       : AIContent document saved, Topic updated
 */
async function runBatchProcessor() {
  console.log('\n[batchProcessor] Starting AI batch processing (two-step pipeline)...');
  const batchDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // ── FETCH: Get all topics pending AI processing ───────────────────────────
  let pendingTopics;
  try {
    pendingTopics = await Topic.find({ aiStatus: 'pending_ai' })
      .populate('courseId', 'title')
      .lean();
  } catch (dbError) {
    console.error('[batchProcessor] Failed to fetch pending topics:', dbError.message);
    throw dbError;
  }

  if (!pendingTopics || pendingTopics.length === 0) {
    console.log('[batchProcessor] No topics pending AI processing. Exiting batch.');
    return;
  }

  console.log(`[batchProcessor] Found ${pendingTopics.length} topic(s) to process.`);

  // ── LOCK: Mark all as 'processing' to prevent re-entry ───────────────────
  const topicIds = pendingTopics.map((t) => t._id);
  try {
    await Topic.updateMany(
      { _id: { $in: topicIds } },
      { $set: { aiStatus: 'processing' } }
    );
    console.log('[batchProcessor] Topics locked with aiStatus = processing.');
  } catch (lockError) {
    console.error('[batchProcessor] Failed to lock topics:', lockError.message);
    throw lockError;
  }

  // ── BUILD: Enrich topics with completed_topics context ───────────────────
  const enrichedTopics = await Promise.all(
    pendingTopics.map(async (topic) => {
      const courseTitle = topic.courseId ? topic.courseId.title : 'Unknown Subject';

      const completedSiblings = await Topic.find({
        courseId: topic.courseId ? topic.courseId._id : topic.courseId,
        _id: { $ne: topic._id },
        completedAt: { $ne: null },
      })
        .select('title')
        .lean();

      return {
        _id: topic._id,
        topic: topic.title,
        subject: courseTitle,
        completed_topics: completedSiblings.map((t) => t.title),
      };
    })
  );

  // ── PROCESS: Two-step pipeline per topic ─────────────────────────────────
  let successCount = 0;
  let failCount = 0;
  const batchLog = []; // Collects per-topic results for the log file

  for (const topicData of enrichedTopics) {
    console.log(`\n[batchProcessor] Processing topic: "${topicData.topic}"`);

    let analysisResult = null;
    let contentResult = null;

    // ── STEP 1: Topic Analysis ─────────────────────────────────────────────
    try {
      const analysisPrompt = buildTopicAnalysisPrompt({
        topic: topicData.topic,
        subject: topicData.subject,
        completed_topics: topicData.completed_topics,
      });

      console.log(`[batchProcessor] Step 1 — Sending analysis prompt for: "${topicData.topic}"`);
      analysisResult = await callClaude(analysisPrompt, 500);

      console.log(
        `[batchProcessor] Analysis result: score=${analysisResult.importance_score} ` +
        `flags=${JSON.stringify(analysisResult.generation_flags)}`
      );
    } catch (analysisError) {
      console.error(
        `[batchProcessor] ✗ Step 1 failed for "${topicData.topic}":`,
        analysisError.message
      );
      // Revert this topic to pending_ai for retry tomorrow
      await Topic.findByIdAndUpdate(topicData._id, { aiStatus: 'pending_ai' });
      failCount++;
      batchLog.push({ topic: topicData.topic, status: 'failed', step: 'analysis', error: analysisError.message });
      continue;
    }

    // ── STEP 2: Content Generation ─────────────────────────────────────────
    try {
      const contentPrompt = buildContentPrompt({
        topic: topicData.topic,
        subject: topicData.subject,
        completed_topics: topicData.completed_topics,
        importance_score: analysisResult.importance_score,
        complexity_level: analysisResult.complexity_level,
        weightage_tag: analysisResult.weightage_tag,
        generation_flags: analysisResult.generation_flags,
      });

      console.log(`[batchProcessor] Step 2 — Sending content prompt for: "${topicData.topic}"`);
      contentResult = await callClaude(contentPrompt, 4000);

      console.log(`[batchProcessor] Content generated for: "${topicData.topic}"`);
    } catch (contentError) {
      console.error(
        `[batchProcessor] ✗ Step 2 failed for "${topicData.topic}":`,
        contentError.message
      );
      await Topic.findByIdAndUpdate(topicData._id, { aiStatus: 'pending_ai' });
      failCount++;
      batchLog.push({ topic: topicData.topic, status: 'failed', step: 'content', error: contentError.message });
      continue;
    }

    // ── STEP 3: Safety enforcement + Save to MongoDB ───────────────────────
    try {
      const flags = analysisResult.generation_flags;

      // Safety enforcement — override AI response if flags say false
      const industry_use_cases = flags.generate_use_cases
        ? (contentResult.industry_use_cases || [])
        : [];
      const tasks = flags.generate_tasks
        ? (contentResult.tasks || [])
        : [];
      const mini_project = flags.generate_project
        ? (contentResult.mini_project || null)
        : null;

      // Upsert AIContent — handles re-runs gracefully
      const aiContent = await AIContent.findOneAndUpdate(
        { topicId: topicData._id },
        {
          topicId: topicData._id,
          importance_score: analysisResult.importance_score,
          complexity_level: analysisResult.complexity_level,
          weightage_tag: analysisResult.weightage_tag,
          generationFlags: {
            generate_questions: true,
            generate_use_cases: flags.generate_use_cases,
            generate_tasks: flags.generate_tasks,
            generate_project: flags.generate_project,
          },
          interview_questions: contentResult.interview_questions || [],
          industry_use_cases,
          tasks,
          mini_project,
          review_status: 'pending_review',
          published: false,
          processedAt: new Date(),
        },
        { upsert: true, new: true, runValidators: true }
      );

      // Update Topic: link AIContent and advance to pending_review
      await Topic.findByIdAndUpdate(topicData._id, {
        $set: {
          aiContent: aiContent._id,
          aiStatus: 'pending_review',
        },
      });

      console.log(`[batchProcessor] ✓ Saved AIContent for topic: "${topicData.topic}"`);
      successCount++;
      batchLog.push({
        topic: topicData.topic,
        status: 'success',
        importance_score: analysisResult.importance_score,
        generation_flags: flags,
        questions_generated: (contentResult.interview_questions || []).length,
        use_cases_generated: industry_use_cases.length,
        tasks_generated: tasks.length,
        project_generated: mini_project !== null,
      });
    } catch (saveError) {
      console.error(
        `[batchProcessor] ✗ Step 3 (save) failed for "${topicData.topic}":`,
        saveError.message
      );
      await Topic.findByIdAndUpdate(topicData._id, { aiStatus: 'pending_ai' });
      failCount++;
      batchLog.push({ topic: topicData.topic, status: 'failed', step: 'save', error: saveError.message });
    }
  }

  // ── LOG: Write JSON log to /results/YYYY-MM-DD.json ──────────────────────
  try {
    const resultsDir = path.join(__dirname, '..', 'results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    const logPath = path.join(resultsDir, `${batchDate}.json`);
    const logData = {
      batch_date: batchDate,
      processed_at: new Date().toISOString(),
      topics_attempted: pendingTopics.length,
      topics_succeeded: successCount,
      topics_failed: failCount,
      results: batchLog,
    };
    fs.writeFileSync(logPath, JSON.stringify(logData, null, 2), 'utf8');
    console.log(`\n[batchProcessor] Batch log saved to: ${logPath}`);
  } catch (logError) {
    // Non-fatal — data is in MongoDB regardless
    console.warn('[batchProcessor] Warning: Failed to write batch log file:', logError.message);
  }

  // ── SUMMARY ───────────────────────────────────────────────────────────────
  console.log(
    `\n[batchProcessor] Batch complete on ${batchDate}. ` +
    `Success: ${successCount}/${pendingTopics.length} | Failed: ${failCount}/${pendingTopics.length}\n`
  );
}

module.exports = { runBatchProcessor };
