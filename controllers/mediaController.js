const aws = require('aws-sdk');
const sharp = require('sharp')
const upload = require('../middlewares/fileChecker');
const pool = require('../config/db');
const axios = require('axios');

aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const s3 = new aws.S3({
    signatureVersion: 'v4'
});

let message = '';

const postMedia = async (req, _) => {
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
                    const fileName = file.originalname;
                    const mediaFolderKey = `${username}/${fileName}/`;
                    const fileKey = `${mediaFolderKey}${fileName}`;

                    await s3.putObject({
                        Bucket: process.env.S3_BUCKET_NAME,
                        Key: mediaFolderKey,
                    }).promise();

                    if (file.mimetype.startsWith('video/')) {

                        if (file.size > 40 * 1024 * 1024) {
                            message = "video file too big"
                            return res(message)
                        }

                        const params = {
                            Bucket: process.env.S3_BUCKET_NAME,
                            Key: fileKey,
                            ContentType: file.mimetype,
                            Expires: 60
                        };

                        const signedUrl = s3.getSignedUrl('putObject', params);

                        await axios.put(signedUrl, file.buffer, {
                            headers: {
                                'Content-Type': file.mimetype
                            }
                        });

                        const videoUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`

                        const query = `insert into files (file_name, file_url, size, user_id, file_type) values ($1, $2, $3, $4, $5)`
                        await pool.query(query, [fileName, videoUrl, file.size, 3, 'video'])

                    } else if (file.mimetype.startsWith('image/')) {
                        const originalImage = file.buffer;

                        if (file.size > 20 * 1024 * 1024) {
                            message = "image too big"
                            return res(message)
                        }

                        const uploadImage = {
                            Bucket: process.env.S3_BUCKET_NAME,
                            Key: fileKey,
                            Expires: 60,
                            ContentType: file.mimetype
                        }

                        const originalUpload = s3.getSignedUrl('putObject', uploadImage);

                        await axios.put(originalUpload, originalImage, {
                            headers: {
                                'Content-Type': file.mimetype
                            }
                        })

                        const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`

                        const query = `insert into files (file_name, file_url, size, user_id, file_type) values ($1, $2, $3, $4, $5)`
                        await pool.query(query, [fileName, imageUrl, file.size, 3, 'image']);

                    } else if (file.mimetype.startsWith('application/')) {
                        const fileo = file.buffer;
                        // console.log(file)
                        if (file.size > 20 * 1024 * 1024) {
                            const message = "file tooooooo bigg"
                            return res(message)
                        }
                        const params = {
                            Bucket: process.env.S3_BUCKET_NAME,
                            Key: fileKey,
                            Expires: 60,
                            ContentType: file.mimetype
                        }

                        const pdf = s3.getSignedUrl('putObject', params);

                        await axios.put(pdf, fileo, {
                            headers: {
                                'Content-Type': file.mimetype
                            }
                        })
                        const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
                        const query = `insert into files (file_name, file_url, size, user_id, file_type) values ($1, $2, $3, $4, $5)`
                        await pool.query(query, [fileName, url, file.size, 3, 'document'])
                    } else {
                        const fileo = file.buffer;

                        if (file.size > 10 * 1024 * 1024) {
                            message = "audio file too big"
                            return res(message)
                        }

                        const params = {
                            Bucket: process.env.S3_BUCKET_NAME,
                            Key: fileKey,
                            Expires: 60,
                            ContentType: file.mimetype
                        }

                        const music = s3.getSignedUrl('putObject', params);

                        await axios.put(music, fileo, {
                            headers: {
                                'Content-Type': file.mimetype
                            }
                        })

                        const url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`
                        const query = `insert into files (user_id, file_name, file_url, size, file_type) values ($1, $2, $3, $4, $5)`;
                        await pool.query(query, [3, fileName, url, file.size, 'audio'])

                    }
                }
                message = "Files uploaded successfully!"
                return res.status(201).json({ message: message })
            } catch (err) {
                console.error(err);
                return res.status(500).json({ message: err.message })
            }
        });
    })
};


const getFileInfo = async (req, res) => {
    const { user_id, id } = req.query;
    try {
        if (!id) {
            message = "query is empty"
            return message;
        }
        const query = `select * from files where user_id = $1 and id = $2`;
        const result = await pool.query(query, [user_id, id]);
        // console.log(result.rows)
        images = result.rows
        return res.status(200).json({ message: images })
    } catch (err) {
        message = err.message
        console.error(err);
        return res.status(500).json({ message: err.message })
    }

}

const deleteMedia = async (req, _) => {
    const { username, files, id } = req.query;
    try {
        for (const fileName of files) {
            const filePath = `${username}/${fileName}/`;

            const listParams = {
                Bucket: process.env.S3_BUCKET_NAME,
                Prefix: filePath
            }

            const listedObjects = await s3.listObjectsV2(listParams).promise();

            if (!listedObjects.Contents.length) {
                message = "Folder not found or already deleted"
                return message;
            }

            const deleteParam = {
                Bucket: process.env.S3_BUCKET_NAME,
                Delete: {
                    Objects: listedObjects.Contents.map(obj => ({ Key: obj.Key }))
                }
            }

            await s3.deleteObjects(deleteParam).promise();

            const query = `delete from files where file_name = $1 and user_id = $2`;
            pool.query(query, [fileName, id]);
        }
        if (files.length > 1) {
            message = "files deleted successfully !"
        } else {
            message = "file deleted successfully !"
        }
        return res.status(200).json({ message: message })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message })
    }
}

const renameMedia = async (req, _) => {
    const { username, oldFileName, newFileName, user_id, type } = req.body;
    console.log(username, oldFileName, newFileName)
    const oldPrefix = `${username}/${oldFileName}/`
    const newPrefix = `${username}/${newFileName}/`

    try {
        const bucketName = process.env.S3_BUCKET_NAME

        // list all objects of the folder
        const listedObjects = await s3.listObjectsV2({
            Bucket: bucketName,
            Prefix: oldPrefix
        }).promise()

        if (!listedObjects.Contents.length) {
            message = "No files found under the old folder name."
            return res.status(404).json({ message: message })
        }

        let urls = []

        // copy the objects and replace the name
        const copyPromise = listedObjects.Contents.map(async (x) => {
            const oldKey = x.Key;

            const suffix = oldKey.substring(oldPrefix.length); // like: oldFileName, oldFileName_display.webp
            const updatedSuffix = suffix.replace(oldFileName, newFileName); // updated file name
            const newKey = `${newPrefix}${updatedSuffix}`;

            const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${newKey.replace(/ /g, '+')}`;
            // console.log(newKey, fileUrl)

            urls.push(fileUrl)

            return s3.copyObject({
                Bucket: bucketName,
                CopySource: `${bucketName}/${oldKey}`,
                Key: newKey
            }).promise()
        })

        await Promise.all(copyPromise);

        // console.log(urls[1]);

        const query = `update files set file_name = $1, file_url = $2 where user_id = $3 AND file_name = $4`
        await pool.query(query, [newFileName, urls[1], user_id, oldFileName])
        // delete objects
        const deleteParams = {
            Bucket: bucketName,
            Delete: {
                Objects: listedObjects.Contents.map(obj => ({ Key: obj.Key }))
            }
        }

        await s3.deleteObjects(deleteParams).promise()

        message = "files renamed!"
        return res.status(201).json({ message: message })
    } catch (err) {
        console.log("error in renameMedia: ", err);
        console.error(err);
        return res.status(500).json({ message: err.message })
    }
    // return message
}

const createFolder = async (req, _) => {
    const { id, name, description, is_locked } = req.body;
    try {
        const query = `insert into folders (user_id, name, description, is_locked) values ($1, $2, $3, $4)`
        await pool.query(query, [id, name, description, is_locked])
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
        const query = `
        SELECT * FROM files 
        WHERE user_id = $1 
        ORDER BY f.created_at DESC;`

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
        await client.query('BEGIN')
        for (const file of files) {
            const { fileName, url, size, type, fileId, id } = file
            console.log(fileName, url, size, type, fileId)
            const query1 = `update files set is_trashed = $1 where id = $2`
            await client.query(query1, [true, fileId])

            const query2 = `insert into trash (file_name, file_url, size, user_id, file_type, file_id) values ($1, $2, $3, $4, $5, $6)`
            await client.query(query2, [fileName, url, size, id, type, fileId])
        }
        await client.query('COMMIT')
        res.status(200).json({ message: "media trashed" })
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
        await client.query('BEGIN')
        for (const file of files) {
            const { fileId, id } = file
            // console.log(fileName, url, size, fileId)
            const query1 = `update files set is_trashed = $1 where id = $2`
            await client.query(query1, [false, fileId])

            const query2 = `delete from trash where id = $1`
            await client.query(query2, [id])
        }
        await client.query('COMMIT')
        res.status(200).json({ message: "media recovered" })
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

module.exports = { postMedia, getFileInfo, deleteMedia, getVideos, renameMedia, createFolder, getFolders, getAllFiles, trashMedia, recoverMedia, folderItems, starFile, getStars };