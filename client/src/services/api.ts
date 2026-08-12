// FILE: client/src/services/api.ts
import type {
  ApiResponse,
  BlogPost,
  Certificates,
  DashboardStats,
  Education,
  Experience,
  PageMeta,
  Profile,
  Project,
  SiteConfig,
  Skills,
  Testimonial,
  UploadResult,
} from '@/types'
import { getToken } from './auth'
import {
  ApiError,
  getVisitorsCount,
  incrementVisitors,
  pageMeta,
  readCollection,
  writeCollection,
  changePassword,
  verifyLogin,
  fileToDataUrl,
  MAX_UPLOAD_BYTES,
  MAX_RAW_UPLOAD_BYTES,
  type CollectionKey,
} from './staticStore'
import { slugify } from '@/utils/slug'
import { resolveBodyImages } from '@/lib/imageUrl'

export { ApiError }

const API_BASE = import.meta.env.VITE_API_URL || '/api'

// Static mode is used when no external backend exists (dev and static hosting alike).
// Enabled explicitly via VITE_STATIC_MODE=true or automatically whenever VITE_API_URL
// is not configured (the Express backend was removed; /api would only serve the SPA fallback).
export const STATIC_MODE =
  import.meta.env.VITE_STATIC_MODE === 'true' || !import.meta.env.VITE_API_URL

interface RequestOptions {
  method?: string
  body?: unknown
  headers?: Record<string, string>
  isFormData?: boolean
}

const ok = <T>(data: T, meta?: PageMeta): ApiResponse<T> => ({
  success: true,
  data,
  ...(meta ? { meta } : {}),
})

function requireAdmin() {
  if (!getToken()) throw new ApiError('Authentication required', 401)
}

// Simpan data ke localStorage; jika penuh, lempar error agar admin tahu
// perubahannya TIDAK tersimpan (sebelumnya gagal diam-diam).
function persistOrThrow(key: CollectionKey, data: unknown): void {
  if (!writeCollection(key, data)) {
    throw new ApiError(
      'Penyimpanan gagal: penyimpanan browser (localStorage) penuh. Hapus data/foto lama atau gunakan URL gambar eksternal.',
      500,
    )
  }
}

const SIMPLE_GET: Record<string, CollectionKey> = {
  '/skills': 'skills',
  '/education': 'education',
  '/experience': 'experience',
  '/certificates': 'certificates',
  '/testimonials': 'testimonials',
}

function normalizeProject(data: Partial<Project>, existing: Project | null): Project {
  const base: Partial<Project> = existing || {}
  const title = String(data.title || base.title || 'Untitled Project')
  return {
    ...base,
    ...data,
    id: data.id || base.id || `p-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
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

// Resolve ulang link halaman ImgBB pada data yang akan dikirim ke halaman publik.
// Menutup celah: jika data tersimpan dengan link mentah (mis. karena proxy timeout
// saat submit, atau data lama di localStorage/file JSON), gambar tetap tampil karena
// dikonversi ke direct link sebelum dirender. Cache per-URL di imageUrl.ts membuat
// operasi ini murah setelah resolve pertama.
async function resolveRenderImages(items: unknown[]): Promise<void> {
  await Promise.all(
    items.map(async (item) => {
      if (item && typeof item === 'object') {
        await resolveBodyImages(item as Record<string, unknown>)
      }
    }),
  )
}

function normalizePost(data: Partial<BlogPost>, existing: BlogPost | null): BlogPost {
  const base: Partial<BlogPost> = existing || {}
  const title = String(data.title || base.title || 'Untitled Post')
  return {
    ...base,
    ...data,
    id: data.id || base.id || `b-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    slug: data.slug || base.slug || slugify(title),
    title,
    excerpt: data.excerpt ?? base.excerpt ?? '',
    content: data.content ?? base.content ?? '',
    cover: data.cover || base.cover || '',
    category: data.category || base.category || 'Lainnya',
    tags: Array.isArray(data.tags) ? data.tags : base.tags || [],
    author: data.author || base.author || 'Rifqi Ardiansyah',
    date: data.date || base.date || new Date().toISOString().slice(0, 10),
    readTime: Number(data.readTime) || base.readTime || 1,
    featured: Boolean(data.featured ?? base.featured),
  }
}

async function getProjectsData(query: URLSearchParams) {
  let items = [...((await readCollection<Project[]>('projects')) || [])]
  const search = query.get('search')
  const category = query.get('category')
  const status = query.get('status')
  const sort = query.get('sort')

  if (search) {
    const q = search.toLowerCase()
    items = items.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.techStack?.some((t) => t.toLowerCase().includes(q)),
    )
  }
  if (category) items = items.filter((p) => p.category?.toLowerCase() === category.toLowerCase())
  if (status) items = items.filter((p) => p.status === status)

  items.sort((a, b) =>
    sort === 'oldest'
      ? String(a.date).localeCompare(String(b.date))
      : String(b.date).localeCompare(String(a.date)),
  )

  const page = Math.max(1, Number(query.get('page')) || 1)
  const limit = Math.min(50, Math.max(1, Number(query.get('limit')) || 6))
  const start = (page - 1) * limit
  return { data: items.slice(start, start + limit), meta: pageMeta(items.length, page, limit) }
}

async function getPostsData(query: URLSearchParams) {
  let items = [...((await readCollection<BlogPost[]>('blog')) || [])]
  const search = query.get('search')
  const category = query.get('category')
  const tag = query.get('tag')

  if (search) {
    const q = search.toLowerCase()
    items = items.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q) ||
        p.content?.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q)),
    )
  }
  if (category) items = items.filter((p) => p.category?.toLowerCase() === category.toLowerCase())
  if (tag) items = items.filter((p) => p.tags?.some((t) => t.toLowerCase() === tag.toLowerCase()))

  items.sort((a, b) => String(b.date).localeCompare(String(a.date)))

  const page = Math.max(1, Number(query.get('page')) || 1)
  const limit = Math.min(50, Math.max(1, Number(query.get('limit')) || 6))
  const start = (page - 1) * limit
  return { data: items.slice(start, start + limit), meta: pageMeta(items.length, page, limit) }
}

async function handleStatic(path: string, options: RequestOptions): Promise<ApiResponse<unknown>> {
  const { method = 'GET' } = options
  const [pathname, queryString = ''] = path.split('?')
  const query = new URLSearchParams(queryString)
  const body = options.body as Record<string, unknown> | undefined

  // --- auth ---
  if (pathname === '/auth/login' && method === 'POST') {
    const username = String(body?.username || '')
    const password = String(body?.password || '')
    if (!username || !password) throw new ApiError('Username and password are required', 400)
    const valid = await verifyLogin(username, password)
    if (!valid) throw new ApiError('Invalid username or password', 401)
    return ok({ token: btoa(`${username}:${Date.now()}`), user: { username } })
  }

  if (pathname === '/auth/change-password' && method === 'POST') {
    requireAdmin()
    const currentPassword = String(body?.currentPassword || '')
    const newPassword = String(body?.newPassword || '')
    if (!currentPassword || !newPassword)
      throw new ApiError('Current and new password are required', 400)
    if (newPassword.length < 6)
      throw new ApiError('New password must be at least 6 characters', 400)
    await changePassword(currentPassword, newPassword)
    return ok({ message: 'Password updated successfully' })
  }

  // --- visitors ---
  if (pathname === '/visitors' && method === 'POST') {
    return ok({ visitors: incrementVisitors() })
  }

  // --- everything under /admin requires a token ---
  if (pathname.startsWith('/admin/')) requireAdmin()

  // --- sanitize image URLs on admin saves ---
  // Konversi otomatis link halaman ImgBB (ibb.co/…) menjadi direct image URL
  // pada semua body form admin sebelum data disimpan.
  if (
    (method === 'PUT' || method === 'POST') &&
    body &&
    typeof body === 'object' &&
    !(body instanceof FormData)
  ) {
    await resolveBodyImages(body)
  }

  // --- upload (saved as base64 data URL in the edited data) ---
  if (pathname === '/admin/upload' && method === 'POST') {
    const file = (options.body as FormData | null)?.get('file') as File | null
    if (!file) throw new ApiError('No file uploaded', 400)
    if (file.size > MAX_RAW_UPLOAD_BYTES) {
      throw new ApiError(
        'Ukuran file terlalu besar (±10MB). Gunakan foto lebih kecil atau URL eksternal.',
        400,
      )
    }
    const url = await fileToDataUrl(file)
    if (url.length > MAX_UPLOAD_BYTES) {
      throw new ApiError(
        'Gambar terlalu besar setelah kompresi (±1.5MB). Gunakan foto lebih kecil atau URL eksternal.',
        400,
      )
    }
    const result: UploadResult = { url, name: file.name, size: file.size, type: file.type }
    return ok(result)
  }

  // --- dashboard stats ---
  if (pathname === '/admin/dashboard/stats' && method === 'GET') {
    const [projects, blog, skills, education, experience, certificates, testimonials, config] =
      await Promise.all([
        readCollection<Project[]>('projects'),
        readCollection<BlogPost[]>('blog'),
        readCollection<Skills>('skills'),
        readCollection<Education[]>('education'),
        readCollection<Experience[]>('experience'),
        readCollection<Certificates>('certificates'),
        readCollection<Testimonial[]>('testimonials'),
        readCollection<SiteConfig>('config'),
      ])

    const count = (value: unknown) => (Array.isArray(value) ? value.length : 0)
    const skillCount = ['frontend', 'backend', 'tools'].reduce(
      (acc, group) => acc + count((skills as unknown as Record<string, unknown> | undefined)?.[group]),
      0,
    )

    const stats: DashboardStats = {
      counts: {
        projects: count(projects),
        blog: count(blog),
        skills: skillCount,
        education: count(education),
        experience: count(experience),
        certificates: count(certificates?.items),
        testimonials: count(testimonials),
        visitors: getVisitorsCount(),
      },
      analytics: {
        enabled: config?.features?.analytics !== false,
        placeholder: true,
        message: 'Analytics placeholder - connect a real analytics service later',
      },
      latestProjects: (projects || []).slice(0, 5),
      latestPosts: (blog || []).slice(0, 5),
    }
    return ok(stats)
  }

  // --- admin config ---
  if (pathname === '/admin/config' && method === 'GET') {
    return ok(await readCollection<SiteConfig>('config'))
  }
  if (pathname === '/admin/config' && method === 'PUT') {
    const config = await readCollection<SiteConfig>('config')
    const updated: SiteConfig = { ...config, ...(body as Partial<SiteConfig>) }
    persistOrThrow('config', updated)
    return ok(updated)
  }

  // --- certificates ---
  if (pathname === '/admin/certificates' && method === 'GET') {
    return ok(await readCollection<Certificates>('certificates'))
  }
  if (pathname === '/admin/certificates' && method === 'PUT') {
    const current = (await readCollection<Certificates>('certificates')) || ({} as Certificates)
    const incoming = (body as Partial<Certificates>) || {}
    const updated: Certificates = {
      ...current,
      ...incoming,
      items: Array.isArray(incoming.items) ? incoming.items : current.items || [],
    }
    persistOrThrow('certificates', updated)
    return ok(updated)
  }

  // --- profile ---
  if (pathname === '/profile' && method === 'GET') {
    return ok(await readCollection<Profile>('profile'))
  }
  if (pathname === '/admin/profile' && method === 'PUT') {
    const current = (await readCollection<Profile>('profile')) || ({} as Profile)
    const incoming = (body as Partial<Profile>) || {}
    const updated: Profile = {
      ...current,
      ...incoming,
      personalInfo: { ...current.personalInfo, ...incoming.personalInfo },
      socials: { ...current.socials, ...incoming.socials },
      highlights: incoming.highlights ?? current.highlights,
      seo: { ...current.seo, ...incoming.seo },
    }
    persistOrThrow('profile', updated)
    return ok(updated)
  }

  // --- projects ---
  if (pathname === '/projects' && method === 'GET') {
    const { data, meta } = await getProjectsData(query)
    await resolveRenderImages(data as unknown[])
    return ok(data, meta)
  }
  if (pathname.startsWith('/projects/') && method === 'GET') {
    const slug = pathname.slice('/projects/'.length)
    const projects = (await readCollection<Project[]>('projects')) || []
    const project = projects.find((p) => p.slug === slug)
    if (!project) throw new ApiError('Project not found', 404)
    await resolveBodyImages(project as unknown as Record<string, unknown>)
    return ok(project)
  }
  if (pathname === '/admin/projects' && method === 'POST') {
    const projects = [...((await readCollection<Project[]>('projects')) || [])]
    const item = normalizeProject((body as Partial<Project>) || {}, null)
    projects.push(item)
    persistOrThrow('projects', projects)
    return ok(item)
  }
  if (/^\/admin\/projects\/[^/]+$/.test(pathname) && method === 'PUT') {
    const id = pathname.split('/').pop()!
    const projects = [...((await readCollection<Project[]>('projects')) || [])]
    const index = projects.findIndex((p) => p.id === id)
    if (index === -1) throw new ApiError('Project not found', 404)
    projects[index] = normalizeProject((body as Partial<Project>) || {}, projects[index])
    persistOrThrow('projects', projects)
    return ok(projects[index])
  }
  if (/^\/admin\/projects\/[^/]+$/.test(pathname) && method === 'DELETE') {
    const id = pathname.split('/').pop()!
    const projects = (await readCollection<Project[]>('projects')) || []
    const filtered = projects.filter((p) => p.id !== id)
    if (filtered.length === projects.length) throw new ApiError('Project not found', 404)
    persistOrThrow('projects', filtered)
    return ok({ deleted: true, id })
  }

  // --- blog ---
  if (pathname === '/blog' && method === 'GET') {
    const { data, meta } = await getPostsData(query)
    await resolveRenderImages(data as unknown[])
    return ok(data, meta)
  }
  if (pathname.startsWith('/blog/') && method === 'GET') {
    const slug = pathname.slice('/blog/'.length)
    const posts = (await readCollection<BlogPost[]>('blog')) || []
    const post = posts.find((p) => p.slug === slug)
    if (!post) throw new ApiError('Post not found', 404)
    await resolveBodyImages(post as unknown as Record<string, unknown>)
    return ok(post)
  }
  if (pathname === '/admin/blog' && method === 'POST') {
    const posts = [...((await readCollection<BlogPost[]>('blog')) || [])]
    const item = normalizePost((body as Partial<BlogPost>) || {}, null)
    posts.push(item)
    persistOrThrow('blog', posts)
    return ok(item)
  }
  if (/^\/admin\/blog\/[^/]+$/.test(pathname) && method === 'PUT') {
    const id = pathname.split('/').pop()!
    const posts = [...((await readCollection<BlogPost[]>('blog')) || [])]
    const index = posts.findIndex((p) => p.id === id)
    if (index === -1) throw new ApiError('Post not found', 404)
    posts[index] = normalizePost((body as Partial<BlogPost>) || {}, posts[index])
    persistOrThrow('blog', posts)
    return ok(posts[index])
  }
  if (/^\/admin\/blog\/[^/]+$/.test(pathname) && method === 'DELETE') {
    const id = pathname.split('/').pop()!
    const posts = (await readCollection<BlogPost[]>('blog')) || []
    const filtered = posts.filter((p) => p.id !== id)
    if (filtered.length === posts.length) throw new ApiError('Post not found', 404)
    persistOrThrow('blog', filtered)
    return ok({ deleted: true, id })
  }

  // --- simple collections ---
  if (method === 'GET' && SIMPLE_GET[pathname]) {
    return ok(await readCollection(SIMPLE_GET[pathname]))
  }

  // --- public config (sanitized) ---
  if (pathname === '/config' && method === 'GET') {
    const config = await readCollection<SiteConfig>('config')
    const { siteName, defaultLang, features, emailjs } = config || ({} as SiteConfig)
    return ok({ siteName, defaultLang, features, emailjs })
  }

  throw new ApiError('Route not found', 404)
}

async function requestLive<T>(path: string, options: RequestOptions): Promise<ApiResponse<T>> {
  const { method = 'GET', body, headers = {}, isFormData = false } = options
  const token = getToken()

  const requestHeaders: Record<string, string> = { ...headers }
  if (token) requestHeaders.Authorization = `Bearer ${token}`
  if (!isFormData && body !== undefined) requestHeaders['Content-Type'] = 'application/json'

  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: requestHeaders,
      body:
        body === undefined
          ? undefined
          : isFormData
            ? (body as FormData)
            : JSON.stringify(body),
    })
  } catch {
    throw new ApiError('Network error. Make sure the server is running.', 0)
  }

  let payload: ApiResponse<T> | null = null
  try {
    payload = (await response.json()) as ApiResponse<T>
  } catch {
    payload = null
  }

  if (!response.ok || !payload?.success) {
    const message = payload?.error?.message || `Request failed (${response.status})`
    const hint = response.status === 0
      ? 'Tidak dapat terhubung ke server. Cek koneksi internet dan URL API.'
      : response.status === 401
        ? 'Sesi admin expired. Login ulang.'
        : response.status === 404
          ? `Endpoint tidak ditemukan: ${API_BASE}${path}. Pastikan backend sudah di-deploy dengan kode terbaru.`
          : ''
    throw new ApiError(`${message}${hint ? ` ${hint}` : ''}`, response.status)
  }

  return payload
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  if (STATIC_MODE) return handleStatic(path, options) as Promise<ApiResponse<T>>
  return requestLive<T>(path, options)
}

export const api = {
  get: <T>(path: string) => request<T>(path),

  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body }),

  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body }),

  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),

  upload: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: 'POST', body: formData, isFormData: true }),
}
