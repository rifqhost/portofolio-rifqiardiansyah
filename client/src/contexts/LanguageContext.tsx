// FILE: client/src/contexts/LanguageContext.tsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { translations, type Lang, type Translation } from '@/i18n'

function resolvePath(obj: unknown, key: string): unknown {
  return key.split('.').reduce<unknown>((acc, part) => {
    if (acc && typeof acc === 'object' && part in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, obj)
}

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  toggle: () => void
  t: (key: string, vars?: Record<string, string | number>) => string
  dict: Translation
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function getInitialLang(): Lang {
  if (typeof window === 'undefined') return 'id'
  try {
    const stored = window.localStorage.getItem('portfolio-lang')
    if (stored === 'en' || stored === 'id') return stored
  } catch {
    // ignore
  }
  return 'id'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang)

  useEffect(() => {
    document.documentElement.lang = lang
    try {
      window.localStorage.setItem('portfolio-lang', lang)
    } catch {
      // ignore
    }
  }, [lang])

  const setLang = useCallback((next: Lang) => setLangState(next), [])

  const toggle = useCallback(() => setLangState((prev) => (prev === 'id' ? 'en' : 'id')), [])

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>): string => {
      const dict = translations[lang]
      const value = resolvePath(dict, key)
      let text = value === undefined ? key : String(value)
      if (vars) {
        for (const [name, val] of Object.entries(vars)) {
          text = text.replaceAll(`{${name}}`, String(val))
        }
      }
      return text
    },
    [lang],
  )

  const value = useMemo(
    () => ({ lang, setLang, toggle, t, dict: translations[lang] }),
    [lang, setLang, toggle, t],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
