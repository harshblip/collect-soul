import express from 'express'
import bodyParser from 'body-parser';
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser';
import cors from 'cors'
import { limiter } from './middlewares/rateLimiter.js';
import { trashCleanup } from './jobs/trashCleanup.js';
import userRoutes from './routes/users/index.js';
import fileRoutes from './routes/files/index.js';

dotenv.config()
const app = express();
const port = 4000;

app.use(cors());
trashCleanup()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(cookieParser());

app.use('/upload', fileRoutes);
app.use('/user', userRoutes);

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})
