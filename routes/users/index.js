import express from 'express'
import authRoute from './auth.routes.js'
import profileRoute from './profile.routes.js'
import dotenv from 'dotenv'

dotenv.config() 
const router = express.Router()

router.use(authRoute)
router.use(profileRoute)

export default router