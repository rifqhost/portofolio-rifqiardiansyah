// FILE: server/routes/public.js
import { Router } from 'express'
import { getProfile } from '../controllers/profileController.js'
import { getProjects, getProjectBySlug } from '../controllers/projectsController.js'
import { getPosts, getPostBySlug } from '../controllers/blogController.js'
import { getCollection } from '../controllers/contentController.js'
import { getPublicConfig, incrementVisitors } from '../controllers/configController.js'
import { apiLimiter } from '../middleware/rateLimit.js'

const router = Router()

router.get('/health', (req, res) =>
  res.status(200).json({ success: true, data: { status: 'ok', time: new Date().toISOString() } }),
)

router.get('/config', getPublicConfig)
router.post('/visitors', incrementVisitors)

router.get('/profile', getProfile)

router.get('/projects', getProjects)
router.get('/projects/:slug', getProjectBySlug)

router.get('/skills', getCollection('skills'))
router.get('/education', getCollection('education'))
router.get('/experience', getCollection('experience'))
router.get('/certificates', getCollection('certificates'))
router.get('/testimonials', getCollection('testimonials'))

router.get('/blog', getPosts)
router.get('/blog/:slug', getPostBySlug)

export default router
