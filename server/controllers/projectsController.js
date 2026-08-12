// FILE: server/controllers/projectsController.js
import { readJson, writeJson } from '../services/storage.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { ok, created, fail, pageMeta } from '../helpers/response.js'
import { newId } from '../helpers/id.js'
import { slugify } from '../utils/slugify.js'

const FILE = 'projects.json'
const DEFAULT_LIMIT = 6

const normalize = (data, existing) => {
  const base = existing || {}
  const title = String(data.title || base.title || 'Untitled Project')
  return {
    ...base,
    ...data,
    id: data.id || base.id || newId('p'),
    slug: data.slug || base.slug || slugify(title),
    title,
    description: data.description ?? base.description ?? '',
    features: Array.isArray(data.features) ? data.features : base.features || [],
    techStack: Array.isArray(data.techStack) ? data.techStack : base.techStack || [],
    category: data.category || base.category || 'Lainnya',
    image: data.image || base.image || '',
    gallery: Array.isArray(data.gallery) ? data.gallery : base.gallery || [],
    github: data.github || base.github || '',
    demo: data.demo || base.demo || '',
    status: data.status || base.status || 'draft',
    date: data.date || base.date || String(new Date().getFullYear()),
  }
}

export const getProjects = asyncHandler(async (req, res) => {
  let items = (await readJson(FILE)) || []

  const { search, category, status, sort } = req.query
  const page = Math.max(1, parseInt(req.query.page, 10) || 1)
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT))

  if (search) {
    const q = String(search).toLowerCase()
    items = items.filter(
      (p) => p.title?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.techStack?.some((t) => t.toLowerCase().includes(q)),
    )
  }
  if (category) {
    items = items.filter((p) => p.category?.toLowerCase() === String(category).toLowerCase())
  }
  if (status) {
    items = items.filter((p) => p.status === status)
  }
  if (sort === 'oldest') {
    items = [...items].sort((a, b) => String(a.date).localeCompare(String(b.date)))
  } else {
    items = [...items].sort((a, b) => String(b.date).localeCompare(String(a.date)))
  }

  const total = items.length
  const start = (page - 1) * limit
  const data = items.slice(start, start + limit)
  ok(res, data, pageMeta(total, page, limit))
})

export const getProjectBySlug = asyncHandler(async (req, res) => {
  const items = (await readJson(FILE)) || []
  const project = items.find((p) => p.slug === req.params.slug)
  if (!project) return fail(res, 404, 'Project not found')
  ok(res, project)
})

export const createProject = asyncHandler(async (req, res) => {
  const items = (await readJson(FILE)) || []
  const createdProject = normalize(req.body, null)
  items.push(createdProject)
  await writeJson(FILE, items)
  created(res, createdProject)
})

export const updateProject = asyncHandler(async (req, res) => {
  const items = (await readJson(FILE)) || []
  const index = items.findIndex((p) => p.id === req.params.id)
  if (index === -1) return fail(res, 404, 'Project not found')

  const updated = normalize(req.body, items[index])
  items[index] = updated
  await writeJson(FILE, items)
  ok(res, updated)
})

export const deleteProject = asyncHandler(async (req, res) => {
  const items = (await readJson(FILE)) || []
  const filtered = items.filter((p) => p.id !== req.params.id)
  if (filtered.length === items.length) return fail(res, 404, 'Project not found')
  await writeJson(FILE, filtered)
  ok(res, { deleted: true, id: req.params.id })
})
