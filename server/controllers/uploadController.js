// FILE: server/controllers/uploadController.js
import path from 'path'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { ok, fail } from '../helpers/response.js'
import { UPLOADS_DIR } from '../helpers/paths.js'
import { removeFileIfExists } from '../services/storage.js'

const toPublicUrl = (req, file) => {
  const host = req.get('host')
  const protocol = req.protocol
  return `${protocol}://${host}/uploads/${file.filename}`
}

export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) return fail(res, 400, 'No file uploaded')
  ok(res, { url: toPublicUrl(req, req.file), name: req.file.originalname, size: req.file.size, type: path.extname(req.file.originalname) })
})

export const uploadFiles = asyncHandler(async (req, res) => {
  const files = req.files || []
  if (files.length === 0) return fail(res, 400, 'No files uploaded')
  ok(
    res,
    files.map((f) => ({ url: toPublicUrl(req, f), name: f.originalname, size: f.size, type: path.extname(f.originalname) })),
  )
})

export const deleteUpload = asyncHandler(async (req, res) => {
  const { name } = req.params
  if (!name || name.includes('..') || path.basename(name) !== name) {
    return fail(res, 400, 'Invalid file name')
  }
  const removed = await removeFileIfExists(path.join(UPLOADS_DIR, name))
  if (!removed) return fail(res, 404, 'File not found')
  ok(res, { deleted: true, name })
})
