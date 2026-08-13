// FILE: client/src/pages/ProjectDetailPage.tsx
import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, CheckCircle2, ExternalLink, Github } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { SEO } from '@/components/SEO'
import { Reveal } from '@/components/Reveal'
import { Section, Container } from '@/components/Section'
import { ProjectCard } from '@/components/ProjectCard'
import { ErrorState } from '@/components/State'
import { useLanguage } from '@/contexts/LanguageContext'
import { useFetch } from '@/hooks/useFetch'
import type { Project } from '@/types'

const STATUS_KEYS: Record<string, string> = {
  completed: 'projects.completed',
  'in-progress': 'projects.inProgress',
  draft: 'projects.draft',
}

export function ProjectDetailPage() {
  const { t } = useLanguage()
  const { slug } = useParams<{ slug: string }>()
  const { data: project, loading, error, refetch } = useFetch<Project>(`/projects/${slug}`)
  const { data: allProjects } = useFetch<Project[]>('/projects?limit=100')

  const similar = useMemo(() => {
    if (!project) return []
    return (allProjects ?? [])
      .filter((p) => p.id !== project.id && p.category === project.category)
      .slice(0, 3)
  }, [allProjects, project])

  if (loading) {
    return (
      <Section className="pt-32 md:pt-40">
        <Container>
          <div className="mx-auto max-w-4xl space-y-6">
            <div className="h-8 w-40 animate-pulse rounded-xl bg-secondary" />
            <div className="h-14 w-full animate-pulse rounded-xl bg-secondary" />
            <div className="aspect-[16/9] animate-pulse rounded-2xl bg-secondary" />
            <div className="h-32 w-full animate-pulse rounded-xl bg-secondary" />
          </div>
        </Container>
      </Section>
    )
  }

  if (error || !project) {
    return (
      <Section className="pt-32 md:pt-40">
        <Container>
          <ErrorState message={error || 'Not found'} onRetry={refetch} />
        </Container>
      </Section>
    )
  }

  return (
    <>
      <SEO
        title={project.title}
        description={project.description}
        image={project.image}
        canonicalPath={`/projects/${project.slug}`}
        type="article"
      />

      <Section className="pt-28 md:pt-36">
        <Container className="max-w-5xl">
          <Reveal direction="down" distance={0.6}>
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('common.back')}
            </Link>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Badge>{project.category}</Badge>
              <Badge variant={project.status === 'completed' ? 'success' : 'warning'}>
                {t(STATUS_KEYS[project.status] || 'projects.inProgress')}
              </Badge>
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {project.date}
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.14}>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              {project.title}
            </h1>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
              {project.description}
            </p>
          </Reveal>

          <Reveal delay={0.26}>
            <div className="mt-6 flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <Badge key={tech} variant="secondary">
                  {tech}
                </Badge>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-8 flex flex-wrap gap-3">
              {project.github && (
                <Button asChild variant="outline">
                  <a href={project.github} target="_blank" rel="noopener noreferrer">
                    <Github />
                    {t('common.viewGithub')}
                  </a>
                </Button>
              )}
              {project.demo && project.demo !== '#' && (
                <Button asChild>
                  <a href={project.demo} target="_blank" rel="noopener noreferrer">
                    <ExternalLink />
                    {t('common.liveDemo')}
                  </a>
                </Button>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.36}>
            <motion.div
              className="mt-10 overflow-hidden rounded-2xl border border-border/60 shadow-soft"
              whileHover={{ scale: 1.005 }}
            >
              <img
                src={project.image || '/images/placeholder.svg'}
                alt={project.title}
                decoding="async"
                width={1200}
                height={675}
                className="aspect-video w-full object-cover"
              />
            </motion.div>
          </Reveal>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <Reveal delay={0.1}>
              <Card className="h-full">
                <div className="border-b border-border/60 px-6 py-4">
                  <h2 className="font-display text-lg font-semibold">{t('common.features')}</h2>
                </div>
                <ul className="flex flex-col gap-3 p-6">
                  {project.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>

            <Reveal delay={0.18}>
              <Card className="h-full">
                <div className="border-b border-border/60 px-6 py-4">
                  <h2 className="font-display text-lg font-semibold">{t('common.overview')}</h2>
                </div>
                <div className="flex flex-col gap-3 p-6">
                  <div className="flex justify-between border-b border-border/50 pb-3 text-sm">
                    <span className="text-muted-foreground">{t('common.category')}</span>
                    <span className="font-medium">{project.category}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-3 text-sm">
                    <span className="text-muted-foreground">{t('common.status')}</span>
                    <span className="font-medium">{t(STATUS_KEYS[project.status] || 'projects.inProgress')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('common.date')}</span>
                    <span className="font-medium">{project.date}</span>
                  </div>
                </div>
              </Card>
            </Reveal>
          </div>

          {project.gallery.length > 0 && (
            <Reveal className="mt-10">
              <h2 className="mb-6 font-display text-2xl font-bold">{t('common.details')}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {project.gallery.map((image, index) => (
                  <motion.img
                    key={image + index}
                    src={image}
                    alt={`${project.title} - screenshot ${index + 1}`}
                    loading="lazy"
                    className="w-full rounded-xl border border-border/60 transition-transform duration-300 hover:scale-[1.02]"
                    whileHover={{ y: -4 }}
                  />
                ))}
              </div>
            </Reveal>
          )}

          {similar.length > 0 && (
            <Reveal className="mt-16">
              <h2 className="mb-8 font-display text-2xl font-bold">{t('common.similar')}</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {similar.map((item, index) => (
                  <ProjectCard key={item.id} project={item} index={index} />
                ))}
              </div>
            </Reveal>
          )}
        </Container>
      </Section>
    </>
  )
}
