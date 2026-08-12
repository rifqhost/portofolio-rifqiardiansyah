// FILE: client/src/components/admin/ImageUpload.tsx
import { useRef, useState } from 'react'
import { Loader2, Upload, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { api } from '@/services/api'
import { isImgbbPageLink, resolveImageUrl } from '@/lib/imageUrl'
import type { UploadResult } from '@/types'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  label?: string
}

export function ImageUpload({ value, onChange, label = 'URL Gambar' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [resolving, setResolving] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const result = await api.upload<UploadResult>('/admin/upload', formData)
      if (result.data?.url) {
        onChange(result.data.url)
      } else {
        setError('Gagal mengunggah file')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengunggah file')
    } finally {
      setUploading(false)
    }
  }

  // Saat admin selesai mengisi URL (blur), link halaman ImgBB otomatis
  // dikonversi ke direct image link agar bisa tampil di <img>.
  const handleResolve = async () => {
    const raw = value.trim()
    if (!isImgbbPageLink(raw) || resolving) return
    setResolving(true)
    setError('')
    try {
      const resolved = await resolveImageUrl(raw)
      if (resolved !== raw && resolved) {
        onChange(resolved)
      } else if (isImgbbPageLink(raw)) {
        setError(
          'Gagal mengonversi link ImgBB ke direct link. Coba buka link-nya, klik kanan gambar, salin alamat gambar, lalu tempel URL i.ibb.co.com langsung.',
        )
      }
    } catch {
      setError('Terjadi kesalahan saat mengonversi link ImgBB. Gunakan URL i.ibb.co.com langsung.')
    } finally {
      setResolving(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-end gap-3">
        <div className="flex-1 space-y-1.5">
          <label className="text-sm font-medium text-muted-foreground">{label}</label>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={handleResolve}
            placeholder="/images/nama-foto.jpg atau https://ibb.co.com/…"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="gap-2"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? 'Mengunggah…' : 'Upload Foto'}
        </Button>
      </div>
      {resolving && (
        <p className="text-xs text-muted-foreground">Mengonversi link ImgBB…</p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {value && (
        <div className="relative flex items-center gap-3 rounded-xl border border-border bg-secondary/40 p-3">
          <img src={value} alt="preview" className="h-16 w-24 rounded-lg border border-border object-cover" />
          <span className="truncate font-mono text-xs text-muted-foreground">{value}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="ml-auto h-7 w-7"
            onClick={() => onChange('')}
            aria-label="Hapus gambar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
