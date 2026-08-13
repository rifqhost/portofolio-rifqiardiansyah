// FILE: client/src/components/admin/GalleryUpload.tsx
import { useRef, useEffect, useState } from 'react'
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

interface PreviewItem {
  id: string
  src: string
  file?: File
}

export function GalleryUpload({ value, onChange, label = 'Galeri Foto' }: GalleryUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const previewsRef = useRef<PreviewItem[]>([])
  const [previews, setPreviews] = useState<PreviewItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [draftUrl, setDraftUrl] = useState('')
  const [resolving, setResolving] = useState(false)

  useEffect(() => {
    return () => {
      previewsRef.current.forEach((p) => URL.revokeObjectURL(p.src))
    }
  }, [])

  const refreshPreviews = (updater: PreviewItem[] | ((prev: PreviewItem[]) => PreviewItem[])) => {
    const next = typeof updater === 'function' ? updater(previewsRef.current) : updater
    setPreviews(next)
    previewsRef.current = next
  }

  const addUrl = async (url: string) => {
    const trimmed = url.trim()
    if (!trimmed) return
    if (isImgbbPageLink(trimmed)) {
      setResolving(true)
      setError('')
      try {
        const resolved = await resolveImageUrl(trimmed)
        onChange([...value, resolved !== trimmed && resolved ? resolved : trimmed])
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

    const objectUrl = URL.createObjectURL(file)
    const previewItem: PreviewItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      src: objectUrl,
      file,
    }

    const nextPreviews = [...previewsRef.current, previewItem]
    refreshPreviews(nextPreviews)

    setUploading(true)
    setError('')
    try {
      const url = await uploadFile(file)
      onChange([...value, url])
      refreshPreviews((prev) => prev.filter((p) => p.id !== previewItem.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengunggah file')
      refreshPreviews((prev) => prev.filter((p) => p.id !== previewItem.id))
      URL.revokeObjectURL(objectUrl)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const removeUrl = (target: string) => {
    onChange(value.filter((url) => url !== target))
  }

  const removePreview = (id: string) => {
    const item = previewsRef.current.find((p) => p.id === id)
    if (item) {
      URL.revokeObjectURL(item.src)
    }
    refreshPreviews((prev) => prev.filter((p) => p.id !== id))
  }

  const displayItems = [
    ...value.map((url, index) => ({ id: `saved-${index}`, src: url, saved: true })),
    ...previews.map((p) => ({ id: p.id, src: p.src, saved: false })),
  ]

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>

      {displayItems.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {displayItems.map((item) => (
            <div key={item.id} className="group relative">
              <img
                src={item.src}
                alt={item.saved ? `Galeri ${item.id.split('-')[1]}` : 'Mengunggah...'}
                decoding="async"
                width={1200}
                height={675}
                className="aspect-video w-full rounded-lg border border-border object-cover"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute -right-1.5 -top-1.5 h-6 w-6 rounded-full bg-background text-destructive shadow-sm hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => (item.saved ? removeUrl(item.src) : removePreview(item.id))}
                aria-label="Hapus gambar"
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
