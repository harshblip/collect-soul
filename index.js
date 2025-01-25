require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const uploadRoutes = require('./routes/uploadRoutes')

const app = express();
const port = 3000;

app.use(cors());

console.log(process.env.USER);

app.use('/upload', uploadRoutes);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}))

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})
