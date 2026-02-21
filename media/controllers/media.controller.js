import { upload } from '../../middlewares/fileChecker.js';
import { pool, s3 } from '../../config/db.js';
import { deleteMediaFn, getFileInfo, getTrashedFilesFn, recoverMediaFn, renameMediaFn, trashMediaFn, uploadFileFn } from '../services/media.service.js';

let message = ''

export const postMedia = async (req, res) => {
    return new Promise((res, rej) => {
        upload.array('file')(req, res, async (err) => {
            if (err) {
                console.log("multer validation error: ", err.message);
                console.error(err);
                return { message: err.message }
            }
            try {
                // console.log("yooohoooo", req.body)
                const username = req.body.username
                const userId = req.body.userId
                const files = req.files;
                const userFolderKey = `${username}`;

                const listParams = {
                    Bucket: process.env.S3_BUCKET_NAME,
                    Prefix: userFolderKey,
                    MaxKeys: 1,
                }

                const existingFolder = await s3.listObjectsV2(listParams).promise();

                if (existingFolder.Contents.length === 0) {
                    await s3.putObject({
                        Bucket: process.env.S3_BUCKET_NAME,
                        Key: userFolderKey,
                    }).promise();
                }

                for (const file of files) {
                    await uploadFileFn(file, username, userId, message)
                }

                return { message: message }
            } catch (err) {
                console.error(err);
                return { message: err.message }
            }
        });
    })
};


export const getFileInfoController = async (req, res) => {
    const { user_id, id } = req.query;
    try {
        const result = await getFileInfo(user_id, id)
        return res.status(200).json({ message: result })
    } catch (err) {
        message = err.message
        console.error(err);
        return res.status(500).json({ message: err.message })
    }

}

export const deleteMedia = async (req, res) => {
    const { username, files, id } = req.query;
    try {
        const message = await deleteMediaFn(username, files, id)
        return res.status(200).json({ message: message })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message })
    }
}

export const renameMedia = async (req, res) => {
    const { username, oldFileName, newFileName, user_id } = req.body;
    console.log(username, oldFileName, newFileName)
    try {
        const message = await renameMediaFn(username, oldFileName, newFileName, user_id)
        return res.status(201).json({ message: message })
    } catch (err) {
        console.log("error in renameMedia: ", err);
        console.error(err);
        return res.status(500).json({ message: err.message })
    }
    // return message
}

export const trashMedia = async (req, res) => {
    const { files } = req.body;
    const client = await pool.connect();

    try {
        const message = await trashMediaFn(files)
        res.status(200).json({ message: message })
    } catch (err) {
        await client.query('ROLLBACK')
        console.error(err);
        return res.status(500).json({ message: err.message })
    } finally {
        client.release()
    }
}

export const getTrashedFiles = async (req, res) => {
    const { userId } = req.query

    try {
        const message = await getTrashedFilesFn(userId)
        return res.status(200).json({ message: message })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

export const recoverMedia = async (req, res) => {
    const { files } = req.body;
    const client = await pool.connect();

    try {
        const message = await recoverMediaFn(files)
        res.status(200).json({ message: message })
    } catch (err) {
        await client.query('ROLLBACK')
        console.error(err);
        return res.status(500).json({ message: err.message })
    } finally {
        client.release()
    }
}

export const starFile = async (req, res) => {
    const { userId, id } = req.body;

    try {
        const query = `update files set starred = not starred where user_id = $1 and id = $2`
        await pool.query(query, [userId, id])
        return res.status(201).json({ message: 'file starred' })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

export const getStars = async (req, res) => {
    const { userId } = req.query;

    try {
        const query = `select * from files where user_id = $1 and starred = $2 and is_trashed = $3`
        const result = await pool.query(query, [userId, true, false])

        return res.status(200).json({ message: result.rows })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

export const enableDelete = async (req, res) => {
    const { userId, checked } = req.body;

    try {
        const query = `update users set auto_cleanup_enabled = $2 where id = $1`
        await pool.query(query, [userId, checked])

        const mesquery = `select auto_cleanup_enabled from users where id = $1`
        const msg = await pool.query(mesquery, [userId])
        console.log("messagerows", msg.rows[0].auto_cleanup_enabled)
        return res.status(200).json({ message: msg.rows[0].auto_cleanup_enabled })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

export const getAllFiles = async (req, res) => {
    const { user_id, page } = req.query;
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
                is_locked,
                password,
                0 as parent_id,
                created_at,
                is_trashed,
                starred,
                size
            FROM files
            WHERE user_id = $1 AND folder_id IS NULL AND is_trashed = $4

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
                false as is_trashed,
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
        const result = await pool.query(query, [user_id, limit, offset, false])
        const rows = result.rows
        return res.status(200).json({ message: rows })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message })
    }
}
