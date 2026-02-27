import cron from 'node-cron'
import { pool } from '../config/db.js'
import { deleteFromS3 } from '../media/services/media.service.js';

export const trashCleanup = () => {
    cron.schedule('*/30 * * * *', async () => {
        try {
            console.log("🧹 Running trash cleanup job...");
            const query = `
                SELECT files.id, files.file_name, users.username
                FROM files
                JOIN users ON files.user_id = users.id
                WHERE users.auto_cleanup_enabled = TRUE AND files.is_trashed = TRUE
                AND files.trashed_at <= NOW() - INTERVAL '30 minutes';
             `
            const { rows: filesToDelete } = await pool.query(query);

            if (filesToDelete.length === 0) {
                console.log("✅ No files to clean up.");
                return;
            }

            const successfullyDeletedIds = []
            for (const file of filesToDelete) {
                try {
                    await deleteFromS3(file.username, file.file_name);

                    successfullyDeletedIds.push(file.id);
                } catch (s3Err) {
                    console.error(`❌ Failed to delete file ${file.file_name} from S3:`, s3Err);
                }
            }

            if (successfullyDeletedIds.length > 0) {
                const deleteQuery = `
                    DELETE FROM files
                    WHERE id = ANY($1)
                `;
                await pool.query(deleteQuery, [successfullyDeletedIds]);
                console.log(`✅ Successfully removed ${successfullyDeletedIds.length} files from S3 and DB.`);
            }

        } catch (err) {
            console.error("Cron job failed:", err);
        }
    });
}