const AWS = require('aws-sdk');
const axios = require('axios');

const s3 = new AWS.S3();

async function uploadBufferToS3(buffer, key, contentType) {
    const signedUrl = s3.getSignedUrl('putObject', {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Expires: 60,
        ContentType: contentType,
    });

    await axios.put(signedUrl, buffer, {
        headers: { 'Content-Type': contentType },
    });

    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

function createS3Folder(key) {
    return s3.putObject({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
    }).promise();
}

module.exports = { uploadBufferToS3, createS3Folder };
