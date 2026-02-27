import { isValidFileSize, removeFileExtension } from '../utils/validator.js';
import { pool, s3 } from '../../config/db.js';
import { createS3Folder, uploadBufferToS3 } from '../utils/s3uploader.js';
import { findFolder } from '../utils/nestedFolders.js';

export const getFileInfo = async (user_id, id) => {
    if (!id) {
        message = "query is empty"
        return message;
    }
    const query = `select * from files where user_id = $1 and id = $2`;
    const result = await pool.query(query, [user_id, id]);
    const images = result.rows[0]

    let path = []
    console.log(result)

    if(images[0].folder_id){
        await findFolder(images[0].folder_id, path)
    }

    const fileInfo = {
        file: images[0],
        filePath: path
    }

    return fileInfo
}

export async function deleteFromS3(username, fileName) {
    const filePath = `${username}/${fileName}/`;

    const listParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Prefix: filePath
    }

    const listedObjects = await s3.listObjectsV2(listParams).promise();

    if (!listedObjects.Contents.length) {
        const message = "Folder not found or already deleted"
        return message;
    }

    const deleteParam = {
        Bucket: process.env.S3_BUCKET_NAME,
        Delete: {
            Objects: listedObjects.Contents.map(obj => ({ Key: obj.Key }))
        }
    }

    await s3.deleteObjects(deleteParam).promise();
}

export const deleteMediaFn = async (username, files, id) => {
    for (const fileName of files) {

        await deleteFromS3(username, fileName)

        const query = `update files set is_trashed = $1  where file_name = $2 and user_id = $3`;
        pool.query(query, [true, fileName, id]);
    }

    message = `file${files.length > 1 ? `s` : ``} deleted successfully !`
    return message
}

export const uploadFileFn = async (file, username, userId, message) => {
    const notfileName = file.originalname;
    const fileName = removeFileExtension(notfileName)
    const folderKey = `${username}/${fileName}/`;
    const fileKey = `${folderKey}${fileName}`;
    const thumbnailKey = `${folderKey}${fileName}-thumbnail`
    const contentType = file.mimetype;
    const size = file.size;

    // Create "folder" in S3 (optional, cosmetic)
    await createS3Folder(folderKey);

    let type = 'undefined';
    let maxMB = 10;
    if (contentType.startsWith('audio/')) {
        type = 'audio';
        maxMB = 20;
    } else if (contentType.startsWith('video/')) {
        type = 'video';
        maxMB = 100;
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
    const client = await pool.connect();
    try {
        await client.query('BEGIN')
        const url = await uploadBufferToS3(file.buffer, fileKey, thumbnailKey, contentType);
        console.log(url, userId)

        const query = `INSERT INTO files (file_name, file_url, size, user_id, file_type) 
        VALUES ($1, $2, $3, $4, $5)`;
        await pool.query(query, [fileName, url, size, userId, type]);

        await client.query('COMMIT')

        message = "File uploaded successfully"
        return message;
    } catch (err) {
        await client.query('ROLLBACK');
        deleteFromS3(fileName)
        console.error("Transaction failed, rolled back.", err);
        throw err;
    } finally {
        client.release()
    }
}

export const renameMediaFn = async (username, oldFileName, newFileName, user_id) => {
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

            const suffix = oldKey.substring(oldPrefix.length);

            const updatedSuffix = suffix.replace(oldFileName, newFileName);
            const newKey = `${newPrefix}${updatedSuffix}`;

            const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${newKey.replace(/ /g, '+')}`;

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
        return message
    } catch (err) {
        console.log("error in renameMedia: ", err);
        console.error(err);
        return err.message
    }
}

export const recoverMediaFn = async (files) => {

    for (const file of files) {
        const { fileId } = file;

        const query = `UPDATE files SET is_trashed = $1 WHERE id = $2`;
        await pool.query(query, [false, fileId]);
    }
    return 'media recovered';
}

export const trashMediaFn = async (files) => {
    for (const file of files) {
        const { fileId } = file;
        const curr_timestamp = new Date().toISOString()
        const query = `UPDATE files SET is_trashed = $1, trashed_at = $2 WHERE id = $3`;
        await pool.query(query, [true, curr_timestamp, fileId]);
    }

    return 'media trashed';
}

export const getTrashedFilesFn = async (userId) => {
    if (!userId) {
        const msg = "userId is empty"
        return msg
    }

    const query = `select * from files where user_id = $1 and is_trashed = $2`;
    const trashedMedia = await pool.query(query, [userId, true])
    // console.log(trashedMedia.rows)
    return trashedMedia.rows
}