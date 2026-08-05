// FILE: server/middleware/multer.js
import multer from 'multer'
import path from 'path'
import crypto from 'crypto'
import { UPLOADS_DIR } from '../helpers/paths.js'

const ALLOWED_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.svg',
  '.pdf',
  '.ico',
  '.avif',
])

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const name = crypto.randomBytes(10).toString('hex')
    cb(null, `${Date.now()}-${name}${ext}`)
  },
})

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase()
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    const error = new Error(`File type not allowed: ${ext}`)
    error.status = 400
    return cb(error)
  }
  cb(null, true)
}

export const uploadSingle = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter,
}).single('file')

export const uploadMultiple = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024, files: 10 },
  fileFilter,
}).array('files', 10)
