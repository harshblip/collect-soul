const cron = require('node-cron')
const { pool } = require('../config/db')

const trashCleanup = () => {
    cron.schedule('*/2 * * * *', async () => {
        try {
            console.log("🧹 Running trash cleanup job...");
            await pool.query(`delete from trash where created_at <= NOW() - INTERVAL '2 minutes'`);
        } catch (err) {
            console.error("Cron job failed:", err);
        }
    });
}

module.exports = trashCleanup;