const aws = require('aws-sdk');
const sharp = require('sharp')
const upload = require('../fileChecker');

aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const s3 = new aws.S3();

const postMedia = (req, res) => {
    try {
        upload.array('file')(req, res, async (err) => {
            const username = req.body.username;
            const files = req.files;
            const response = [];

            console.log(files);
            if (err) {
                console.log("multer validation error: ", err.message);
                res.status(400).json({ message: err.message });
                return;
            }

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
                    const originalVideo = file.buffer;
                    const uploadVideo = {
                        Bucket: process.env.S3_BUCKET_NAME,
                        Key: fileKey,
                        Body: originalVideo,
                        ContentType: file.mimetype
                    }
                    
                    const video = await s3.upload(uploadVideo).promise();
                    res.status(200).json({
                        message: "video successfully uploaded",
                        url: video.Location
                    })
                } else {
                    const originalImage = file.buffer;

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
                        Body: originalImage,
                        ContentType: file.mimetype
                    }

                    const originalUpload = s3.upload(uploadOriginalImage).promise();

                    const tfileKey = `${mediaFolderKey}${fileName}_thumbnail.webp`;
                    const uploadthumbnailImage = {
                        Bucket: process.env.S3_BUCKET_NAME,
                        Key: tfileKey,
                        Body: thumbnailImage,
                        ContentType: 'image/webp'
                    }

                    const thumbnailUpload = await s3.upload(uploadthumbnailImage).promise();

                    const dfileKey = `${mediaFolderKey}${fileName}_display.webp`;
                    const uploaddisplayImage = {
                        Bucket: process.env.S3_BUCKET_NAME,
                        Key: dfileKey,
                        Body: displayImage,
                        ContentType: 'image/webp'
                    }

                    const displayUpload = await s3.upload(uploaddisplayImage).promise();
                    response.push({
                        fileName: fileName,
                        url: {
                            originalUrl: originalUpload.Location,
                            thumbnailUrl: thumbnailUpload.Location,
                            displayUrl: displayUpload.Location
                        }
                    })
                }
            }
            res.status(200).send({
                message: "Files uploaded successfully !",
                files: response
            })
        })
    } catch (err) {
        res.status(500).json({ message: "server error brooooo" })
    }
}

module.exports = { postMedia };