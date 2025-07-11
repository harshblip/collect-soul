require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')
const cors = require('cors');
const uploadRoutes = require('./routes/uploadRoutes')
const userRoutes = require('./routes/users')
const limiter = require('./middlewares/rateLimiter')
const trashCleanup = require('./jobs/trashCleanup')

const app = express();
const port = 4000;

app.use(cors());
trashCleanup()

console.log(process.env.USER);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(cookieParser());

app.use('/upload', uploadRoutes);
app.use('/user', userRoutes);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})
