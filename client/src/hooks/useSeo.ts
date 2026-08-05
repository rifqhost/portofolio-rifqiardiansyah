// FILE: client/src/hooks/useSeo.ts
import { useEffect } from 'react'

interface SeoOptions {
  title?: string
  description?: string
  keywords?: string
  image?: string
  canonicalPath?: string
  type?: string
  jsonLd?: object | null
  noindex?: boolean
}

export type { SeoOptions }

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export function useSeo(options: SeoOptions) {
  const {
    title,
    description,
    keywords,
    image,
    canonicalPath = '/',
    type = 'website',
    jsonLd = null,
    noindex = false,
  } = options

  useEffect(() => {
    const siteName = import.meta.env.VITE_SITE_NAME || 'Rifqi Ardiansyah'
    const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin
    const fullTitle = title ? `${title} | ${siteName}` : siteName
    const fullDescription = description || ''
    const fullImage = image
      ? `${siteUrl}${image.startsWith('/') ? image : `/${image}`}`
      : `${siteUrl}/images/og-image.svg`
    const canonical = `${siteUrl}${canonicalPath === '/' ? '/' : canonicalPath}`

    document.title = fullTitle
    upsertMeta('name', 'description', fullDescription)
    upsertMeta('name', 'keywords', keywords || '')
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow')
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', fullDescription)
    upsertMeta('property', 'og:type', type)
    upsertMeta('property', 'og:image', fullImage)
    upsertMeta('property', 'og:url', canonical)
    upsertMeta('name', 'twitter:title', fullTitle)
    upsertMeta('name', 'twitter:description', fullDescription)
    upsertMeta('name', 'twitter:image', fullImage)
    upsertLink('canonical', canonical)

    if (jsonLd) {
      let el = document.getElementById('jsonld-schema')
      if (!el) {
        el = document.createElement('script')
        el.id = 'jsonld-schema'
        el.setAttribute('type', 'application/ld+json')
        document.head.appendChild(el)
      }
      el.textContent = JSON.stringify(jsonLd)
    }
  }, [title, description, keywords, image, canonicalPath, type, jsonLd, noindex])
}
