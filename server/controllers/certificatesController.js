// FILE: server/controllers/certificatesController.js
import { readJson, writeJson } from '../services/storage.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { ok, created } from '../helpers/response.js'

export const getCertificates = asyncHandler(async (req, res) => {
  const certificates = readJson('certificates.json') || {}
  ok(res, certificates)
})

export const updateCertificates = asyncHandler(async (req, res) => {
  const current = readJson('certificates.json') || {}
  const incoming = req.body
  const updated = {
    ...current,
    ...incoming,
    items: Array.isArray(incoming.items) ? incoming.items : current.items || [],
  }
  writeJson('certificates.json', updated)
  created(res, updated)
})
