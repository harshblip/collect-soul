import { pool } from "../../config/db.js"

export const addFilestoFolderFn = async (files, folderId) => {
    for (const file of files) {
        const query = `update files set folder_id = $1 where id = $2`
        await pool.query(query, [folderId, file.id])
    }
    const message = `${files.size} files added to folder`
    return message 
}

export const trashFolderFn = async(userId, folderId) => {
    const folderQuery = `
        WITH RECURSIVE folder_tree AS (
            SELECT id FROM folders WHERE id = $1 AND user_id = $2
            UNION ALL
            SELECT f.id FROM folders f
            INNER JOIN folder_tree ft ON f.parent_id = ft.id
        )
        SELECT id FROM folder_tree
    `;
    const folderResult = await pool.query(folderQuery, [folderId, userId]);
    const folderIds = folderResult.rows.map(row => row.id);

    if (folderIds.length === 0) {
        throw new Error('Folder not found or does not belong to user');
    }

    const updateFoldersQuery = `UPDATE folders SET is_trashed = true WHERE id = ANY($1) AND user_id = $2`;
    await pool.query(updateFoldersQuery, [folderIds, userId]);

    const updateFilesQuery = `UPDATE files SET is_trashed = true WHERE folder_id = ANY($1) AND user_id = $2`;
    await pool.query(updateFilesQuery, [folderIds, userId]);

    const message = `Folder and all contents moved to trash successfully`;
    return message;
}

export const restoreFolderFn = async(userId, folderId) => {
    const folderQuery = `
        WITH RECURSIVE folder_tree AS (
            SELECT id FROM folders WHERE id = $1 AND user_id = $2
            UNION ALL
            SELECT f.id FROM folders f
            INNER JOIN folder_tree ft ON f.parent_id = ft.id
        )
        SELECT id FROM folder_tree
    `;
    const folderResult = await pool.query(folderQuery, [folderId, userId]);
    const folderIds = folderResult.rows.map(row => row.id);

    if (folderIds.length === 0) {
        throw new Error('Folder not found or does not belong to user');
    }

    const updateFoldersQuery = `UPDATE folders SET is_trashed = false WHERE id = ANY($1) AND user_id = $2`;
    await pool.query(updateFoldersQuery, [folderIds, userId]);

    const updateFilesQuery = `UPDATE files SET is_trashed = false WHERE folder_id = ANY($1) AND user_id = $2`;
    await pool.query(updateFilesQuery, [folderIds, userId]);

    const message = `Folder and all contents restored successfully`;
    return message;
}