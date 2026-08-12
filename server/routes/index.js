// FILE: server/routes/index.js
import { Router } from 'express'
import publicRoutes from './public.js'
import authRoutes from './auth.js'
import adminRoutes from './admin.js'

const router = Router()

router.use('/', publicRoutes)
router.use('/auth', authRoutes)
router.use('/admin', adminRoutes)

router.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } })
})

export default router
