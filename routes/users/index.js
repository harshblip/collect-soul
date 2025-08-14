import express from 'express'
import authRoute from './auth.routes'
import profileRoute from './profile.routes'

const router = express.Router()

router.use(authRoute)
router.use(profileRoute)

export default router