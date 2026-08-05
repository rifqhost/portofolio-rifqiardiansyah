// FILE: client/src/pages/admin/AdminSettingsPage.tsx
import { useEffect, useState, type FormEvent } from 'react'
import { KeyRound, Loader2, Save, Settings2 } from 'lucide-react'
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
        </>
      ) : null}
    </div>
  )
}
