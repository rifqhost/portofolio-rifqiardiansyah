// FILE: client/src/pages/ProjectsPage.tsx
import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { SEO } from '@/components/SEO'
import { PageHero } from '@/components/PageHero'
import { Section, Container } from '@/components/Section'
import { ProjectCard } from '@/components/ProjectCard'
import { PaginationControls } from '@/components/PaginationControls'
import { EmptyState, ErrorState } from '@/components/State'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useLanguage } from '@/contexts/LanguageContext'
import { useFetch } from '@/hooks/useFetch'
import { usePagination } from '@/hooks/usePagination'
import type { Project } from '@/types'

const PAGE_SIZE = 6

export function ProjectsPage() {
  const { t } = useLanguage()
  const { data, loading, error, refetch } = useFetch<Project[]>('/projects?limit=100')

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [status, setStatus] = useState('all')

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
          p.description.toLowerCase().includes(query) ||
          p.techStack.some((tech) => tech.toLowerCase().includes(query)),
      )
    }
    if (category !== 'all') {
      items = items.filter((p) => p.category === category)
    }
    if (status !== 'all') {
      items = items.filter((p) => p.status === status)
    }
    return items
  }, [data, search, category, status])

  const pagination = usePagination(filtered, PAGE_SIZE)

  const resetPage = () => pagination.setPage(1)

  return (
    <>
      <SEO title={t('nav.projects')} description={t('projects.subtitle')} canonicalPath="/projects" />
      <PageHero eyebrow={t('projects.eyebrow')} title={t('projects.title')} subtitle={t('projects.subtitle')} />

      <Section className="pt-6">
        <Container>
          <div className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="relative sm:col-span-1 lg:col-span-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  resetPage()
                }}
                placeholder={t('projects.searchPlaceholder')}
                className="pl-10"
                aria-label={t('common.search')}
              />
            </div>
            <Select
              value={category}
              onValueChange={(value) => {
                setCategory(value)
                resetPage()
              }}
            >
              <SelectTrigger aria-label={t('common.category')}>
                <SelectValue placeholder={t('common.allCategories')} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? t('common.allCategories') : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value)
                resetPage()
              }}
            >
              <SelectTrigger aria-label={t('common.status')}>
                <SelectValue placeholder={t('common.all')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="completed">{t('projects.completed')}</SelectItem>
                <SelectItem value="in-progress">{t('projects.inProgress')}</SelectItem>
                <SelectItem value="draft">{t('projects.draft')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-96 animate-pulse rounded-2xl bg-secondary" />
              ))}
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : filtered.length === 0 ? (
            <EmptyState title={t('common.noResults')} description={t('common.noData')} />
          ) : (
            <>
              <p className="mb-6 text-sm text-muted-foreground">
                {filtered.length} {t('common.results')}
              </p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {pagination.pageItems.map((project, index) => (
                  <ProjectCard key={project.id} project={project} index={index} />
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
