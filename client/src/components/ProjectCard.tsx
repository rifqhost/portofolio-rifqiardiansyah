// FILE: client/src/components/ProjectCard.tsx
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, ExternalLink, Github } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/contexts/LanguageContext'
import type { Project } from '@/types'

const STATUS_KEYS: Record<string, string> = {
  completed: 'projects.completed',
  'in-progress': 'projects.inProgress',
  draft: 'projects.draft',
}

interface ProjectCardProps {
  project: Project
  index?: number
}

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const { t } = useLanguage()
  const statusKey = STATUS_KEYS[project.status] || 'projects.inProgress'

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="group relative flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-card-hover">
        <Link to={`/projects/${project.slug}`} className="flex-1" aria-label={project.title}>
          <div className="relative aspect-[16/10] overflow-hidden">
            <img
              src={project.image || '/images/placeholder.svg'}
              alt={project.title}
              loading="lazy"
              decoding="async"
              width={1200}
              height={675}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="absolute left-3 top-3 flex gap-2">
              <Badge variant="outline" className="border-white/20 bg-black/40 text-white backdrop-blur">
                {project.category}
              </Badge>
            </div>
          </div>

          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-lg font-semibold transition-colors group-hover:text-primary">
                {project.title}
              </h3>
              <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
            </div>
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {project.description}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-1.5">
              {project.techStack.slice(0, 4).map((tech) => (
                <span
                  key={tech}
                  className="rounded-md bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground"
                >
                  {tech}
                </span>
              ))}
              {project.techStack.length > 4 && (
                <span className="text-[11px] text-muted-foreground">
                  +{project.techStack.length - 4}
                </span>
              )}
            </div>
          </CardContent>
        </Link>

        <div className="flex items-center gap-2 border-t border-border/60 px-5 py-3.5">
          <Badge variant={project.status === 'completed' ? 'success' : 'warning'}>
            {t(statusKey)}
          </Badge>
          <div className="ml-auto flex items-center gap-1">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} GitHub repository`}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Github className="h-4 w-4" />
              </a>
            )}
            {project.demo && project.demo !== '#' && (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} live demo`}
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </Card>
    </motion.article>
  )
}
