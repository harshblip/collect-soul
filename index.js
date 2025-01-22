require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const Pool = require('pg').Pool;

const uploadFile = require('./routes/uploadRoutes')

const cors = require('cors');
app.use(cors());

console.log(process.env.USER);

app.use('/upload', uploadFile);

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

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})
