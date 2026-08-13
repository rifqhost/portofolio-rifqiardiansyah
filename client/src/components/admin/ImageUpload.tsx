// FILE: client/src/components/admin/ImageUpload.tsx
import { useRef, useEffect, useState } from 'react'
import { ImagePlus, Loader2, Plus, X } from 'lucide-react'
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

export function ImageUpload({ value, onChange, label = 'Foto Utama' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<string>('')
  const [preview, setPreview] = useState('')
  const [uploading, setUploading] = useState(false)
  const [resolving, setResolving] = useState(false)
  const [error, setError] = useState('')
  const [draftUrl, setDraftUrl] = useState('')

  useEffect(() => {
    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (value && previewRef.current) {
      URL.revokeObjectURL(previewRef.current)
      previewRef.current = ''
      setPreview('')
    }
  }, [value])

  const addUrl = async (url: string) => {
    const trimmed = url.trim()
    if (!trimmed) return
    if (isImgbbPageLink(trimmed)) {
      setResolving(true)
      setError('')
      try {
        const resolved = await resolveImageUrl(trimmed)
        if (resolved !== trimmed && resolved) {
          onChange(resolved)
        } else {
          onChange(trimmed)
        }
      } catch {
        onChange(trimmed)
      } finally {
        setResolving(false)
      }
    } else {
      onChange(trimmed)
    }
    setDraftUrl('')
  }

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    const result = await api.upload<UploadResult>('/admin/upload', formData)
    if (result.data?.url) {
      return result.data.url
    }
    throw new Error('Gagal mengunggah file')
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current)
    }

    const objectUrl = URL.createObjectURL(file)
    previewRef.current = objectUrl
    setPreview(objectUrl)

    setUploading(true)
    setError('')
    try {
      const url = await uploadFile(file)
      onChange(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengunggah file')
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current)
        previewRef.current = ''
        setPreview('')
      }
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    onChange('')
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current)
      previewRef.current = ''
      setPreview('')
    }
  }

  const displaySrc = preview || value

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>

      {displaySrc && (
        <div className="group relative">
          <img
            src={displaySrc}
            alt="Foto utama"
            decoding="async"
            width={1200}
            height={675}
            className="max-h-64 w-full rounded-lg border border-border object-cover"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute -right-1.5 -top-1.5 h-6 w-6 rounded-full bg-background text-destructive shadow-sm hover:bg-destructive hover:text-destructive-foreground"
            onClick={handleRemove}
            aria-label="Hapus foto utama"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {!displaySrc && (
        <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
          Belum ada foto
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
        onChange={handleFileChange}
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
