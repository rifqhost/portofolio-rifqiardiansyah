// FILE: client/src/components/SEO.tsx
import { useSeo, type SeoOptions } from '@/hooks/useSeo'

export function SEO(props: SeoOptions) {
  useSeo(props)
  return null
}
