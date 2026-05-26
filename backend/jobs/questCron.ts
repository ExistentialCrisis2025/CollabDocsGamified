import cron from 'node-cron';
import { generateQuestsForAllUsers } from './questGenerator';

/**
 * Quest cron — fires every day at 06:00 server-local time.
 * Generates 3 personalised daily quests for every user.
 */
export function startQuestCron(): void {
  cron.schedule('0 6 * * *', async () => {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    console.log(`[questCron] Generating daily quests for ${today}...`);
    try {
      await generateQuestsForAllUsers(today);
      console.log('[questCron] Done.');
    } catch (err: any) {
      console.error('[questCron] Failed:', err.message);
    }
  });

  console.log('[questCron] Scheduled — fires daily at 06:00.');
}
