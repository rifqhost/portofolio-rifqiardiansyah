// FILE: server/controllers/profileController.js
import { readJson, writeJson } from '../services/storage.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { ok, created } from '../helpers/response.js'

const FILE = 'profile.json'

export const getProfile = asyncHandler(async (req, res) => {
  const profile = (await readJson(FILE)) || {}
  ok(res, profile)
})

export const updateProfile = asyncHandler(async (req, res) => {
  const current = (await readJson(FILE)) || {}
  const updated = { ...current, ...req.body, personalInfo: { ...current.personalInfo, ...req.body.personalInfo }, socials: { ...current.socials, ...req.body.socials } }
  await writeJson(FILE, updated)
  created(res, updated)
})
