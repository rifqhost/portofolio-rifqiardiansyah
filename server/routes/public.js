// FILE: server/routes/public.js
import { Router } from 'express'
import { getProjects, getProjectBySlug } from '../controllers/projectsController.js'
import { getPosts, getPostBySlug } from '../controllers/blogController.js'
import { getPublicProfile } from '../controllers/profileController.js'
import { getCollection } from '../controllers/contentController.js'
import { getCertificates } from '../controllers/certificatesController.js'
import { getPublicConfig, incrementVisitors } from '../controllers/configController.js'
import { getStats } from '../controllers/dashboardController.js'

const router = Router()

router.get('/projects', getProjects)
router.get('/projects/:slug', getProjectBySlug)
router.get('/blog', getPosts)
router.get('/blog/:slug', getPostBySlug)
router.get('/profile', getPublicProfile)
router.get('/education', getCollection('education'))
router.get('/certificates', getCertificates)
router.get('/skills', getCollection('skills'))
router.get('/experience', getCollection('experience'))
router.get('/testimonials', getCollection('testimonials'))
router.get('/config', getPublicConfig)
router.get('/dashboard/stats', getStats)
router.post('/visitors', incrementVisitors)

export default router
