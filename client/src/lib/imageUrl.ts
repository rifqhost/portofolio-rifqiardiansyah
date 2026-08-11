// FILE: client/src/lib/imageUrl.ts
// Helpers untuk menangani URL gambar yang diinput admin.
// Khususnya link halaman ImgBB (mis. https://ibb.co.com/PZYqkdVy) yang merupakan
// halaman web, bukan file gambar. <img> tidak bisa menampilkan halaman web,
// jadi link tsb dikonversi otomatis ke direct link (https://i.ibb.co.com/…).

// Pattern juga menangkap domain imgbb.com dan subdomain i.ibb.co.com yang
// kadang muncul di share links.
const IMGBB_PAGE_PATTERN = /^https?:\/\/(?:(?:www\.)?(?:ibb|imgbb)\.co?(?:\.com)?|i\.ibb\.co\.com)\/[A-Za-z0-9_-]+(?:\?.*)?$/

const PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  (url: string) => `https://api.cors.lol/?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url.replace('ibb.co.com', 'ibb.co'))}`,
  (url: string) => `https://corsproxy.io/?url=${encodeURIComponent(url.replace('ibb.co.com', 'ibb.co'))}`,
]

// Cache hasil resolve per URL agar tidak fetch berulang saat submit.
const resolveCache = new Map<string, string>()

export function isImgbbPageLink(url: string): boolean {
  return IMGBB_PAGE_PATTERN.test(url.trim())
}

function decodeEntities(input: string): string {
  return input
    .replace(/&/g, '&')
    .replace(/"/g, '"')
    .replace(/'/g, "'")
    .replace(/</g, '<')
    .replace(/>/g, '>')
}

function extractOgImage(html: string): string | null {
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']og:image["']/i,
  ]
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match?.[1]) return decodeEntities(match[1]).trim()
  }
  return null
}

async function fetchViaProxies(pageUrl: string): Promise<string | null> {
  for (const buildProxyUrl of PROXIES) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 8000)
      const response = await fetch(buildProxyUrl(pageUrl), { signal: controller.signal })
      clearTimeout(timeout)
      if (!response.ok) continue
      const text = await response.text()
      if (!text || text.length > 1_500_000) continue

      // Proxy /get dari allorigins membungkus response dalam JSON { contents }
      let html = text
      if (text.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(text) as { contents?: string }
          if (typeof parsed.contents === 'string') html = parsed.contents
        } catch {
          // biarkan text polos
        }
      }

      const direct = extractOgImage(html)
      if (direct) return direct
    } catch {
      // coba proxy berikutnya
    }
  }
  return null
}

/**
 * Konversi link halaman ImgBB menjadi direct image URL.
 * Jika bukan link halaman ImgBB, URL dikembalikan apa adanya.
 * Jika resolusi gagal, URL asli dikembalikan agar tidak memblokir admin.
 */
export async function resolveImageUrl(raw: string): Promise<string> {
  const url = raw.trim()
  if (!url) return url
  if (!isImgbbPageLink(url)) return url

  const cached = resolveCache.get(url)
  if (cached) return cached

  const direct = await fetchViaProxies(url)
  if (direct) {
    resolveCache.set(url, direct)
    return direct
  }

  // Fallback: thumbnail ImgBB yang bisa ditebak dari ID halaman (tidak selalu tersedia).
  // Biarkan URL asli tersimpan agar admin tetap bisa menyimpan datanya.
  return url
}

const IMAGE_FIELD_KEYS = ['image', 'cover', 'avatar', 'ogImage', 'cv'] as const

/**
 * Scan body form admin dan konversi semua link halaman ImgBB menjadi
 * direct image URL, sebelum data disimpan. Dijalankan terpusat di layer API
 * sehingga semua halaman admin (proyek, sertifikat, blog, profil) terlindungi,
 * bahkan jika auto-resolve di UI gagal atau terlewat.
 */
export async function resolveBodyImages(body: Record<string, unknown>): Promise<void> {
  if (!body || typeof body !== 'object') return

  for (const key of IMAGE_FIELD_KEYS) {
    const value = body[key]
    if (typeof value === 'string' && value.trim()) {
      body[key] = await resolveImageUrl(value)
    }
  }

  if (Array.isArray(body.gallery)) {
    body.gallery = await Promise.all(
      (body.gallery as unknown[]).map((url) => resolveImageUrl(String(url))),
    )
  }

  if (Array.isArray(body.items)) {
    await Promise.all(
      (body.items as Record<string, unknown>[]).map(async (item) => {
        if (item && typeof item.image === 'string' && item.image.trim()) {
          item.image = await resolveImageUrl(item.image)
        }
      }),
    )
  }

  if (body.seo && typeof body.seo === 'object') {
    const seo = body.seo as Record<string, unknown>
    if (typeof seo.ogImage === 'string' && seo.ogImage.trim()) {
      seo.ogImage = await resolveImageUrl(seo.ogImage)
    }
  }
}
