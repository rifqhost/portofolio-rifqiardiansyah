// FILE: server/routes/index.js
import { Router } from 'express'
import publicRoutes from './public.js'
import authRoutes from './auth.js'
import adminRoutes from './admin.js'
import { requireAuth } from '../middleware/auth.js'
import { notFound } from '../middleware/errorHandler.js'

const router = Router()

router.use(publicRoutes)
router.use('/auth', authRoutes)
router.use('/admin', requireAuth, adminRoutes)

router.use('/admin', notFound)

export default router
