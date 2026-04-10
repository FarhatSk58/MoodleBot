const cron = require('node-cron');
const { runBatchProcessor } = require('../../ai-processing');

const startCronJob = () => {
  const schedule = process.env.BATCH_CRON_SCHEDULE || '0 23 * * *';

  cron.schedule(schedule, async () => {
    console.log(`\n[CRON] AI batch job triggered at ${new Date().toISOString()}`);
    try {
      console.log('[CRON] Starting AI batch processing...');
      await runBatchProcessor();
      console.log('[CRON] AI batch processing complete.');
    } catch (err) {
      console.error('[CRON] AI batch processor failed:', err.message);
    }
  });

  console.log(`[CRON] AI batch job scheduled with pattern: "${process.env.BATCH_CRON_SCHEDULE || '0 23 * * *'}"`);
};

module.exports = startCronJob;
