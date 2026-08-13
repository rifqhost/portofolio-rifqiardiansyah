// FILE: server/utils/resolveImageUrl.js
import https from 'https'
import http from 'http'

const IMGBB_PAGE_PATTERN = /^https?:\/\/(?:(?:www\.)?(?:ibb|imgbb)\.co?(?:\.com)?|i\.ibb\.co\.com)\/[A-Za-z0-9_-]+(?:\?.*)?$/

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http
    const req = mod.get(url, (res) => {
      const chunks = []
      res.on('data', (c) => chunks.push(c))
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')))
      res.on('error', reject)
    })
    req.on('error', reject)
    req.setTimeout(8000, () => {
      req.destroy()
      reject(new Error('timeout'))
    })
  })
}

function extractOgImage(html) {
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']og:image["']/i,
  ]
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) return match[1].trim()
  }
  return null
}

export async function resolveImageUrl(pageUrl) {
  const url = String(pageUrl || '').trim()
  if (!url) return url
  if (!IMGBB_PAGE_PATTERN.test(url)) return url

  try {
    const html = await fetchHtml(url)
    const direct = extractOgImage(html)
    if (direct) return direct
  } catch {
    // ignore
  }

  const m = url.match(/\/([A-Za-z0-9_-]+)\/?$/)
  if (m?.[1]) {
    const id = m[1]
    const variants = [
      `https://i.ibb.co/${id}`,
      `https://i.ibb.co/${id}.jpg`,
      `https://i.ibb.co/${id}.png`,
      `https://i.ibb.co/${id}.webp`,
    ]
    for (const candidate of variants) {
      try {
        const res = await new Promise((resolve, reject) => {
          https.get(candidate, (r) => resolve(r), (e) => reject(e))
        })
        if (res.statusCode === 200) return candidate
      } catch {
        // next candidate
      }
    }
  }

  return url
}
