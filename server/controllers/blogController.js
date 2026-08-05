// FILE: server/controllers/blogController.js
import { readJson, writeJson } from '../services/storage.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { ok, created, fail, pageMeta } from '../helpers/response.js'
import { newId } from '../helpers/id.js'
import { slugify } from '../utils/slugify.js'

const FILE = 'blog.json'
const DEFAULT_LIMIT = 6

const normalize = (data, existing) => {
  const base = existing || {}
  const title = String(data.title || base.title || 'Untitled Post')
  return {
    ...base,
    ...data,
    id: data.id || base.id || newId('b'),
    slug: data.slug || base.slug || slugify(title),
    title,
    excerpt: data.excerpt ?? base.excerpt ?? '',
    content: data.content ?? base.content ?? '',
    cover: data.cover || base.cover || '',
    category: data.category || base.category || 'Lainnya',
    tags: Array.isArray(data.tags) ? data.tags : base.tags || [],
    author: data.author || base.author || 'Rifqi Ardiansyah',
    date: data.date || base.date || new Date().toISOString().slice(0, 10),
    readTime: Number(data.readTime) || base.readTime || Math.max(1, Math.round(String(data.content || '').split(/\s+/).length / 200)),
    featured: Boolean(data.featured ?? base.featured),
  }
}

export const getPosts = asyncHandler(async (req, res) => {
  let items = (await readJson(FILE)) || []

  const { search, category, tag } = req.query
  const page = Math.max(1, parseInt(req.query.page, 10) || 1)
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT))

  if (search) {
    const q = String(search).toLowerCase()
    items = items.filter(
      (p) => p.title?.toLowerCase().includes(q) || p.excerpt?.toLowerCase().includes(q) || p.content?.toLowerCase().includes(q) || p.tags?.some((t) => t.toLowerCase().includes(q)),
    )
  }
  if (category) {
    items = items.filter((p) => p.category?.toLowerCase() === String(category).toLowerCase())
  }
  if (tag) {
    items = items.filter((p) => p.tags?.some((t) => t.toLowerCase() === String(tag).toLowerCase()))
  }

  items = [...items].sort((a, b) => String(b.date).localeCompare(String(a.date)))

  const total = items.length
  const start = (page - 1) * limit
  const data = items.slice(start, start + limit)
  ok(res, data, pageMeta(total, page, limit))
})

export const getPostBySlug = asyncHandler(async (req, res) => {
  const items = (await readJson(FILE)) || []
  const post = items.find((p) => p.slug === req.params.slug)
  if (!post) return fail(res, 404, 'Post not found')
  ok(res, post)
})

export const createPost = asyncHandler(async (req, res) => {
  const items = (await readJson(FILE)) || []
  const post = normalize(req.body, null)
  items.push(post)
  await writeJson(FILE, items)
  created(res, post)
})

export const updatePost = asyncHandler(async (req, res) => {
  const items = (await readJson(FILE)) || []
  const index = items.findIndex((p) => p.id === req.params.id)
  if (index === -1) return fail(res, 404, 'Post not found')
  const updated = normalize(req.body, items[index])
  items[index] = updated
  await writeJson(FILE, items)
  ok(res, updated)
})

export const deletePost = asyncHandler(async (req, res) => {
  const items = (await readJson(FILE)) || []
  const filtered = items.filter((p) => p.id !== req.params.id)
  if (filtered.length === items.length) return fail(res, 404, 'Post not found')
  await writeJson(FILE, filtered)
  ok(res, { deleted: true, id: req.params.id })
})
