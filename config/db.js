const { Pool } = require('pg');
const aws = require('aws-sdk');

aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const pool = new Pool({
    user: `${process.env.user}`,
    host: 'localhost',
    database: 'collect',
    password: `${process.env.password}`,
    port: `${process.env.port}`
})

const s3 = new aws.S3({
    signatureVersion: 'v4'
});

module.exports = pool ;
