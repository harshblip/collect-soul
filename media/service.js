const pool = require('../config/db');
const { uploadBufferToS3, createS3Folder } = require('./utils/s3uploader');
const { isValidFileSize } = require('./utils/validator');

const getFileInfo = async (user_id, id) => {
    if (!id) {
        message = "query is empty"
        return message;
    }
    const query = `select * from files where user_id = $1 and id = $2`;
    const result = await pool.query(query, [user_id, id]);
    // console.log(result.rows)
    const images = result.rows
    return images
}

const deleteMediaFn = async (username, files, id) => {
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

    message = `file${files.length > 1 ? `s` : ``} deleted successfully !`
    return message
}

const uploadFileFn = async (file, username, userId, message) => {
    const fileName = file.originalname;
    const folderKey = `${username}/${fileName}/`;
    const fileKey = `${folderKey}${fileName}`;
    const contentType = file.mimetype;
    const size = file.size;

    // Create "folder" in S3 (optional, cosmetic)
    await createS3Folder(folderKey);

    let type = 'undefined';
    let maxMB = 10;

    if (contentType.startsWith('video/')) {
        type = 'video';
        maxMB = 40;
    } else if (contentType.startsWith('image/')) {
        type = 'image';
        maxMB = 20;
    } else if (contentType.startsWith('application/')) {
        type = 'document';
        maxMB = 20;
    }

    if (!isValidFileSize(size, maxMB)) {
        message = `${type} file too big`
        return message;
    }

    const url = await uploadBufferToS3(file.buffer, fileKey, contentType);

    const query = `INSERT INTO files (file_name, file_url, size, user_id, file_type) 
    VALUES ($1, $2, $3, $4, $5)`;
    await pool.query(query, [fileName, url, size, userId, type]);

    message = "File uploaded successfully"
    return message;

}

module.exports = { getFileInfo, deleteMediaFn, uploadFileFn }