// FILE: client/src/pages/admin/AdminCertificatesPage.tsx
import { useEffect, useState, type FormEvent } from 'react'
import { Award, ExternalLink, Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import type { Certificate, Certificates } from '@/types'

interface CertForm {
  title: string
  issuer: string
  date: string
  credentialUrl: string
  image: string
}

const EMPTY_FORM: CertForm = {
  title: '',
  issuer: '',
  date: new Date().toISOString().slice(0, 10),
  credentialUrl: '',
  image: '',
}

export function AdminCertificatesPage() {
  const { toast } = useToast()
  const { data, loading, error, refetch } = useFetch<Certificates>('/admin/certificates')

  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [comingSoon, setComingSoon] = useState(false)
  const [items, setItems] = useState<Certificate[]>([])

  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [form, setForm] = useState<CertForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Certificate | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (data) {
      setTitle(data.title ?? '')
      setSubtitle(data.subtitle ?? '')
      setComingSoon(Boolean(data.comingSoon))
      setItems(data.items ?? [])
    }
  }, [data])

  const filtered = items.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()),
  )

  const openCreate = () => {
    setEditingIndex(null)
    setForm(EMPTY_FORM)
    setDialogOpen(true)
  }

  const openEdit = (certificate: Certificate, index: number) => {
    setEditingIndex(index)
    setForm({
      title: certificate.title,
      issuer: certificate.issuer,
      date: certificate.date,
      credentialUrl: certificate.credentialUrl ?? '',
      image: certificate.image ?? '',
    })
    setDialogOpen(true)
  }

  const setField = (field: keyof CertForm) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const persistItems = async (nextItems: Certificate[]) => {
    if (!data) return
    await api.put('/admin/certificates', { ...data, items: nextItems })
  }

  const handleSaveMeta = async () => {
    if (!data) return
    setSaving(true)
    try {
      await api.put('/admin/certificates', { ...data, title, subtitle, comingSoon, items })
      toast('Pengaturan sertifikat disimpan', 'success')
      refetch()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Gagal menyimpan pengaturan', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmitItem = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!data) return
    setSaving(true)
    try {
      const next = [...items]
      const payload: Certificate = {
        id: editingIndex !== null ? items[editingIndex].id : `c-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
        title: form.title.trim(),
        issuer: form.issuer.trim(),
        date: form.date.trim(),
        credentialUrl: form.credentialUrl.trim() || undefined,
        image: form.image.trim() || undefined,
      }
      if (editingIndex !== null) next[editingIndex] = payload
      else next.push(payload)

      await persistItems(next)
      setItems(next)
      toast(editingIndex !== null ? 'Sertifikat diperbarui' : 'Sertifikat ditambahkan', 'success')
      setDialogOpen(false)
      refetch()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Gagal menyimpan sertifikat', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget || !data) return
    setDeleting(true)
    try {
      const next = items.filter((c) => c.id !== deleteTarget.id)
      await persistItems(next)
      setItems(next)
      toast('Sertifikat dihapus', 'success')
      setDeleteTarget(null)
      refetch()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Gagal menghapus sertifikat', 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Kelola Sertifikat</h1>
          <p className="mt-1 text-sm text-muted-foreground">Tambah, edit, dan hapus sertifikat portfolio.</p>
        </div>
        <Button onClick={openCreate} className="gap-2" disabled={loading}>
          <Plus className="h-4 w-4" />
          Tambah Sertifikat
        </Button>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error} · <button className="underline" onClick={refetch}>Coba lagi</button>
        </div>
      ) : loading ? (
        <div className="h-96 animate-pulse rounded-2xl bg-secondary" />
      ) : (
        <>
          <Card>
            <div className="flex items-center gap-3 border-b border-border/60 px-6 py-4">
              <Award className="h-5 w-5 text-primary" />
              <h2 className="font-display text-base font-semibold">Pengaturan Halaman</h2>
            </div>
            <CardContent className="space-y-5 p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cf-title">Judul Halaman</Label>
                  <Input id="cf-title" value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cf-subtitle">Subjudul</Label>
                  <Input id="cf-subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/60 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Mode "Segera Hadir"</p>
                  <p className="text-xs text-muted-foreground">
                    Aktif: tampilkan pesan coming soon. Nonaktif: tampilkan daftar sertifikat.
                  </p>
                </div>
                <Switch checked={comingSoon} onCheckedChange={setComingSoon} />
              </div>
              <Button onClick={handleSaveMeta} disabled={saving} className="gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Simpan Pengaturan
              </Button>
            </CardContent>
          </Card>

          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari sertifikat…"
              className="pl-10"
            />
          </div>

          {filtered.length === 0 ? (
            <Card className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <Award className="h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm text-muted-foreground">Belum ada sertifikat.</p>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((certificate, index) => (
                <Card key={certificate.id} className="overflow-hidden">
                  {certificate.image ? (
                    <div className="aspect-[16/9] overflow-hidden bg-secondary/50">
                      <img src={certificate.image} alt={certificate.title} decoding="async" width={1200} height={675} className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-primary/15 to-accent/10">
                      <Award className="h-12 w-12 text-primary" />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="truncate font-display text-sm font-semibold">{certificate.title}</h3>
                    <p className="mt-1 text-sm font-medium text-primary">{certificate.issuer}</p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">{certificate.date}</p>
                    <div className="mt-4 flex items-center justify-between">
                      {certificate.credentialUrl ? (
                        <Badge variant="secondary" className="gap-1">
                          <ExternalLink className="h-3 w-3" />
                          Kredensial
                        </Badge>
                      ) : (
                        <span />
                      )}
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(certificate, index)} aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setDeleteTarget(certificate)}
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
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>{editingIndex !== null ? 'Edit Sertifikat' : 'Tambah Sertifikat'}</DialogTitle>
                <DialogDescription>Lengkapi informasi sertifikat di bawah ini.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitItem} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="c-title">Judul Sertifikat *</Label>
                  <Input id="c-title" value={form.title} onChange={(e) => setField('title')(e.target.value)} placeholder="e.g. JavaScript Algorithms and Data Structures" required />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="c-issuer">Penerbit *</Label>
                    <Input id="c-issuer" value={form.issuer} onChange={(e) => setField('issuer')(e.target.value)} placeholder="e.g. freeCodeCamp" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="c-date">Tanggal</Label>
                    <Input id="c-date" type="date" value={form.date} onChange={(e) => setField('date')(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-url">Link Kredensial</Label>
                  <Input id="c-url" value={form.credentialUrl} onChange={(e) => setField('credentialUrl')(e.target.value)} placeholder="https://…" />
                </div>
                <ImageUpload value={form.image} onChange={setField('image')} label="Foto Sertifikat" />
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
            title="Hapus Sertifikat?"
            description={`Sertifikat "${deleteTarget?.title}" akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`}
            loading={deleting}
            onConfirm={handleDelete}
          />
        </>
      )}
    </div>
  )
}
