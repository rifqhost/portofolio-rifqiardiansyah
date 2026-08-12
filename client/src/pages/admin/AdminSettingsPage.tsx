// FILE: client/src/pages/admin/AdminSettingsPage.tsx
import { useEffect, useState, type FormEvent } from 'react'
import { KeyRound, Loader2, Save, Settings2, Download, Upload, FileJson } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/contexts/ToastContext'
import { useFetch } from '@/hooks/useFetch'
import { api } from '@/services/api'
import type { SiteConfig } from '@/types'

export function AdminSettingsPage() {
  const { toast } = useToast()
  const { data, loading, error, refetch } = useFetch<SiteConfig>('/admin/config')

  const [form, setForm] = useState<SiteConfig | null>(null)
  const [saving, setSaving] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changing, setChanging] = useState(false)

  useEffect(() => {
    if (data && !form) setForm(data)
  }, [data, form])

  const setField = <K extends keyof SiteConfig>(key: K, value: SiteConfig[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  const setFeature = (key: keyof SiteConfig['features'], value: boolean) => {
    setForm((prev) => (prev ? { ...prev, features: { ...prev.features, [key]: value } } : prev))
  }

  const setEmailjs = (key: keyof SiteConfig['emailjs'], value: string) => {
    setForm((prev) => (prev ? { ...prev, emailjs: { ...prev.emailjs, [key]: value } } : prev))
  }

  const handleSave = async () => {
    if (!form) return
    setSaving(true)
    try {
      await api.put('/admin/config', form)
      toast('Pengaturan disimpan', 'success')
      refetch()
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Gagal menyimpan pengaturan', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      toast('Password baru minimal 6 karakter', 'error')
      return
    }
    if (newPassword !== confirmPassword) {
      toast('Konfirmasi password tidak cocok', 'error')
      return
    }
    setChanging(true)
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword })
      toast('Password berhasil diubah', 'success')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Gagal mengubah password', 'error')
    } finally {
      setChanging(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Pengaturan</h1>
          <p className="mt-1 text-sm text-muted-foreground">Konfigurasi situs dan keamanan akun.</p>
        </div>
        <Button onClick={handleSave} disabled={saving || !form} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Simpan Pengaturan
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error} · <button className="underline" onClick={refetch}>Coba lagi</button>
        </div>
      )}

      {loading && !form ? (
        <div className="h-96 animate-pulse rounded-2xl bg-secondary" />
      ) : form ? (
        <>
          <Card>
            <div className="flex items-center gap-3 border-b border-border/60 px-6 py-4">
              <Settings2 className="h-5 w-5 text-primary" />
              <h2 className="font-display text-base font-semibold">Konfigurasi Umum</h2>
            </div>
            <CardContent className="space-y-5 p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cfg-sitename">Nama Situs</Label>
                  <Input id="cfg-sitename" value={form.siteName} onChange={(e) => setField('siteName', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cfg-lang">Bahasa Default</Label>
                  <Select value={form.defaultLang} onValueChange={(value) => setField('defaultLang', value)}>
                    <SelectTrigger id="cfg-lang">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="id">Indonesia</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-border/60 p-4">
                <p className="text-sm font-medium">Fitur</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Penghitung Pengunjung</p>
                    <p className="text-xs text-muted-foreground">Tampilkan jumlah pengunjung di footer.</p>
                  </div>
                  <Switch checked={form.features.visitorCounter} onCheckedChange={(v) => setFeature('visitorCounter', v)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Analitik</p>
                    <p className="text-xs text-muted-foreground">Cadangan untuk layanan analitik nanti.</p>
                  </div>
                  <Switch checked={form.features.analytics} onCheckedChange={(v) => setFeature('analytics', v)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">EmailJS</p>
                    <p className="text-xs text-muted-foreground">Kirim pesan form kontak lewat EmailJS.</p>
                  </div>
                  <Switch checked={form.features.emailjs} onCheckedChange={(v) => setFeature('emailjs', v)} />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">EmailJS</p>
                <div className="grid gap-5 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="ej-service">Service ID</Label>
                    <Input id="ej-service" value={form.emailjs.serviceId} onChange={(e) => setEmailjs('serviceId', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ej-template">Template ID</Label>
                    <Input id="ej-template" value={form.emailjs.templateId} onChange={(e) => setEmailjs('templateId', e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ej-key">Public Key</Label>
                    <Input id="ej-key" value={form.emailjs.publicKey} onChange={(e) => setEmailjs('publicKey', e.target.value)} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <div className="flex items-center gap-3 border-b border-border/60 px-6 py-4">
              <KeyRound className="h-5 w-5 text-primary" />
              <h2 className="font-display text-base font-semibold">Ganti Password</h2>
            </div>
            <CardContent className="p-6">
              <form onSubmit={handleChangePassword} className="grid max-w-md gap-5">
                <div className="space-y-2">
                  <Label htmlFor="pw-current">Password Saat Ini</Label>
                  <Input
                    id="pw-current"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pw-new">Password Baru</Label>
                  <Input
                    id="pw-new"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pw-confirm">Konfirmasi Password Baru</Label>
                  <Input
                    id="pw-confirm"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" variant="outline" disabled={changing} className="w-fit gap-2">
                  {changing && <Loader2 className="h-4 w-4 animate-spin" />}
                  Ubah Password
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <div className="flex items-center gap-3 border-b border-border/60 px-6 py-4">
              <FileJson className="h-5 w-5 text-primary" />
              <h2 className="font-display text-base font-semibold">Backup & Restore Data</h2>
            </div>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">
                Backup semua data portfolio (proyek, blog, profil, sertifikat, dll) ke file JSON.
                Gunakan fitur ini sebelum deploy ulang backend agar data tidak hilang.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const [projects, blog, profile, skills, education, experience, certificates, testimonials, config] =
                        await Promise.all([
                          api.get<any[]>('/projects?limit=1000'),
                          api.get<any[]>('/blog?limit=1000'),
                          api.get<any>('/profile'),
                          api.get<any>('/skills'),
                          api.get<any>('/education'),
                          api.get<any>('/experience'),
                          api.get<any>('/certificates'),
                          api.get<any>('/testimonials'),
                          api.get<any>('/config'),
                        ])
                      const backup = {
                        exportedAt: new Date().toISOString(),
                        data: {
                          projects: projects.data,
                          blog: blog.data,
                          profile: profile.data,
                          skills: skills.data,
                          education: education.data,
                          experience: experience.data,
                          certificates: certificates.data,
                          testimonials: testimonials.data,
                          config: config.data,
                        },
                      }
                      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`
                      a.click()
                      URL.revokeObjectURL(url)
                      toast('Backup berhasil diunduh', 'success')
                    } catch (err) {
                      toast(err instanceof Error ? err.message : 'Gagal membuat backup', 'error')
                    }
                  }}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Backup Semua Data
                </Button>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-secondary">
                  <Upload className="h-4 w-4" />
                  Restore dari Backup
                  <input
                    type="file"
                    accept="application/json"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      try {
                        const text = await file.text()
                        const backup = JSON.parse(text)
                        if (!backup.data) throw new Error('Format backup tidak valid')
                        const data = backup.data
                        if (data.projects) await api.put('/admin/config', { projects: data.projects })
                        if (data.blog) await api.put('/admin/config', { blog: data.blog })
                        if (data.profile) await api.put('/admin/profile', data.profile)
                        if (data.skills) await api.put('/admin/certificates', { ...data.skills, items: [] })
                        if (data.education) await api.put('/admin/certificates', { ...data.education, items: [] })
                        if (data.experience) await api.put('/admin/certificates', { ...data.experience, items: [] })
                        if (data.certificates) await api.put('/admin/certificates', data.certificates)
                        if (data.testimonials) await api.put('/admin/certificates', { ...data.testimonials, items: [] })
                        if (data.config) await api.put('/admin/config', data.config)
                        toast('Data berhasil dipulihkan. Refresh halaman untuk melihat perubahan.', 'success')
                        setTimeout(() => window.location.reload(), 1500)
                      } catch (err) {
                        toast(err instanceof Error ? err.message : 'Gagal memulihkan data', 'error')
                      }
                    }}
                  />
                </label>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}
