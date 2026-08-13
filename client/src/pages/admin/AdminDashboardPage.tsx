// FILE: client/src/pages/admin/AdminDashboardPage.tsx
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Eye,
  FileText,
  FolderKanban,
  GraduationCap,
  Award,
  Briefcase,
  Star,
  Wrench,
  BarChart3,
  Globe,
  Server,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useFetch } from '@/hooks/useFetch'
import { api } from '@/services/api'
import type { DashboardStats } from '@/types'
import { cn } from '@/lib/utils'

export function AdminDashboardPage() {
  const { data, loading, error, refetch } = useFetch<DashboardStats>('/admin/dashboard/stats')
  const [apiHealth, setApiHealth] = useState<{ ok: boolean; url: string } | null>(null)
  const [checking, setChecking] = useState(false)

  const checkApiHealth = async () => {
    setChecking(true)
    try {
      await api.get('/health')
      setApiHealth({ ok: true, url: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' })
    } catch {
      setApiHealth({ ok: false, url: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' })
    } finally {
      setChecking(false)
    }
  }

  const statCards = useMemo(() => {
    const counts = data?.counts
    return [
      { label: 'Proyek', value: counts?.projects ?? 0, icon: FolderKanban, to: '/admin/projects' },
      { label: 'Artikel', value: counts?.blog ?? 0, icon: FileText, to: '/admin/blog' },
      { label: 'Keahlian', value: counts?.skills ?? 0, icon: Wrench, to: '/admin/profile' },
      { label: 'Pendidikan', value: counts?.education ?? 0, icon: GraduationCap, to: '/admin/profile' },
      { label: 'Pengalaman', value: counts?.experience ?? 0, icon: Briefcase, to: '/admin/profile' },
      { label: 'Sertifikat', value: counts?.certificates ?? 0, icon: Award, to: '/admin/profile' },
      { label: 'Testimoni', value: counts?.testimonials ?? 0, icon: Star, to: '/admin/profile' },
      { label: 'Pengunjung', value: counts?.visitors ?? 0, icon: Eye },
    ]
  }, [data])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ringkasan konten dan aktivitas situs Anda.
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/projects">+ Proyek Baru</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-2 text-sm">
            <Server className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Backend:</span>
            <span className="font-mono text-xs">{import.meta.env.VITE_API_URL || 'Tidak dikonfigurasi (mode statis/localStorage)'}</span>
            {apiHealth && (
              <span className={cn('text-xs', apiHealth.ok ? 'text-emerald-600' : 'text-destructive')}>
                {apiHealth.ok ? '● Terhubung' : '● Gagal terhubung'}
              </span>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={checkApiHealth} disabled={checking} className="gap-2">
            {checking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
            {checking ? 'Cek koneksi...' : 'Cek koneksi backend'}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error} · <button className="underline" onClick={refetch}>Coba lagi</button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Link key={card.label} to={card.to ?? '#'} className={cn(!card.to && 'pointer-events-none')}>
            <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:border-primary/40">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                  <p className="mt-1 font-display text-2xl font-bold">{card.value}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <card.icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
            <h2 className="font-display text-base font-semibold">Proyek Terbaru</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/projects">Kelola</Link>
            </Button>
          </div>
          <div className="p-2">
            {loading ? (
              <div className="space-y-2 p-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded-lg bg-secondary" />
                ))}
              </div>
            ) : (data?.latestProjects?.length ?? 0) === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">Belum ada proyek.</p>
            ) : (
              <ul className="divide-y divide-border/50">
                {data?.latestProjects.map((project) => (
                  <li key={project.id} className="flex items-center gap-3 px-4 py-3">
                    <img
                      src={project.image || '/images/placeholder.svg'}
                      alt=""
                      decoding="async"
                      width={1200}
                      height={675}
                      className="h-10 w-14 shrink-0 rounded-lg border border-border object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{project.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{project.category}</p>
                    </div>
                    <Badge
                      variant={project.status === 'completed' ? 'success' : 'warning'}
                    >
                      {project.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
            <h2 className="font-display text-base font-semibold">Artikel Terbaru</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/blog">Kelola</Link>
            </Button>
          </div>
          <div className="p-2">
            {loading ? (
              <div className="space-y-2 p-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded-lg bg-secondary" />
                ))}
              </div>
            ) : (data?.latestPosts?.length ?? 0) === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">Belum ada artikel.</p>
            ) : (
              <ul className="divide-y divide-border/50">
                {data?.latestPosts.map((post) => (
                  <li key={post.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{post.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {post.category} · {post.date}
                      </p>
                    </div>
                    {post.featured && <Badge>Featured</Badge>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-3 border-b border-border/60 px-6 py-4">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="font-display text-base font-semibold">Analitik</h2>
        </div>
        <CardContent className="p-6">
          {loading ? (
            <div className="h-24 animate-pulse rounded-xl bg-secondary" />
          ) : (
            <p className="text-sm leading-relaxed text-muted-foreground">
              {data?.analytics?.message ||
                'Analytics placeholder - connect a real analytics service later'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
