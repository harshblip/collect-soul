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

app.post('/upload', upload.array('file'), (req, res) => {
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: req.file.originalname,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
    };

    s3.upload(params, (err, data) => {
        if (err) {
            return res.status(500).send(err);
        }
        res.status(200).send({ message: 'File uploaded successfully!', url: data.Location });
    });
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
