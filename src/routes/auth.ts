// filepath: /home/aswin/express-ts-api/src/routes/auth.ts
import { Router } from 'express'
import { login, callback } from '../controllers/authController'
import asyncHandler from '../utils/asyncHandler'

const router = Router()

router.get('/google', login)
router.get('/google/callback', asyncHandler(callback))

export default router