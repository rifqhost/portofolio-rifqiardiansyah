// FILE: client/src/components/admin/GalleryUpload.tsx
import { useRef, useState } from 'react'
import { ImagePlus, Loader2, Plus, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { api } from '@/services/api'
import { isImgbbPageLink, resolveImageUrl } from '@/lib/imageUrl'
import type { UploadResult } from '@/types'

interface GalleryUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
  label?: string
}

export function GalleryUpload({ value, onChange, label = 'Galeri Foto' }: GalleryUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [draftUrl, setDraftUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const [resolving, setResolving] = useState(false)

  const addUrl = async (url: string) => {
    const trimmed = url.trim()
    if (!trimmed) return
    if (isImgbbPageLink(trimmed)) {
      setResolving(true)
      setError('')
      try {
        const resolved = await resolveImageUrl(trimmed)
        if (resolved !== trimmed && resolved) {
          onChange([...value, resolved])
        } else {
          onChange([...value, trimmed])
        }
      } catch {
        onChange([...value, trimmed])
      } finally {
        setResolving(false)
      }
    } else {
      onChange([...value, trimmed])
    }
    setDraftUrl('')
  }

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const result = await api.upload<UploadResult>('/admin/upload', formData)
      if (result.data?.url) {
        onChange([...value, result.data.url])
      } else {
        setError('Gagal mengunggah file')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengunggah file')
    } finally {
      setUploading(false)
    }
  }

  const removeUrl = (target: string) => {
    onChange(value.filter((url) => url !== target))
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>

      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {value.map((url, index) => (
            <div key={`${url}-${index}`} className="group relative">
              <img
                src={url}
                alt={`Galeri ${index + 1}`}
                className="w-full rounded-lg border border-border"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute -right-1.5 -top-1.5 h-6 w-6 rounded-full bg-background text-destructive shadow-sm hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => removeUrl(url)}
                aria-label={`Hapus gambar ${index + 1}`}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Input
            value={draftUrl}
            onChange={(e) => setDraftUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addUrl(draftUrl)
              }
            }}
            placeholder="Tempel URL gambar lalu Enter"
          />
          <Button type="button" variant="outline" size="icon" onClick={() => addUrl(draftUrl)} disabled={!draftUrl.trim()} aria-label="Tambah dari URL">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="gap-2"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          {uploading ? 'Mengunggah…' : 'Upload Foto'}
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {resolving && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Mengonversi link ImgBB…
        </div>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
