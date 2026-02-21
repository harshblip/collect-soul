import aws from 'aws-sdk'
import axios from 'axios';

const s3 = new aws.S3();

export async function uploadBufferToS3(buffer, key, thumbnailKey, contentType) {
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

export function createS3Folder(key) {
    return s3.putObject({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
    }).promise();
}
