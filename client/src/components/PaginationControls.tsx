// FILE: client/src/components/PaginationControls.tsx
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils'

interface PaginationControlsProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

export function PaginationControls({ page, totalPages, onChange }: PaginationControlsProps) {
  const { t } = useLanguage()

  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav className="mt-12 flex items-center justify-center gap-1.5" aria-label={t('common.page')}>
      <Button
        variant="outline"
        size="icon"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label={t('common.prev')}
      >
        <ChevronLeft />
      </Button>
      {pages.map((p) => (
        <Button
          key={p}
          variant={p === page ? 'default' : 'outline'}
          size="icon"
          onClick={() => onChange(p)}
          aria-current={p === page ? 'page' : undefined}
          className={cn('hidden sm:inline-flex', p === page && 'inline-flex')}
        >
          {p}
        </Button>
      ))}
      <Button
        variant="outline"
        size="icon"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        aria-label={t('common.next')}
      >
        <ChevronRight />
      </Button>
    </nav>
  )
}
