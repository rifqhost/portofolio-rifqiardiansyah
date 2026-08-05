// FILE: client/src/components/layouts/Footer.tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Github, Heart, Mail, MapPin, MessageCircle, Users } from 'lucide-react'
import { Container } from '@/components/Section'
import { SocialLinks } from '@/components/SocialLinks'
import { useLanguage } from '@/contexts/LanguageContext'
import { useFetch } from '@/hooks/useFetch'
import { api } from '@/services/api'
import type { Profile } from '@/types'

const QUICK_LINKS = [
  { path: '/about', key: 'about' },
  { path: '/skills', key: 'skills' },
  { path: '/projects', key: 'projects' },
  { path: '/experience', key: 'experience' },
  { path: '/education', key: 'education' },
  { path: '/certificates', key: 'certificates' },
  { path: '/blog', key: 'blog' },
  { path: '/testimonials', key: 'testimonials' },
  { path: '/contact', key: 'contact' },
]

const SITE_LINKS = [
  { path: '/', key: 'home' },
  { path: '/projects', key: 'projects' },
  { path: '/blog', key: 'blog' },
  { path: '/contact', key: 'contact' },
]

export function Footer() {
  const { t } = useLanguage()
  const { data: profile } = useFetch<Profile>('/profile')
  const [visitors, setVisitors] = useState(0)

  useEffect(() => {
    try {
      const stored = Number(localStorage.getItem('portfolio_visitors') || 0)
      setVisitors(stored + 1)
      localStorage.setItem('portfolio_visitors', String(stored + 1))
    } catch {
      // ignore
    }
    if (!sessionStorage.getItem('portfolio_visited')) {
      sessionStorage.setItem('portfolio_visited', '1')
      api.post('/visitors', {}).catch(() => {
        // ignore
      })
    }
  }, [])

  const year = new Date().getFullYear()

  return (
    <footer className="relative z-10 border-t border-border/60 bg-background/60 backdrop-blur-xl">
      <Container className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 font-display text-sm font-bold text-primary">
              RA
            </span>
            <span className="font-display text-sm font-semibold">Rifqi Ardiansyah</span>
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            {t('footer.about')}
          </p>
          {profile?.socials && <SocialLinks socials={profile.socials} />}
        </div>

        <nav aria-label={t('footer.quickLinks')}>
          <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-foreground">
            {t('footer.quickLinks')}
          </h3>
          <ul className="grid grid-cols-1 gap-2">
            {QUICK_LINKS.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {t(`nav.${item.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={t('footer.projects')}>
          <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-foreground">
            {t('footer.projects')}
          </h3>
          <ul className="flex flex-col gap-2">
            {SITE_LINKS.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  {t(`nav.${item.key}`)}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-col gap-2 text-sm text-muted-foreground">
            <a
              href={profile?.socials?.github || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 transition-colors hover:text-primary"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
            <a
              href={`mailto:${profile?.socials?.email || ''}`}
              className="inline-flex items-center gap-2 transition-colors hover:text-primary"
            >
              <Mail className="h-4 w-4" />
              {profile?.socials?.email || 'Email'}
            </a>
            <a
              href={`https://wa.me/${profile?.socials?.whatsapp || ''}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 transition-colors hover:text-primary"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          </div>
        </nav>

        <div>
          <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-foreground">
            {t('contact.infoTitle')}
          </h3>
          <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-primary" />
              <a href={`mailto:${profile?.socials?.email || ''}`} className="hover:text-primary">
                {profile?.socials?.email || '-'}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              {profile?.personalInfo?.location || 'Indonesia'}
            </li>
            <li className="flex items-center gap-2">
              <Users className="h-4 w-4 shrink-0 text-primary" />
              {t('common.visitors')}: <span className="font-medium text-foreground">{visitors}</span>
            </li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-border/60">
        <Container className="flex flex-col items-center justify-between gap-2 py-6 text-center text-xs text-muted-foreground sm:flex-row sm:text-left">
          <p>
            © {year} Rifqi Ardiansyah. {t('footer.rights')}
          </p>
          <p className="flex items-center gap-1.5">
            {t('footer.madeWith')} <Heart className="h-3.5 w-3.5 fill-primary text-primary" />{' '}
            {t('footer.by')} Rifqi Ardiansyah
          </p>
        </Container>
      </div>
    </footer>
  )
}
