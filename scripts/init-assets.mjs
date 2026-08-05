// FILE: scripts/init-assets.mjs
// Generates / verifies public assets: manifest, robots, sitemap, service worker, and a sample CV PDF.
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const PUBLIC_DIR = path.join(ROOT, 'client', 'public')
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images')
const UPLOADS_DIR = path.join(ROOT, 'data', 'uploads')

const SITE_URL = process.env.VITE_SITE_URL || 'https://rifqi-ardiansyah.vercel.app'

const writeIfMissing = (file, content) => {
  if (fs.existsSync(file)) {
    console.log(`[skip] ${path.relative(ROOT, file)} (already exists)`)
    return
  }
  fs.writeFileSync(file, content)
  console.log(`[ok]   ${path.relative(ROOT, file)}`)
}

fs.mkdirSync(PUBLIC_DIR, { recursive: true })
fs.mkdirSync(IMAGES_DIR, { recursive: true })
fs.mkdirSync(UPLOADS_DIR, { recursive: true })

writeIfMissing(
  path.join(PUBLIC_DIR, 'manifest.webmanifest'),
  JSON.stringify(
    {
      name: 'Rifqi Ardiansyah - Web & Backend Developer',
      short_name: 'Rifqi Dev',
      description:
        'Portfolio Rifqi Ardiansyah, siswa SMK RPL yang fokus pada Web Development dan Backend Development.',
      start_url: '/',
      display: 'standalone',
      background_color: '#0f0d1a',
      theme_color: '#7c5cf0',
      lang: 'id',
      icons: [
        { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        { src: '/images/og-image.svg', sizes: '1200x630', type: 'image/svg+xml', purpose: 'any' },
      ],
    },
    null,
    2,
  ),
)

writeIfMissing(
  path.join(PUBLIC_DIR, 'robots.txt'),
  `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
)

const routes = [
  '',
  'about',
  'skills',
  'projects',
  'experience',
  'education',
  'certificates',
  'blog',
  'testimonials',
  'contact',
]
const now = new Date().toISOString().slice(0, 10)
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${SITE_URL}/${route}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`
writeIfMissing(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemap)

const sw = `// Service Worker - simple app-shell cache (dev-friendly)
const CACHE_NAME = 'rifqi-portfolio-v1'
const SHELL = ['/', '/manifest.webmanifest']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)).catch(() => {}),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .catch(() => {}),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) return
  if (request.url.includes('/api/') || request.url.includes('/admin')) return
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request)
          .then((response) => {
            const copy = response.clone()
            if (response.ok) {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {})
            }
            return response
          })
          .catch(() => caches.match('/')),
    ),
  )
})
`
writeIfMissing(path.join(PUBLIC_DIR, 'sw.js'), sw)

const cvPath = path.join(UPLOADS_DIR, 'cv-rifqi-ardiansyah.pdf')
if (!fs.existsSync(cvPath)) {
  const lines = [
    '%PDF-1.4',
    '1 0 obj',
    '<< /Type /Catalog /Pages 2 0 R >>',
    'endobj',
    '2 0 obj',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    'endobj',
    '3 0 obj',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    'endobj',
    '4 0 obj',
    '<< /Length 118 >>',
    'stream',
    'BT /F1 22 Tf 60 760 Td (CV - Rifqi Ardiansyah) Tj ET',
    'BT /F1 12 Tf 60 726 Td (Web Developer & Backend Developer) Tj ET',
    'BT /F1 12 Tf 60 700 Td (Ganti file ini dengan CV asli Anda di data/uploads/) Tj ET',
    'endstream',
    'endobj',
    '5 0 obj',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    'endobj',
    'trailer',
    '<< /Size 6 /Root 1 0 R >>',
    '%%EOF',
  ]
  const offsetFor = (index) => {
    const parts = lines.join('\n').split('\n')
    let len = 0
    for (let i = 0; i < index; i++) {
      len += parts[i].length + 1
    }
    return len
  }
  const finalXref = `xref\n0 6\n0000000000 65535 f \n${Array.from({ length: 5 }, (_, i) => `${String(offsetFor(i)).padStart(10, '0')} 00000 n \n`).join('')}`
  const content = lines.join('\n')
  const withXref = `${content}\n${finalXref}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${content.length}\n%%EOF\n`
  fs.writeFileSync(cvPath, withXref, 'utf8')
  console.log('[ok]   data/uploads/cv-rifqi-ardiansyah.pdf (sample)')
} else {
  console.log('[skip] data/uploads/cv-rifqi-ardiansyah.pdf (already exists)')
}

console.log('\nAssets ready. Replace the sample CV PDF with your real CV.')
