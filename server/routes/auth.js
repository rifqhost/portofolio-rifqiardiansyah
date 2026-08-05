// FILE: server/routes/auth.js
import { Router } from 'express'
import { login, changePassword } from '../controllers/authController.js'
import { requireAuth } from '../middleware/auth.js'
import { authLimiter } from '../middleware/rateLimit.js'

const router = Router()

router.post('/login', authLimiter, login)
router.post('/change-password', requireAuth, changePassword)

export default router
