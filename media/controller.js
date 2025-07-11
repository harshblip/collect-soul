const upload = require('../middlewares/fileChecker');
const { getFileInfo, deleteMediaFn, uploadFileFn, renameMediaFn, recoverMediaFn, trashMediaFn } = require('./service');
const { pool, s3 } = require('../config/db')

let message = '';

const postMedia = async (req, res) => {
    return new Promise((res, rej) => {
        upload.array('file')(req, res, async (err) => {
            if (err) {
                console.log("multer validation error: ", err.message);
                console.error(err);
                return res.status(500).json({ message: err.message })
            }
            try {
                const username = req.body.username;
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
                    await uploadFileFn(file, username, 3, message)
                }

                return { message: message }
            } catch (err) {
                console.error(err);
                return { message: err.message }
            }
        });
    })
};


const getFileInfoController = async (req, res) => {
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

const deleteMedia = async (req, _) => {
    const { username, files, id } = req.query;
    try {
        const message = await deleteMediaFn(username, files, id)
        return res.status(200).json({ message: message })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message })
    }
}

const renameMedia = async (req, res) => {
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

const createFolder = async (req, _) => {
    const { id, name, description, is_locked, password } = req.body;
    try {
        const query = `insert into folders (user_id, name, description, is_locked, password) values ($1, $2, $3, $4, $5)`
        await pool.query(query, [id, name, description, is_locked, password])
        message = "new folder created"
        return res.status(201).json({ message: message })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message })
    }
}

const getFolders = async (req, _) => {
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

const getImageByFolder = (req, res) => {

}

const getAllFiles = async (req, res) => {
    const { user_id } = req.query
    try {
        const query = `SELECT * FROM files 
        LEFT JOIN folders ON files.user_id = folders.user_id
        WHERE files.user_id = $1;`
        const result = await pool.query(query, [user_id])
        rows = result.rows
        return res.status(200).json({ message: rows })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message })
    }
}

const folderItems = async (req, res) => {
    const { userId, folderId } = req.query
    try {
        const query = `SELECT * FROM files WHERE folder_id = $1 AND user_id = $2;`
        const result = await pool.query(query, [userId, folderId])
        res.status(200).json({ message: result.rows })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

const trashMedia = async (req, res) => {
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

const recoverMedia = async (req, res) => {
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

const starFile = async (req, res) => {
    const { userId, id } = req.body;

    try {
        const query = `update files set starred = not starred where user_id = $1 and id = $2`
        await pool.query(query, [userId, id])
        return res.status(201).json({ message: 'file starred' })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

const getStars = async (req, res) => {
    const { userId } = req.query;

    try {
        const query = `select * from images where user_id = $1 and starred = $2`
        const result = await pool.query(query, [userId, true])

        return res.status(200).json({ message: result.rows })
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

module.exports = { postMedia, getFileInfoController, deleteMedia, renameMedia, createFolder, getFolders, getAllFiles, trashMedia, recoverMedia, folderItems, starFile, getStars };