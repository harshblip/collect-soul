import express from 'express'
import { postMedia } from '../../media/controllers/media.controller.js'

const uploadRoute = express.Router()

uploadRoute.post('/', postMedia)

export default uploadRoute