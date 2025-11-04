import express from 'express'
import { postMedia } from '../../media/controllers/media.controller.js'
import { authenticateToken as auth} from '../../middlewares/authMiddleware.js'

const uploadRoute = express.Router()

uploadRoute.post('/', auth, postMedia)

export default uploadRoute