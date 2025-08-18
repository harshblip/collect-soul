import express from 'express'
import dotenv from 'dotenv'
import deleteRoute from './delete.routes.js'
import fetchRoute from './fetch.routes.js'
import lockRoute from './lock.routes.js'
import updateRoute from './update.routes.js'
import uploadRoute from './upload.routes.js'

dotenv.config()
const fileRouter = express.Router()

fileRouter.use(deleteRoute)
fileRouter.use(fetchRoute)
fileRouter.use(lockRoute)
fileRouter.use(updateRoute)
fileRouter.use(uploadRoute)

export default fileRouter