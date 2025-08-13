import cron from 'node-cron'
import { pool } from '../config/db.js'

export const trashCleanup = () => {
    // cron.schedule('*/2 * * * *', async () => {
    //     try {
    //         console.log("🧹 Running trash cleanup job...");
    //         const query = `delete from trash where created_at <= NOW() - INTERVAL '2 minutes'`
    //         await pool.query(query);
    //     } catch (err) {
    //         console.error("Cron job failed:", err);
    //     }
    // });
}