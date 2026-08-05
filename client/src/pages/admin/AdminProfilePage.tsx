// FILE: client/src/pages/admin/AdminProfilePage.tsx
import { useEffect, useState, type FormEvent } from 'react'
import { Loader2, Save } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ImageUpload } from '@/components/admin/ImageUpload'
import { useToast } from '@/contexts/ToastContext'
import { useFetch } from '@/hooks/useFetch'
import { api } from '@/services/api'
import type { Profile } from '@/types'

type Draft = Omit<Profile, 'highlights' | 'seo'> & {
  highlights: Profile['highlights']
  seo: Profile['seo']
}

export function AdminProfilePage() {
  const { toast } = useToast()
  const { data, loading, error, refetch } = useFetch<Profile>('/profile')
  const [form, setForm] = useState<Draft | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (data) setForm(data)
  }, [data])

  if (loading && !form) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold">Kelola Profil</h1>
        <div className="h-96 animate-pulse rounded-2xl bg-secondary" />
      </div>
    )
  }

  if (error && !form) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {error} · <button className="underline" onClick={refetch}>Coba lagi</button>
      </div>
    )
  }

  if (!form) return null

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  const setNested = <K extends 'personalInfo' | 'socials' | 'stats'>(
    key: K,
    field: string,
    value: string,
  ) => {
    setForm((prev) => {
      if (!prev) return prev
      const section = prev[key] as Record<string, unknown>
      return { ...prev, [key]: { ...section, [field]: value } }
    })
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put('/admin/profile', form)
      toast('Profil berhasil disimpan', 'success')
      refetch()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Gagal menyimpan profil', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Kelola Profil</h1>
          <p className="mt-1 text-sm text-muted-foreground">Perbarui informasi pribadi yang tampil di situs.</p>
        </div>
        <Button type="submit" form="profile-form" disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Simpan Perubahan
        </Button>
      </div>

      <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="basic">
          <TabsList>
            <TabsTrigger value="basic">Informasi Dasar</TabsTrigger>
            <TabsTrigger value="personal">Info Pribadi</TabsTrigger>
            <TabsTrigger value="socials">Media Sosial</TabsTrigger>
            <TabsTrigger value="stats">Statistik</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-5 pt-4">
            <Card>
              <CardContent className="space-y-5 p-6">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="pf-name">Nama Lengkap</Label>
                    <Input id="pf-name" value={form.name} onChange={(e) => set('name', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pf-short">Nama Singkat</Label>
                    <Input id="pf-short" value={form.shortName} onChange={(e) => set('shortName', e.target.value)} />
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="pf-initials">Inisial</Label>
                    <Input id="pf-initials" value={form.initials} onChange={(e) => set('initials', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pf-role">Peran Utama</Label>
                    <Input id="pf-role" value={form.role} onChange={(e) => set('role', e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pf-status">Status</Label>
                  <Input id="pf-status" value={form.status} onChange={(e) => set('status', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pf-tagline">Tagline</Label>
                  <Textarea id="pf-tagline" rows={2} value={form.tagline} onChange={(e) => set('tagline', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pf-about">Tentang Saya (paragraf dipisah baris kosong)</Label>
                  <Textarea
                    id="pf-about"
                    rows={6}
                    value={form.about.join('\n\n')}
                    onChange={(e) => set('about', e.target.value.split(/\n\s*\n/))}
                  />
                </div>
                <ImageUpload value={form.avatar} onChange={(url) => set('avatar', url)} label="URL Avatar" />
                <div className="space-y-2">
                  <Label htmlFor="pf-cv">URL CV</Label>
                  <Input id="pf-cv" value={form.cv} onChange={(e) => set('cv', e.target.value)} placeholder="/uploads/cv-rifqi-ardiansyah.pdf" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="personal" className="space-y-5 pt-4">
            <Card>
              <CardContent className="grid gap-5 p-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pi-fullname">Nama Lengkap</Label>
                  <Input id="pi-fullname" value={form.personalInfo.fullName} onChange={(e) => setNested('personalInfo', 'fullName', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pi-role">Peran</Label>
                  <Input id="pi-role" value={form.personalInfo.role} onChange={(e) => setNested('personalInfo', 'role', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pi-status">Status</Label>
                  <Input id="pi-status" value={form.personalInfo.status} onChange={(e) => setNested('personalInfo', 'status', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pi-location">Lokasi</Label>
                  <Input id="pi-location" value={form.personalInfo.location} onChange={(e) => setNested('personalInfo', 'location', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pi-email">Email</Label>
                  <Input id="pi-email" type="email" value={form.personalInfo.email} onChange={(e) => setNested('personalInfo', 'email', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pi-education">Pendidikan</Label>
                  <Input id="pi-education" value={form.personalInfo.education} onChange={(e) => setNested('personalInfo', 'education', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pi-languages">Bahasa</Label>
                  <Input id="pi-languages" value={form.personalInfo.languages} onChange={(e) => setNested('personalInfo', 'languages', e.target.value)} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="socials" className="space-y-5 pt-4">
            <Card>
              <CardContent className="grid gap-5 p-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="so-github">GitHub</Label>
                  <Input id="so-github" value={form.socials.github} onChange={(e) => setNested('socials', 'github', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="so-linkedin">LinkedIn</Label>
                  <Input id="so-linkedin" value={form.socials.linkedin} onChange={(e) => setNested('socials', 'linkedin', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="so-whatsapp">WhatsApp</Label>
                  <Input id="so-whatsapp" value={form.socials.whatsapp} onChange={(e) => setNested('socials', 'whatsapp', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="so-email">Email</Label>
                  <Input id="so-email" type="email" value={form.socials.email} onChange={(e) => setNested('socials', 'email', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="so-discord">Discord</Label>
                  <Input id="so-discord" value={form.socials.discord} onChange={(e) => setNested('socials', 'discord', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="so-instagram">Instagram</Label>
                  <Input id="so-instagram" value={form.socials.instagram} onChange={(e) => setNested('socials', 'instagram', e.target.value)} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-5 pt-4">
            <Card>
              <CardContent className="grid gap-5 p-6 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="st-projects">Proyek</Label>
                  <Input id="st-projects" type="number" value={form.stats.projects} onChange={(e) => setNested('stats', 'projects', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="st-tech">Tech Stack</Label>
                  <Input id="st-tech" type="number" value={form.stats.techStack} onChange={(e) => setNested('stats', 'techStack', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="st-github">GitHub</Label>
                  <Input id="st-github" type="number" value={form.stats.github} onChange={(e) => setNested('stats', 'github', e.target.value)} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-5 pt-4">
            <Card>
              <CardContent className="space-y-5 p-6">
                <div className="space-y-2">
                  <Label htmlFor="seo-title">Judul SEO</Label>
                  <Input id="seo-title" value={form.seo.title} onChange={(e) => set('seo', { ...form.seo, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seo-desc">Deskripsi SEO</Label>
                  <Textarea id="seo-desc" rows={3} value={form.seo.description} onChange={(e) => set('seo', { ...form.seo, description: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seo-keywords">Keywords SEO</Label>
                  <Input id="seo-keywords" value={form.seo.keywords} onChange={(e) => set('seo', { ...form.seo, keywords: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seo-url">URL</Label>
                  <Input id="seo-url" value={form.seo.url} onChange={(e) => set('seo', { ...form.seo, url: e.target.value })} />
                </div>
                <ImageUpload value={form.seo.ogImage} onChange={(url) => set('seo', { ...form.seo, ogImage: url })} label="URL Gambar OG" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  )
}
