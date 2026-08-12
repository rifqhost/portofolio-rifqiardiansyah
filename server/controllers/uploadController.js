// FILE: server/controllers/uploadController.js
import path from 'path'
import fs from 'fs'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { ok, fail } from '../helpers/response.js'
import { UPLOADS_DIR } from '../helpers/paths.js'
import { removeFileIfExists } from '../services/storage.js'
import { uploadToCloudinary, deleteFromCloudinary, isCloudinaryUrl } from '../utils/cloudinary.js'
import { logger } from '../utils/logger.js'

const toPublicUrl = (req, file) => {
  const host = req.get('host')
  const protocol = req.protocol
  return `${protocol}://${host}/uploads/${file.filename}`
}

async function handleCloudinaryUpload(file) {
  const tempPath = file.path
  try {
    const result = await uploadToCloudinary(tempPath, 'portfolio')
    return { url: result.url, publicId: result.publicId, name: file.originalname, size: file.size, type: file.mimetype }
  } finally {
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath)
    }
  }
}

function handleLocalUpload(req, file) {
  return { url: toPublicUrl(req, file), name: file.originalname, size: file.size, type: path.extname(file.originalname) }
}

export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) return fail(res, 400, 'No file uploaded')
  
  try {
    const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME
    let result
    
    if (useCloudinary) {
      result = await handleCloudinaryUpload(req.file)
    } else {
      result = handleLocalUpload(req, req.file)
    }
    
    logger.ok(`File uploaded: ${result.name}`)
    ok(res, result)
  } catch (error) {
    logger.error(`Upload failed: ${error.message}`)
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
    fail(res, 500, 'Upload failed')
  }
})

export const uploadFiles = asyncHandler(async (req, res) => {
  const files = req.files || []
  if (files.length === 0) return fail(res, 400, 'No files uploaded')
  
  try {
    const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME
    const results = []
    
    for (const file of files) {
      if (useCloudinary) {
        const result = await handleCloudinaryUpload(file)
        results.push(result)
      } else {
        results.push(handleLocalUpload(req, file))
      }
    }
    
    ok(res, results)
  } catch (error) {
    logger.error(`Batch upload failed: ${error.message}`)
    for (const file of files) {
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path)
      }
    }
    fail(res, 500, 'Batch upload failed')
  }
})

export const deleteUpload = asyncHandler(async (req, res) => {
  const { name } = req.params
  if (!name || name.includes('..') || path.basename(name) !== name) {
    return fail(res, 400, 'Invalid file name')
  }
  
  const filePath = path.join(UPLOADS_DIR, name)
  const removed = await removeFileIfExists(filePath)
  
  if (!removed) return fail(res, 404, 'File not found')
  
  ok(res, { deleted: true, name })
})