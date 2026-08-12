// FILE: server/controllers/contentController.js
import { readJson, writeJson } from '../services/storage.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { ok, created } from '../helpers/response.js'
import { newId } from '../helpers/id.js'

const COLLECTIONS = ['skills', 'education', 'experience', 'certificates', 'testimonials']

const normalizeItem = (key, item, index) => {
  const base = { id: `c-${key}-${index + 1}` }
  if (key === 'education' || key === 'experience' || key === 'testimonials') {
    return { ...base, ...item, id: item.id || newId(`c-${key}`) }
  }
  return { ...base, ...item }
}

export const getCollection = (key) =>
  asyncHandler(async (req, res) => {
    const data = readJson(`${key}.json`) || (key === 'skills' || key === 'certificates' ? {} : [])
    ok(res, data)
  })

export const updateCollection = (key) =>
  asyncHandler(async (req, res) => {
    const current = readJson(`${key}.json`) || {}
    const body = req.body

    let updated
    if (Array.isArray(body)) {
      updated = body.map((item, index) => normalizeItem(key, item, index))
    } else if (Array.isArray(current)) {
      const list = Array.isArray(body.items) ? body.items : body.list || []
      updated = list.map((item, index) => normalizeItem(key, item, index))
    } else {
      updated = { ...current, ...body, items: Array.isArray(body.items) ? body.items : current.items || [] }
    }

    writeJson(`${key}.json`, updated)
    created(res, updated)
  })
