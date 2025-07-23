const { pool, s3 } = require('../config/db');
const { findFolder } = require('./utils/nestedFolders');
const { uploadBufferToS3, createS3Folder } = require('./utils/s3uploader');
const { isValidFileSize } = require('./utils/validator');

const getFileInfo = async (user_id, id) => {
    if (!id) {
        message = "query is empty"
        return message;
    }
    const query = `select * from files where user_id = $1 and id = $2`;
    const result = await pool.query(query, [user_id, id]);
    const images = result.rows

    let path = []
    await findFolder(images[0].folder_id, path)
    console.log(path)
    
    const fileInfo = {
        image: images,
        filePath: path
    }

    return fileInfo
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

const renameMediaFn = async (username, oldFileName, newFileName, user_id) => {
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

const recoverMediaFn = async (files) => {
    const client = await pool.connect();
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
    return message = "media recovered"
}

const trashMediaFn = async (files) => {
    const client = await pool.connect();
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
    return message = "media trashed"
}

const addFilestoFolderFn = async (files, folderId) => {
    console.log(files)
    for (const file of files) {
        const query = `update files set folder_id = $1 where id = $2`
        await pool.query(query, [folderId, file.id])
    }
    return message = `${files.size} files added to folder`
}

module.exports = { getFileInfo, deleteMediaFn, uploadFileFn, renameMediaFn, recoverMediaFn, trashMediaFn, addFilestoFolderFn }