// FILE: scripts/prepare-images.mjs
// Generates PNG placeholder photos (avatar, project & blog covers) if they
// don't exist yet, so the site works out of the box and you can simply
// replace the files with real photos (keep the same filename).
import fs from 'fs'
import path from 'path'
import zlib from 'zlib'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const IMAGES_DIR = path.join(ROOT, 'client', 'public', 'images')

// ---------------------------------------------------------------------------
// Minimal pure-Node PNG encoder (no dependencies)
// ---------------------------------------------------------------------------
const crcTable = (() => {
  const table = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[n] = c
  }
  return table
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  }
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0)
  return Buffer.concat([len, typeBuf, data, crcBuf])
}

function encodePng(width, height, pixelFn) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // color type: truecolor RGB
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  const raw = Buffer.alloc(height * (1 + width * 3))
  let offset = 0
  for (let y = 0; y < height; y++) {
    raw[offset++] = 0 // filter: none
    for (let x = 0; x < width; x++) {
      const [r, g, b] = pixelFn(x, y)
      raw[offset++] = r
      raw[offset++] = g
      raw[offset++] = b
    }
  }

  const idat = zlib.deflateSync(raw, { level: 9 })
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// ---------------------------------------------------------------------------
// Placeholder designs (diagonal two-tone so each file is distinguishable)
// ---------------------------------------------------------------------------
function diagonal(hexA, hexB) {
  const a = hexToRgb(hexA)
  const b = hexToRgb(hexB)
  return (x, y, width, height) => {
    const diagonalLine = x / width + y / height
    return diagonalLine < 0.85 ? a : b
  }
}

function hexToRgb(hex) {
  const value = hex.replace('#', '')
  const n = parseInt(value, 16)
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]
}

// filename -> { width, height, pixelFn, source }
const PLACEHOLDERS = {
  'project-cbt.png': { w: 1200, h: 675, fn: diagonal('#1e1b4b', '#4f46e5') },
  'project-cbt-2.png': { w: 1200, h: 675, fn: diagonal('#312e81', '#6366f1') },
  'project-cbt-3.png': { w: 1200, h: 675, fn: diagonal('#1e1b4b', '#7c3aed') },
  'project-guestbook.png': { w: 1200, h: 675, fn: diagonal('#0c4a6e', '#0ea5e9') },
  'project-guestbook-2.png': { w: 1200, h: 675, fn: diagonal('#155e75', '#06b6d4') },
  'project-guestbook-3.png': { w: 1200, h: 675, fn: diagonal('#164e63', '#22d3ee') },
}

// ---------------------------------------------------------------------------
// Blog cover SVGs (gradient + judul) so the covers don't look empty.
// ---------------------------------------------------------------------------
const BLOG_COVERS = {
  'blog-rest-api.svg': {
    a: '#14532d',
    b: '#22c55e',
    category: 'BACKEND',
    title: ['REST API'],
    subtitle: 'Panduan untuk Pemula',
  },
  'blog-react.svg': {
    a: '#1e293b',
    b: '#38bdf8',
    category: 'FRONTEND',
    title: ['React + Vite'],
    subtitle: 'Panduan Singkat',
  },
  'blog-json.svg': {
    a: '#3f3f46',
    b: '#a1a1aa',
    category: 'BACKEND',
    title: ['JSON Storage'],
    subtitle: 'untuk Aplikasi',
  },
}

function buildBlogSvg(spec) {
  const titleText = spec.title
    .map(
      (line, i) =>
        `<text x="80" y="${320 + i * 100}" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="84" fill="#ffffff">${line}</text>`,
    )
    .join('\n    ')
  const subtitleY = 320 + spec.title.length * 100
  const circles = [
    '<circle cx="980" cy="140" r="220" fill="rgba(255,255,255,0.08)"/>',
    '<circle cx="1080" cy="480" r="150" fill="rgba(255,255,255,0.06)"/>',
    '<circle cx="180" cy="620" r="90" fill="rgba(255,255,255,0.05)"/>',
  ].join('\n    ')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${spec.a}"/>
      <stop offset="100%" stop-color="${spec.b}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="675" fill="url(#bg)"/>
  ${circles}
  <text x="80" y="120" font-family="Arial, Helvetica, sans-serif" font-size="32" font-weight="700" letter-spacing="4" fill="rgba(255,255,255,0.9)">${spec.category}</text>
  <rect x="80" y="152" width="64" height="6" rx="3" fill="rgba(255,255,255,0.5)"/>
  ${titleText}
  <text x="80" y="${subtitleY}" font-family="Arial, Helvetica, sans-serif" font-size="32" fill="rgba(255,255,255,0.8)">${spec.subtitle}</text>
</svg>
`
}

fs.mkdirSync(IMAGES_DIR, { recursive: true })

let created = 0
for (const [filename, spec] of Object.entries(PLACEHOLDERS)) {
  const target = path.join(IMAGES_DIR, filename)
  if (fs.existsSync(target)) {
    console.log(`[skip] ${path.relative(ROOT, target)} (already exists)`)
    continue
  }
  const png = encodePng(spec.w, spec.h, (x, y) => spec.fn(x, y, spec.w, spec.h))
  fs.writeFileSync(target, png)
  console.log(`[ok]   ${path.relative(ROOT, target)} (${spec.w}x${spec.h})`)
  created++
}

for (const [filename, spec] of Object.entries(BLOG_COVERS)) {
  const target = path.join(IMAGES_DIR, filename)
  if (fs.existsSync(target)) {
    console.log(`[skip] ${path.relative(ROOT, target)} (already exists)`)
    continue
  }
  fs.writeFileSync(target, buildBlogSvg(spec))
  console.log(`[ok]   ${path.relative(ROOT, target)} (1200x675 svg)`)
  created++
}

console.log(
  created === 0
    ? '\nSemua gambar placeholder sudah ada.'
    : `\n${created} gambar placeholder dibuat. Ganti dengan gambar asli (pertahankan nama file yang sama) untuk dipakai di situs.`,
)
