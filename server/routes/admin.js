// FILE: server/routes/admin.js
import { Router } from 'express'
import { getStats } from '../controllers/dashboardController.js'
import {
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectsController.js'
import { createPost, updatePost, deletePost } from '../controllers/blogController.js'
import { updateProfile } from '../controllers/profileController.js'
import { updateCollection } from '../controllers/contentController.js'
import { getFullConfig, updateConfig } from '../controllers/configController.js'
import { uploadFile, uploadFiles, deleteUpload } from '../controllers/uploadController.js'
import { uploadSingle, uploadMultiple } from '../middleware/multer.js'

const router = Router()

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

export default router
