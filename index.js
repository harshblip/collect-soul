require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const Pool = require('pg').Pool;

const aws = require('aws-sdk');
const fs = require('fs');
const multer = require('multer');
const cors = require('cors');
const sharp = require('sharp')

console.log(process.env.USER);

app.use(cors());

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})

aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const s3 = new aws.S3();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.array('file'), async (req, res) => {
    const username = req.body.username;
    const files = req.files;
    const response = [];

    for (const file of files) {
        try {
            const fileName = file.originalname;
            const userFolderKey = `${username}`;
            const imageFolderKey = `${username}/${fileName}/`;
            const fileKey = `${imageFolderKey}${fileName}`;

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

            await s3.putObject({
                Bucket: process.env.S3_BUCKET_NAME,
                Key: imageFolderKey,
            }).promise();

            const originalImage = file.buffer;
            const thumbnailImage = await sharp(originalImage).resize(150).toBuffer();
            const displayImage = await sharp(originalImage).resize(1024).toBuffer();

            const uploadOriginalImage = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: fileKey,
                Body: originalImage,
                ContentType: file.mimetype
            }

            const originalUpload = s3.upload(uploadOriginalImage).promise();

            const uploadthumbnailImage = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: fileKey,
                Body: thumbnailImage,
                ContentType: file.mimetype
            }

            const thumbnailUpload = s3.upload(uploadthumbnailImage).promise();

            const uploaddisplayImage = {
                Bucket: process.env.S3_BUCKET_NAME,
                Key: fileKey,
                Body: displayImage,
                ContentType: file.mimetype
            }

            const displayUpload = s3.upload(uploaddisplayImage).promise();

            const [originalResult, thumbnailResult, displayResult] = Promise.all([
                originalUpload,
                thumbnailUpload,
                displayUpload
            ])

            response.push({
                fileName: fileName,
                url : {
                    originalUrl: originalResult.Location,
                    thumbnailUrl: thumbnailResult.Location,
                    displayUrl: displayResult.Location
                }        
            })

            res.status(200).send({
                message: "Files uploaded successfully !",
                files: response
            })
            
        } catch (err) {
            res.status(500).json({ message: "server error brooooo" })
        }
    }
});

const pool = new Pool({
    user: `${process.env.user}`,
    host: 'localhost',
    database: 'collect',
    password: `${process.env.password}`,
    port: `${process.env.port}`,
})

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}))
