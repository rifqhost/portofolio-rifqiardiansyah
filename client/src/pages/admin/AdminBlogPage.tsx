// FILE: client/src/pages/admin/AdminBlogPage.tsx
import { useState, type FormEvent } from 'react'
import { Loader2, Newspaper, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { useToast } from '@/contexts/ToastContext'
import { useFetch } from '@/hooks/useFetch'
import { api } from '@/services/api'
import type { BlogPost } from '@/types'

interface PostForm {
  title: string
  excerpt: string
  content: string
  cover: string
  category: string
  tags: string
  author: string
  date: string
  readTime: number
  featured: boolean
}

const EMPTY_FORM: PostForm = {
  title: '',
  excerpt: '',
  content: '',
  cover: '',
  category: 'Pemrograman',
  tags: '',
  author: 'Rifqi Ardiansyah',
  date: new Date().toISOString().slice(0, 10),
  readTime: 3,
  featured: false,
}

const toForm = (p: BlogPost): PostForm => ({
  title: p.title,
  excerpt: p.excerpt,
  content: p.content,
  cover: p.cover,
  category: p.category,
  tags: p.tags.join('\n'),
  author: p.author,
  date: p.date,
  readTime: p.readTime,
  featured: p.featured,
})

const fromForm = (form: PostForm) => ({
  title: form.title.trim(),
  excerpt: form.excerpt.trim(),
  content: form.content,
  cover: form.cover.trim(),
  category: form.category.trim(),
  author: form.author.trim(),
  date: form.date.trim(),
  readTime: Number(form.readTime) || 1,
  featured: form.featured,
  tags: form.tags
    .split('\n')
    .map((s) => s.trim().replace(/^#/, ''))
    .filter(Boolean),
})

export function AdminBlogPage() {
  const { toast } = useToast()
  const { data, loading, error, refetch } = useFetch<BlogPost[]>('/blog?limit=100')

  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<PostForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = (data ?? []).filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()),
  )

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  const openEdit = (post: BlogPost) => {
    setEditingId(post.id)
    setForm(toForm(post))
    setDialogOpen(true)
  }

  const setField = <K extends keyof PostForm>(field: K) => (value: PostForm[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = fromForm(form)
      if (editingId) {
        await api.put(`/admin/blog/${editingId}`, payload)
        toast('Artikel berhasil diperbarui', 'success')
      } else {
        await api.post('/admin/blog', payload)
        toast('Artikel berhasil ditambahkan', 'success')
      }
      setDialogOpen(false)
      refetch()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Gagal menyimpan artikel', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await api.del(`/admin/blog/${deleteTarget.id}`)
      toast('Artikel dihapus', 'success')
      setDeleteTarget(null)
      refetch()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Gagal menghapus artikel', 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Kelola Blog</h1>
          <p className="mt-1 text-sm text-muted-foreground">Tulis dan kelola artikel blog Anda.</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Artikel Baru
        </Button>
      </div>

      <div className="relative w-full max-w-sm">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari artikel…"
          className="pl-10"
        />
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error} · <button className="underline" onClick={refetch}>Coba lagi</button>
        </div>
      ) : loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-secondary" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <Newspaper className="h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-sm text-muted-foreground">Belum ada artikel.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((post) => (
            <Card key={post.id} className="flex items-center gap-4 p-4">
              <img
                src={post.cover || '/images/placeholder.svg'}
                alt=""
                decoding="async"
                width={1200}
                height={675}
                className="h-16 w-24 shrink-0 rounded-lg border border-border object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate font-display text-sm font-semibold">{post.title}</h3>
                  {post.featured && <Badge variant="accent">Featured</Badge>}
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {post.category} · {post.date} · {post.readTime} menit
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="icon" onClick={() => openEdit(post)} aria-label="Edit">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setDeleteTarget(post)}
                  aria-label="Hapus"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Artikel' : 'Artikel Baru'}</DialogTitle>
            <DialogDescription>Menulis dengan format Markdown didukung.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="b-title">Judul *</Label>
              <Input id="b-title" value={form.title} onChange={(e) => setField('title')(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="b-excerpt">Ringkasan</Label>
              <Textarea
                id="b-excerpt"
                rows={2}
                value={form.excerpt}
                onChange={(e) => setField('excerpt')(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="b-content">Konten (Markdown) *</Label>
              <Textarea
                id="b-content"
                rows={10}
                className="font-mono text-xs"
                value={form.content}
                onChange={(e) => setField('content')(e.target.value)}
                placeholder={'## Judul Bagian\n\nTulis isi artikel di sini…\n\n- poin 1\n- poin 2\n\n```js\nconsole.log("kode")\n```'}
                required
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="b-category">Kategori</Label>
                <Input id="b-category" value={form.category} onChange={(e) => setField('category')(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-date">Tanggal</Label>
                <Input id="b-date" type="date" value={form.date} onChange={(e) => setField('date')(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="b-author">Penulis</Label>
                <Input id="b-author" value={form.author} onChange={(e) => setField('author')(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="b-readtime">Waktu Baca (menit)</Label>
                <Input
                  id="b-readtime"
                  type="number"
                  min={1}
                  value={form.readTime}
                  onChange={(e) => setField('readTime')(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="b-tags">Tag (satu per baris)</Label>
              <Textarea
                id="b-tags"
                rows={2}
                value={form.tags}
                onChange={(e) => setField('tags')(e.target.value)}
                placeholder={'react\nnodejs'}
              />
            </div>
            <ImageUpload value={form.cover} onChange={setField('cover')} label="URL Sampul" />
            <div className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Unggulan</p>
                <p className="text-xs text-muted-foreground">Tampilkan artikel ini sebagai unggulan</p>
              </div>
              <Switch checked={form.featured} onCheckedChange={setField('featured')} />
            </div>
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
        title="Hapus Artikel?"
        description={`Artikel "${deleteTarget?.title}" akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`}
        loading={deleting}
        onConfirm={handleDelete}
      />
    </div>
  )
}
