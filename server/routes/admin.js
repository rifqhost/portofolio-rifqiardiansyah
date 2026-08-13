// FILE: server/routes/admin.js
import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { getStats } from '../controllers/dashboardController.js'
import { getFullConfig, updateConfig } from '../controllers/configController.js'
import { updateProfile } from '../controllers/profileController.js'
import { updateCollection } from '../controllers/contentController.js'
import { createProject, updateProject, deleteProject } from '../controllers/projectsController.js'
import { createPost, updatePost, deletePost } from '../controllers/blogController.js'
import { uploadFile, uploadFiles, deleteUpload } from '../controllers/uploadController.js'
import { uploadSingle, uploadMultiple } from '../middleware/multer.js'

const router = Router()

router.use(requireAuth)

router.get('/dashboard/stats', getStats)

router.get('/config', getFullConfig)
router.put('/config', updateConfig)

router.put('/profile', updateProfile)

router.put('/skills', updateCollection('skills'))
router.put('/education', updateCollection('education'))
router.put('/experience', updateCollection('experience'))
router.put('/certificates', updateCollection('certificates'))

router.post('/projects', createProject)
router.put('/projects/:id', updateProject)
router.delete('/projects/:id', deleteProject)

router.post('/blog', createPost)
router.put('/blog/:id', updatePost)
router.delete('/blog/:id', deletePost)

router.post('/upload', uploadSingle, uploadFile)
router.post('/upload/multiple', uploadMultiple, uploadFiles)
router.delete('/upload/:name', deleteUpload)

router.get('/resolve-image-url', (req, res) => {
  const pageUrl = String(req.query.url || '').trim()
  if (!pageUrl) return res.status(400).json({ success: false, error: { message: 'url is required' } })
  resolveImageUrl(pageUrl)
    .then((direct) => res.json({ success: true, data: { url: direct } }))
    .catch((error) => res.status(500).json({ success: false, error: { message: error.message || 'Failed to resolve image url' } }))
})

export default router
