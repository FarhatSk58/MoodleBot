const path = require('path');
const fs = require('fs');

// Models — use existing mongoose connection; do not create a new one
const Topic = require('../../server/models/Topic');
const AIContent = require('../../server/models/AIContent');

const { generateContent } = require('../utils/llmService');
const { buildImportancePrompt } = require('../prompts/importancePrompt');
const { buildQuestionsPrompt } = require('../prompts/questionsPrompt');
const { buildUseCasesPrompt } = require('../prompts/useCasesPrompt');
const { buildTasksPrompt } = require('../prompts/tasksPrompt');
const { buildMiniProjectPrompt } = require('../prompts/miniProjectPrompt');
const { retrieveContext } = require('../utils/ragService');

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
        courseId: topic.courseId ? (topic.courseId._id ? topic.courseId._id.toString() : topic.courseId.toString()) : null,
      };
    })
  );

  // ── PROCESS: Two-step pipeline per topic ─────────────────────────────────
  let successCount = 0;
  let failCount = 0;
  const batchLog = []; // Collects per-topic results for the log file

  for (const topicData of enrichedTopics) {
    console.log(`\n[batchProcessor] Processing topic: "${topicData.topic}"`);

    // RAG: Retrieve course context once per topic, reuse across all prompts
    let courseContext = '';
    try {
      if (topicData.courseId) {
        courseContext = await retrieveContext(topicData.courseId, topicData.topic, 5);
        if (courseContext) {
          console.log(`[batchProcessor] RAG context retrieved for: "${topicData.topic}" (${courseContext.length} chars)`);
        } else {
          console.log(`[batchProcessor] No RAG context found for: "${topicData.topic}", proceeding without it.`);
        }
      }
    } catch (ragError) {
      console.warn(`[batchProcessor] RAG retrieval failed for "${topicData.topic}", continuing without context:`, ragError.message);
    }

    // Call each prompt separately and sequentially
    let importanceResult = null;
    try {
      console.log(`[batchProcessor] Step 1 — Sending importance prompt for: "${topicData.topic}"`);
      importanceResult = await generateContent(buildImportancePrompt(topicData), { taskType: 'generation', maxTokens: 500 });
      console.log(`[batchProcessor] Importance: ${importanceResult.importance_score}`);
    } catch (error) {
      console.error(`[batchProcessor] ✗ Importance scoring failed for "${topicData.topic}":`, error.message);
      await Topic.findByIdAndUpdate(topicData._id, { aiStatus: 'pending_ai' });
      failCount++;
      batchLog.push({ topic: topicData.topic, status: 'failed', step: 'importance', error: error.message });
      continue;
    }

    let questionsResult = { questions: [] };
    try {
      console.log(`[batchProcessor] Step 2 — Sending questions prompt for: "${topicData.topic}"`);
      questionsResult = await generateContent(buildQuestionsPrompt(topicData, importanceResult.importance_score, courseContext), { taskType: 'generation', maxTokens: 2000 });
    } catch (error) {
      console.error(`[batchProcessor] ✗ Questions generation failed for "${topicData.topic}":`, error.message);
    }

    let useCasesResult = { use_cases: [] };
    try {
      console.log(`[batchProcessor] Step 3 — Sending use cases prompt for: "${topicData.topic}"`);
      useCasesResult = await generateContent(buildUseCasesPrompt(topicData, courseContext), { taskType: 'generation', maxTokens: 1000 });
    } catch (error) {
      console.error(`[batchProcessor] ✗ Use cases generation failed for "${topicData.topic}":`, error.message);
    }

    let tasksResult = { tasks: [] };
    try {
      console.log(`[batchProcessor] Step 4 — Sending tasks prompt for: "${topicData.topic}"`);
      tasksResult = await generateContent(buildTasksPrompt(topicData, courseContext), { taskType: 'generation', maxTokens: 2000 });
    } catch (error) {
      console.error(`[batchProcessor] ✗ Tasks generation failed for "${topicData.topic}":`, error.message);
    }

    let miniProjectResult = { mini_project: null };
    try {
      console.log(`[batchProcessor] Step 5 — Sending mini project prompt for: "${topicData.topic}"`);
      miniProjectResult = await generateContent(buildMiniProjectPrompt(topicData), { taskType: 'generation', maxTokens: 1000 });
    } catch (error) {
      console.error(`[batchProcessor] ✗ Mini project generation failed for "${topicData.topic}":`, error.message);
    }

    // ── STEP 6: Save to MongoDB ───────────────────────
    try {
      // Upsert AIContent — handles re-runs gracefully
      const aiContent = await AIContent.findOneAndUpdate(
        { topicId: topicData._id },
        {
          topicId: topicData._id,
          importance_score: importanceResult.importance_score,
          complexity_level: importanceResult.complexity_level,
          weightage_tag: importanceResult.weightage_tag,
          generationFlags: {
            generate_questions: true,
            generate_use_cases: true,
            generate_tasks: importanceResult.importance_score >= 6,
            generate_project: importanceResult.importance_score >= 8,
          },
          interview_questions: questionsResult.questions || [],
          industry_use_cases: useCasesResult.use_cases || [],
          tasks: tasksResult.tasks || [],
          mini_project: miniProjectResult.mini_project || null,
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
        importance_score: importanceResult.importance_score,
        questions_generated: (questionsResult.questions || []).length,
        use_cases_generated: (useCasesResult.use_cases || []).length,
        tasks_generated: (tasksResult.tasks || []).length,
        project_generated: (miniProjectResult.mini_project !== null && miniProjectResult.mini_project !== undefined),
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
