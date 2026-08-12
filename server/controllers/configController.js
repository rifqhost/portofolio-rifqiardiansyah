// FILE: server/controllers/configController.js
import { readJson, writeJson } from '../services/storage.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { ok } from '../helpers/response.js'

const FILE = 'config.json'

const PUBLIC_KEYS = ['siteName', 'defaultLang', 'features', 'emailjs']

export const getPublicConfig = asyncHandler(async (req, res) => {
  const config = readJson(FILE) || {}
  const publicConfig = {}
  for (const key of PUBLIC_KEYS) {
    if (config[key] !== undefined) publicConfig[key] = config[key]
  }
  ok(res, publicConfig)
})

export const incrementVisitors = asyncHandler(async (req, res) => {
  const config = readJson(FILE) || {}
  config.visitors = (config.visitors || 0) + 1
  writeJson(FILE, config)
  ok(res, { visitors: config.visitors })
})

export const getFullConfig = asyncHandler(async (req, res) => {
  const config = readJson(FILE) || {}
  const safe = { ...config }
  delete safe.adminPasswordHash
  ok(res, safe)
})

export const updateConfig = asyncHandler(async (req, res) => {
  const current = readJson(FILE) || {}
  const { adminPasswordHash, ...rest } = req.body
  const updated = { ...current, ...rest }
  if (adminPasswordHash) updated.adminPasswordHash = adminPasswordHash
  writeJson(FILE, updated)
  const safe = { ...updated }
  delete safe.adminPasswordHash
  ok(res, safe)
})
