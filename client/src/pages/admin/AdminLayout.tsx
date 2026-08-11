// FILE: client/src/pages/admin/AdminLayout.tsx
import { useState } from 'react'
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Award,
  ExternalLink,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Newspaper,
  Settings,
  Sun,
  UserRound,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/ThemeContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { isAuthenticated, clearToken } from '@/services/auth'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/projects', label: 'Proyek', icon: FolderKanban },
  { to: '/admin/certificates', label: 'Sertifikat', icon: Award },
  { to: '/admin/blog', label: 'Blog', icon: Newspaper },
  { to: '/admin/profile', label: 'Profil', icon: UserRound },
  { to: '/admin/settings', label: 'Pengaturan', icon: Settings },
]

export function AdminLayout() {
  const navigate = useNavigate()
  const { resolvedTheme, toggle } = useTheme()
  const { toggle: toggleLang, lang } = useLanguage()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace />
  }

  const handleLogout = () => {
    clearToken()
    navigate('/admin/login', { replace: true })
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border/60 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent font-display font-bold text-primary-foreground">
          RA
        </div>
        <div>
          <p className="font-display text-sm font-bold leading-tight">Admin Panel</p>
          <p className="text-xs text-muted-foreground">Rifqi Ardiansyah</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 border-t border-border/60 p-4">
        <Button asChild variant="ghost" className="w-full justify-start gap-3">
          <a href="/" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
            Lihat Situs
          </a>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border/60 bg-background lg:block">
        {sidebar}
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-border bg-background">
            <button
              className="absolute right-4 top-5 rounded-lg p-1 text-muted-foreground hover:bg-secondary"
              onClick={() => setSidebarOpen(false)}
              aria-label="Tutup menu"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <p className="text-sm text-muted-foreground">
              Selamat datang kembali, <span className="font-medium text-foreground">Admin</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Ganti tema">
              {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleLang} className="font-mono text-xs">
              {lang === 'id' ? 'EN' : 'ID'}
            </Button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
