// FILE: client/src/pages/BlogPage.tsx
import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { SEO } from '@/components/SEO'
import { PageHero } from '@/components/PageHero'
import { Section, Container } from '@/components/Section'
import { BlogCard } from '@/components/BlogCard'
import { PaginationControls } from '@/components/PaginationControls'
import { EmptyState, ErrorState } from '@/components/State'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/LanguageContext'
import { useFetch } from '@/hooks/useFetch'
import { usePagination } from '@/hooks/usePagination'
import { cn } from '@/lib/utils'
import type { BlogPost } from '@/types'

const PAGE_SIZE = 6

export function BlogPage() {
  const { t } = useLanguage()
  const { data, loading, error, refetch } = useFetch<BlogPost[]>('/blog?limit=100')

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  const categories = useMemo(
    () => ['all', ...Array.from(new Set((data ?? []).map((p) => p.category)))],
    [data],
  )

  const filtered = useMemo(() => {
    let items = data ?? []
    const query = search.trim().toLowerCase()
    if (query) {
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.excerpt.toLowerCase().includes(query) ||
          p.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }
    if (category !== 'all') {
      items = items.filter((p) => p.category === category)
    }
    return items
  }, [data, search, category])

  const pagination = usePagination(filtered, PAGE_SIZE)

  return (
    <>
      <SEO title={t('nav.blog')} description={t('blog.subtitle')} canonicalPath="/blog" />
      <PageHero eyebrow={t('blog.eyebrow')} title={t('blog.title')} subtitle={t('blog.subtitle')} />

      <Section className="pt-6">
        <Container>
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={category === cat ? 'default' : 'outline'}
                  size="sm"
                  className={cn('rounded-full', category === cat && 'shadow-soft')}
                  onClick={() => {
                    setCategory(cat)
                    pagination.setPage(1)
                  }}
                >
                  {cat === 'all' ? t('common.all') : cat}
                </Button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  pagination.setPage(1)
                }}
                placeholder={t('blog.searchPlaceholder')}
                className="pl-10"
                aria-label={t('common.search')}
              />
            </div>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-2xl bg-secondary" />
              ))}
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : filtered.length === 0 ? (
            <EmptyState title={t('common.noResults')} description={t('common.noData')} />
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {pagination.pageItems.map((post, index) => (
                  <BlogCard key={post.id} post={post} index={index} />
                ))}
              </div>
              <PaginationControls
                page={pagination.page}
                totalPages={pagination.totalPages}
                onChange={pagination.setPage}
              />
            </>
          )}
        </Container>
      </Section>
    </>
  )
}
