// FILE: server/routes/index.js
import { Router } from 'express'
import publicRoutes from './public.js'
import authRoutes from './auth.js'
import adminRoutes from './admin.js'

const router = Router()

router.use('/', publicRoutes)
router.use('/auth', authRoutes)
router.use('/admin', adminRoutes)

export default router
