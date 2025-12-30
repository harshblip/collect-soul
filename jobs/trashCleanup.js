import cron from 'node-cron'
import { pool } from '../config/db.js'

export const trashCleanup = () => {
    // cron.schedule('*/2 * * * *', async () => {
    //     try {
    //         console.log("🧹 Running trash cleanup job...");
    //         const query = `
    //             DELETE FROM trash USING users
    //             WHERE trash.user_id = users.id
    //             AND users.auto_cleanup_enabled = TRUE
    //             AND trash.created_at <= NOW() - INTERVAL '2 minutes';
    //         `
    //         await pool.query(query);
    //     } catch (err) {
    //         console.error("Cron job failed:", err);
    //     }
    // });
}