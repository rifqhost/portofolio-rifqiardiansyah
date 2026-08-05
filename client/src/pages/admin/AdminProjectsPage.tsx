// FILE: client/src/pages/admin/AdminProjectsPage.tsx
import { useState, type FormEvent } from 'react'
import { FolderKanban, Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { useToast } from '@/contexts/ToastContext'
import { useFetch } from '@/hooks/useFetch'
import { api } from '@/services/api'
import type { Project, ProjectStatus } from '@/types'

interface ProjectForm {
  title: string
  description: string
  category: string
  image: string
  github: string
  demo: string
  status: string
  date: string
  techStack: string
  features: string
}

const EMPTY_FORM: ProjectForm = {
  title: '',
  description: '',
  category: 'Web',
  image: '',
  github: '',
  demo: '',
  status: 'in-progress',
  date: new Date().getFullYear().toString(),
  techStack: '',
  features: '',
}

const toForm = (p: Project): ProjectForm => ({
  title: p.title,
  description: p.description,
  category: p.category,
  image: p.image,
  github: p.github,
  demo: p.demo,
  status: p.status,
  date: p.date,
  techStack: p.techStack.join('\n'),
  features: p.features.join('\n'),
})

const fromForm = (form: ProjectForm) => ({
  title: form.title.trim(),
  description: form.description.trim(),
  category: form.category.trim(),
  image: form.image.trim(),
  github: form.github.trim(),
  demo: form.demo.trim(),
  status: form.status as ProjectStatus,
  date: form.date.trim(),
  techStack: form.techStack
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean),
  features: form.features
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean),
})

export function AdminProjectsPage() {
  const { toast } = useToast()
  const { data, loading, error, refetch } = useFetch<Project[]>('/projects?limit=100')

  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProjectForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = (data ?? []).filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()),
  )

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  const openEdit = (project: Project) => {
    setEditingId(project.id)
    setForm(toForm(project))
    setDialogOpen(true)
  }

  const setField = (field: keyof ProjectForm) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = fromForm(form)
      if (editingId) {
        await api.put(`/admin/projects/${editingId}`, payload)
        toast('Proyek berhasil diperbarui', 'success')
      } else {
        await api.post('/admin/projects', payload)
        toast('Proyek berhasil ditambahkan', 'success')
      }
      setDialogOpen(false)
      refetch()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Gagal menyimpan proyek', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.del(`/admin/projects/${deleteTarget.id}`)
      toast('Proyek dihapus', 'success')
      setDeleteTarget(null)
      refetch()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Gagal menghapus proyek', 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Kelola Proyek</h1>
          <p className="mt-1 text-sm text-muted-foreground">Tambah, edit, dan hapus proyek portfolio.</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Tambah Proyek
        </Button>
      </div>

      <div className="relative w-full max-w-sm">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari proyek…"
          className="pl-10"
        />
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error} · <button className="underline" onClick={refetch}>Coba lagi</button>
        </div>
      ) : loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl bg-secondary" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <FolderKanban className="h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">Belum ada proyek.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <div className="relative aspect-[16/9] bg-secondary/50">
                <img
                  src={project.image || '/images/placeholder.svg'}
                  alt={project.title}
                  className="h-full w-full object-cover"
                />
                <Badge className="absolute left-3 top-3">{project.category}</Badge>
              </div>
              <div className="p-5">
                <h3 className="truncate font-display text-sm font-semibold">{project.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {project.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <Badge variant={project.status === 'completed' ? 'success' : 'warning'}>
                    {project.status}
                  </Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(project)} aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setDeleteTarget(project)}
                      aria-label="Hapus"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Proyek' : 'Tambah Proyek'}</DialogTitle>
            <DialogDescription>Lengkapi informasi proyek di bawah ini.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="p-title">Judul *</Label>
              <Input id="p-title" value={form.title} onChange={(e) => setField('title')(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-desc">Deskripsi</Label>
              <Textarea
                id="p-desc"
                rows={3}
                value={form.description}
                onChange={(e) => setField('description')(e.target.value)}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="p-category">Kategori</Label>
                <Input id="p-category" value={form.category} onChange={(e) => setField('category')(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-date">Tahun</Label>
                <Input id="p-date" value={form.date} onChange={(e) => setField('date')(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="p-status">Status</Label>
                <Select value={form.status} onValueChange={setField('status')}>
                  <SelectTrigger id="p-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Selesai</SelectItem>
                    <SelectItem value="in-progress">Dalam Pengerjaan</SelectItem>
                    <SelectItem value="draft">Draf</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-demo">Link Demo</Label>
                <Input id="p-demo" value={form.demo} onChange={(e) => setField('demo')(e.target.value)} placeholder="https://…" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-github">Link GitHub</Label>
              <Input id="p-github" value={form.github} onChange={(e) => setField('github')(e.target.value)} placeholder="https://…" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-tech">Tech Stack (satu per baris)</Label>
              <Textarea
                id="p-tech"
                rows={3}
                value={form.techStack}
                onChange={(e) => setField('techStack')(e.target.value)}
                placeholder={'React\nNode.js\nExpress'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-features">Fitur (satu per baris)</Label>
              <Textarea
                id="p-features"
                rows={3}
                value={form.features}
                onChange={(e) => setField('features')(e.target.value)}
                placeholder={'Autentikasi JWT\nCRUD data'}
              />
            </div>
            <ImageUpload value={form.image} onChange={setField('image')} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Proyek?"
        description={`Proyek "${deleteTarget?.title}" akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`}
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  )
}
