// FILE: scripts/prepare-static.mjs
// Prepares static assets for Netlify deployment:
// 1. Copies data/*.json  -> client/public/data/ (config.json is sanitized)
// 2. Copies data/uploads -> client/public/uploads/
// 3. Regenerates robots.txt & sitemap.xml from VITE_SITE_URL
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const DATA_DIR = path.join(ROOT, 'data')
const PUBLIC_DIR = path.join(ROOT, 'client', 'public')
const PUBLIC_DATA_DIR = path.join(PUBLIC_DIR, 'data')
const PUBLIC_UPLOADS_DIR = path.join(PUBLIC_DIR, 'uploads')

const SITE_URL = (process.env.VITE_SITE_URL || '').replace(/\/+$/, '') || 'https://YOUR-SITE.netlify.app'

fs.mkdirSync(PUBLIC_DATA_DIR, { recursive: true })
fs.mkdirSync(PUBLIC_UPLOADS_DIR, { recursive: true })

// 1) Copy JSON data files (skip subfolders, sanitize config.json)
const jsonFiles = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.json'))
for (const file of jsonFiles) {
  const sourcePath = path.join(DATA_DIR, file)
  const targetPath = path.join(PUBLIC_DATA_DIR, file)
  let content = fs.readFileSync(sourcePath, 'utf8')

  if (file === 'config.json') {
    try {
      const config = JSON.parse(content)
      delete config.adminUsername
      delete config.adminPasswordHash
      content = JSON.stringify(config, null, 2)
    } catch {
      // keep original content if invalid JSON
    }
  }

  fs.writeFileSync(targetPath, content)
  console.log(`[ok]   ${path.relative(ROOT, targetPath)}`)
}

// 2) Copy uploads (CV, etc.) so /uploads/* works on static hosting.
//    data/uploads is gitignored, so generate a sample CV if missing.
const UPLOADS_SRC = path.join(DATA_DIR, 'uploads')
const CV_NAME = 'cv-rifqi-ardiansyah.pdf'
const cvSource = path.join(UPLOADS_SRC, CV_NAME)
if (!fs.existsSync(cvSource)) {
  fs.mkdirSync(UPLOADS_SRC, { recursive: true })
  fs.writeFileSync(cvSource, buildSampleCv(), 'utf8')
  console.log('[ok]   data/uploads/cv-rifqi-ardiansyah.pdf (sample)')
}

if (fs.existsSync(DATA_DIR) && fs.existsSync(UPLOADS_SRC)) {
  for (const file of fs.readdirSync(UPLOADS_SRC)) {
    const sourcePath = path.join(UPLOADS_SRC, file)
    if (!fs.statSync(sourcePath).isFile()) continue
    fs.copyFileSync(sourcePath, path.join(PUBLIC_UPLOADS_DIR, file))
    console.log(`[ok]   ${path.relative(ROOT, path.join(PUBLIC_UPLOADS_DIR, file))}`)
  }
}

function buildSampleCv() {
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
  const content = lines.join('\n')
  return `${content}\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000310 00000 n \n0000000499 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${content.length}\n%%EOF\n`
}

// 3) robots.txt
fs.writeFileSync(
  path.join(PUBLIC_DIR, 'robots.txt'),
  `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
)
console.log('[ok]   client/public/robots.txt')

// 4) sitemap.xml
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
fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemap)
console.log('[ok]   client/public/sitemap.xml')

console.log('\nStatic data ready for Netlify build.')
console.log(`Sitemap/robots URL: ${SITE_URL} (atur dengan env VITE_SITE_URL)`)
