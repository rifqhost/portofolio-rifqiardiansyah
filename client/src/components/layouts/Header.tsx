// FILE: client/src/components/layouts/Header.tsx
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Menu, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Container } from '@/components/Section'
import { ThemeToggle } from '@/components/ThemeToggle'
import { LanguageSwitch } from '@/components/LanguageSwitch'
import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { path: '/', key: 'home', end: true },
  { path: '/about', key: 'about', end: false },
  { path: '/skills', key: 'skills', end: false },
  { path: '/projects', key: 'projects', end: false },
]

const MORE_ITEMS = [
  { path: '/experience', key: 'experience', end: false },
  { path: '/education', key: 'education', end: false },
  { path: '/certificates', key: 'certificates', end: false },
  { path: '/blog', key: 'blog', end: false },
  { path: '/testimonials', key: 'testimonials', end: false },
]

const ALL_ITEMS = [
  ...NAV_ITEMS,
  ...MORE_ITEMS,
  { path: '/contact', key: 'contact', end: false },
]

function NavItemLink({ item, onNavigate }: { item: (typeof NAV_ITEMS)[number]; onNavigate?: () => void }) {
  const { t } = useLanguage()
  return (
    <NavLink
      to={item.path}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'relative rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
        )
      }
    >
      {({ isActive }) => (
        <>
          {t(`nav.${item.key}`)}
          {isActive && (
            <motion.span
              layoutId="nav-underline"
              className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-primary"
            />
          )}
        </>
      )}
    </NavLink>
  )
}

export function Header() {
  const { t } = useLanguage()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        scrolled
          ? 'border-b border-border/60 bg-background/80 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-3">
        <Link to="/" className="group flex items-center gap-2.5" aria-label="Rifqi Ardiansyah - Home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 font-display text-sm font-bold text-primary shadow-glow-sm transition-transform duration-300 group-hover:scale-105">
            RA
          </span>
          <span className="hidden font-display text-sm font-semibold sm:block">
            Rifqi Ardiansyah
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <NavItemLink key={item.path} item={item} />
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                {t('common.more')}
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {MORE_ITEMS.map((item) => (
                <DropdownMenuItem key={item.path} asChild>
                  <Link to={item.path} className="w-full">
                    {t(`nav.${item.key}`)}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <NavItemLink item={{ path: '/contact', key: 'contact', end: false }} />
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <LanguageSwitch />
          <Link to="/contact" className="hidden sm:block">
            <Button size="sm" className="ml-1 rounded-xl">
              <Send />
              {t('common.contactMe')}
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl lg:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </Container>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="glass-strong absolute inset-x-0 top-full border-b lg:hidden"
            aria-label="Mobile navigation"
          >
            <Container className="flex flex-col gap-1 py-4">
              {ALL_ITEMS.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'rounded-xl px-4 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                    )
                  }
                >
                  {t(`nav.${item.key}`)}
                </NavLink>
              ))}
            </Container>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
