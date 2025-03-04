// filepath: /home/aswin/express-ts-api/src/routes/auth.ts
import { Router } from 'express'
import { login, callback } from '../controllers/authController'
import { authMiddleware } from '../middleware/authMiddleware'
import asyncHandler from '../utils/asyncHandler'

const router = Router()

router.get('/google', login)
router.get('/google/callback', asyncHandler(callback))
router.get('/profile', authMiddleware, (req, res) => {
  res.json({ user: req.user })
})

export default router