import { upload } from '../../middlewares/fileChecker.js';
import { pool, s3 } from '../../config/db.js';

export const createFolder = async (req, res) => {
    const { id, name, description, is_locked, password, parent_id } = req.body;
    try {
        const query = `insert into folders (user_id, file_name, description, is_locked, password, parent_id) values ($1, $2, $3, $4, $5, $6)`
        await pool.query(query, [id, name, description, is_locked, password, parent_id])
        const message = "new folder created"
        return res.status(201).json({ message: message })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message })
    }
}

export const getFolders = async (req, res) => {
    const { id } = req.query
    try {
        const query = `select * from folders where user_id = $1`
        const result = await pool.query(query, [id])
        console.log("folders: ", result.rows)
        message = result.rows
        return res.status(200).json({ message: result.rows })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message })
    }
}

export const getImageByFolder = (req, res) => {

}

export const addFilestoFolder = async (req, res) => {
    const { files, folderId } = req.body
    try {
        const message = await addFilestoFolderFn(files, folderId)
        return res.status(201).json({ message: message })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message })
    }
}

export const getAllFiles = async (req, res) => {
    const { user_id, page } = req.query
    const limit = 15
    const offset = (page - 1) * limit
    try {
        const query = `
        WITH combined AS (
            SELECT 
                id,
                user_id,
                file_name,
                file_type,
                file_url,
                false as is_locked,
                password,
                0 as parent_id,
                created_at,
                starred,
                size
            FROM files
            WHERE user_id = $1 AND folder_id IS NULL

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
                starred,
                size
        FROM folders
            WHERE user_id = $1 AND parent_id IS NULL
        ),
        total_count AS (
            SELECT COUNT(*) as total FROM combined
        )
        SELECT 
            *,
            (SELECT total FROM total_count) AS total_count
        FROM combined
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3;
        `
        const result = await pool.query(query, [user_id, limit, offset])
        rows = result.rows
        return res.status(200).json({ message: rows })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message })
    }
}

export const folderItems = async (req, res) => {
    const { userId, folderId } = req.query
    try {
        console.log(userId, folderId)
        const query = `SELECT 
            id,
            user_id,
            file_name,
            file_type,
            file_url,
            false as is_locked,
            '' as password,
            0 as parent_id,
            created_at,
            starred,
            size
        FROM files
        WHERE user_id = $1 and folder_id = $2
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
            starred,
            size
        FROM folders
        WHERE user_id = $1 and parent_id = $2`
        const result = await pool.query(query, [userId, folderId])
        res.status(200).json({ message: result.rows })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}