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

function byteToSize(kb) {
    const arr = ['bytes', 'KB', 'MB']
    const i = parseInt(Math.floor(Math.log(kb) / Math.log(1024)), 10)
    if (i === 0) return i;
    return `${(kb / (1024 ** i)).toFixed(1)}${arr[i]}`
}

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
                const { id } = req.body;
                const username = req.body.username;
                const files = req.files;
                const response = [];

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

                        const query = `insert into videos (file_name, file_url, size, user_id) values ($1, $2, $3, $4)`
                        await pool.query(query, [fileName, videoUrl, file.size, 3])

                    } else if (file.mimetype.startsWith('image/')) {
                        const originalImage = file.buffer;

                        if (file.size > 20 * 1024 * 1024) {
                            message = "image too big"
                            return res(message)
                        }

                        const thumbnailImage = await sharp(file.buffer)
                            .resize(150)
                            .webp({ quality: 80 })
                            .toBuffer()
                        const displayImage = await sharp(file.buffer)
                            .resize(800)
                            .webp({ quality: 90 })
                            .toBuffer()

                        const uploadOriginalImage = {
                            Bucket: process.env.S3_BUCKET_NAME,
                            Key: fileKey,
                            Expires: 60,
                            ContentType: file.mimetype
                        }

                        const originalUpload = s3.getSignedUrl('putObject', uploadOriginalImage);

                        await axios.put(originalUpload, originalImage, {
                            headers: {
                                'Content-Type': file.mimetype
                            }
                        })

                        const originalImageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`

                        const tfileKey = `${mediaFolderKey}${fileName}_thumbnail.webp`;
                        const uploadthumbnailImage = {
                            Bucket: process.env.S3_BUCKET_NAME,
                            Key: tfileKey,
                            Expires: 60,
                            ContentType: 'image/webp'
                        }

                        const thumbnailUpload = s3.getSignedUrl('putObject', uploadthumbnailImage);

                        await axios.put(thumbnailUpload, thumbnailImage, {
                            headers: {
                                'Content-Type': file.mimetype
                            }
                        })

                        const thumbmailImageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${tfileKey}`

                        const dfileKey = `${mediaFolderKey}${fileName}_display.webp`;
                        const uploaddisplayImage = {
                            Bucket: process.env.S3_BUCKET_NAME,
                            Key: dfileKey,
                            Expires: 60,
                            ContentType: 'image/webp'
                        }

                        const displayUpload = s3.getSignedUrl('putObject', uploaddisplayImage);

                        await axios.put(displayUpload, displayImage, {
                            headers: {
                                'Content-Type': file.mimetype
                            }
                        })

                        const displayImageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${dfileKey}`;

                        const query = `insert into images (file_name, file_url, thumbnail_image_url, display_image_url, size, user_id) values ($1, $2, $3, $4, $5, $6)`
                        await pool.query(query, [fileName, originalImageUrl, thumbmailImageUrl, displayImageUrl, file.size, 3]);

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
                        const query = `insert into documents (file_name, file_url, size, user_id) values ($1, $2, $3, $4)`
                        await pool.query(query, [fileName, url, file.size, 3])
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
                        const query = `insert into audio (user_id, file_name, file_url, size) values ($1, $2, $3, $4)`;
                        await pool.query(query, [3, fileName, url, file.size])

                    }
                }
                message = "Files uploaded successfully!"
                return message
            } catch (err) {
                console.error(err);
                return res.status(500).json({ message: err.message })
            }
        });
    })
};


const getImages = async (req, _) => {
    const { id } = req.query;
    try {
        if (!id) {
            message = "userid is needed to get their images"
            return message;
        }
        const query = `select * from images where user_id = $1`;
        const result = await pool.query(query, [id]);
        // console.log(result.rows)
        images = result.rows
        return images
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

            const query = `delete from images where file_name = $1 and user_id = $2`;
            pool.query(query, [fileName, id]);
        }
        if (files.length > 1) {
            message = "images deleted successfully !"
        } else {
            message = "image deleted successfully !"
        }
        return message
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message })
    }
}


const getVideos = async (req, _) => {
    const { id } = req.query;
    try {
        if (!id) {
            message = "user id is missing"
            return message
        }
        const query = `select * from videos where user_id = $1`;
        await pool.query(query, [id]);
        message = "videos retrieved"
        return message
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
            return message
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

        if (type === 'image') {
            const query = `update images set file_name = $1, file_url = $4, display_image_url = $5, thumbnail_image_url = $6 where user_id = $2 AND file_name = $3`
            await pool.query(query, [newFileName, user_id, oldFileName, urls[1], urls[2], urls[3]])
        } else if (type === 'documents') {
            const query = `update documents set file_name = $1, file_url = $2 where user_id = $3 AND file_name = $4`
            await pool.query(query, [newFileName, urls[1], user_id, oldFileName])
        } else if (type === 'audio') {
            const query = `update audio set file_name = $1, file_url = $2 where user_id = $3 AND file_name = $4`
            await pool.query(query, [newFileName, urls[1], user_id, oldFileName])
        } else {
            const query = `update videos set file_name = $1, file_url = $2 where user_id = $3 AND file_name = $4`
            await pool.query(query, [newFileName, urls[1], user_id, oldFileName])
        }
        // delete objects
        const deleteParams = {
            Bucket: bucketName,
            Delete: {
                Objects: listedObjects.Contents.map(obj => ({ Key: obj.Key }))
            }
        }

        await s3.deleteObjects(deleteParams).promise()

        message = "files renamed!"
        return message
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
        return message
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
        return message
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message })
    }
}

const getImageByFolder = (req, res) => {

}

const getVideosByFolder = (req, res) => {

}

const getAllFiles = (req, res) => {
    const { email } = req.query
    try {
        const query = `
            SELECT 
            u.email,
            f.file_type,
            f.file_id,
            f.url,
            f.created_at
        FROM users u
        JOIN (
            SELECT 'image' AS file_type, id AS file_id, user_id, url, created_at FROM images
            UNION ALL
            SELECT 'video' AS file_type, id AS file_id, user_id, url, created_at FROM videos
            UNION ALL
            SELECT 'document' AS file_type, id AS file_id, user_id, url, created_at FROM documents
            UNION ALL
            SELECT 'audio' AS file_type, id AS file_id, user_id, url, created_at FROM audios
        ) AS f ON u.id = f.user_id
        WHERE u.email = $1
        ORDER BY f.created_at DESC;
        `
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message })
    }
}

module.exports = { postMedia, getImages, deleteMedia, getVideos, renameMedia, createFolder, getFolders };