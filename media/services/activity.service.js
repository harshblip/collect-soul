import { pool } from '../../config/db.js';

export const updateLastSeenFn = async (fileId, type) => {
    const query = `update ${type} set updated_at = $1 where id = $2`
    await pool.query(query, [new Date(), fileId])
    const message = `updated last seen`
    return message
}

export const getLastOpenedFiles = async (userId) => {
    const query = `
        SELECT 
            id,
            user_id,
            file_name,
            file_type,
            file_url,
            false as is_locked,
            '' as password,
            0 as parent_id,
            created_at,
            updated_at,
            starred,
            size
        FROM files
        WHERE user_id = $1 and folder_id is null
        UNION ALL
        SELECT 
        id,
        user_id,
        file_name,
        null as file_url,
        'folder' AS file_type,
        is_locked,
        password,
        parent_id,
        created_at,
        updated_at,
        starred,
        size
        FROM folders
        WHERE user_id = $1 and parent_id is null
        ORDER BY updated_at DESC
    `
    const result = await pool.query(query, [userId])
    const res = result.rows
    return res
}