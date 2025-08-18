import pg from 'pg';
import aws from 'aws-sdk'

const { Pool } = pg

aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

export const pool = new Pool({
    user: `${process.env.USER}`,
    host: 'localhost',
    database: 'collect',
    password: `${process.env.PASSWORD}`,
    port: `${process.env.PORT}`
})

export const s3 = new aws.S3({
    signatureVersion: 'v4'
});
