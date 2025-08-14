import express from 'express'
import bodyParser from 'body-parser';
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser';
import cors from 'cors'
import { limiter } from './middlewares/rateLimiter.js';
import { trashCleanup } from './jobs/trashCleanup.js';
import router from './routes/users/index.js';
import userRoute from './routes/users.js';

dotenv.config()
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

app.use('/upload', router);
app.use('/user', router);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})
