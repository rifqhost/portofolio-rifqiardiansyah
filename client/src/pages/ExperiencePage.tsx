// FILE: client/src/pages/ExperiencePage.tsx
import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import { SEO } from '@/components/SEO'
import { PageHero } from '@/components/PageHero'
import { Reveal } from '@/components/Reveal'
import { Section, Container } from '@/components/Section'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ErrorState } from '@/components/State'
import { useLanguage } from '@/contexts/LanguageContext'
import { useFetch } from '@/hooks/useFetch'
import { cn } from '@/lib/utils'
import type { Experience } from '@/types'

function ExperienceItem({ item, index, isLast }: { item: Experience; index: number; isLast: boolean }) {
  return (
    <div className="relative flex gap-6">
      <div className="flex flex-col items-center">
        <motion.span
          className={cn(
            'relative z-10 mt-1.5 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-background',
            item.current
              ? 'bg-accent shadow-[0_0_0_4px_rgba(var(--accent),0.15)]'
              : 'bg-primary',
          )}
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', delay: 0.2 + index * 0.08 }}
        >
          {item.current && (
            <span className="absolute h-8 w-8 animate-ping rounded-full bg-accent/30" />
          )}
        </motion.span>
        {!isLast && (
          <motion.span
            className="mt-2 w-px flex-1 bg-gradient-to-b from-border to-border/30"
            initial={{ height: 0 }}
            whileInView={{ height: '100%' }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 + index * 0.08 }}
          />
        )}
      </div>

      <div className="pb-10">
        <Reveal delay={0.1 + index * 0.05}>
          <Card className="group relative h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/40">
            <div className="flex flex-wrap items-center gap-2 pb-3">
              <span className="font-mono text-xs text-primary">{item.period}</span>
              {item.current && <Badge variant="success">Current</Badge>}
              <Badge variant="secondary">{item.type}</Badge>
            </div>
            <h3 className="font-display text-lg font-semibold">{item.role}</h3>
            <p className="mt-1 flex items-center gap-2 text-sm font-medium text-primary">
              {item.company}
              {item.location && (
                <span className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {item.location}
                </span>
              )}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            {item.skills.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {item.skills.map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
          </Card>
        </Reveal>
      </div>
    </div>
  )
}

export function ExperiencePage() {
  const { t } = useLanguage()
  const { data, loading, error, refetch } = useFetch<Experience[]>('/experience')

  return (
    <>
      <SEO
        title={t('nav.experience')}
        description={t('experience.subtitle')}
        canonicalPath="/experience"
      />
      <PageHero eyebrow={t('experience.eyebrow')} title={t('experience.title')} subtitle={t('experience.subtitle')} />

      <Section className="pt-6">
        <Container className="max-w-4xl">
          {error && <ErrorState message={error} onRetry={refetch} />}
          {loading && (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-40 animate-pulse rounded-2xl bg-secondary" />
              ))}
            </div>
          )}
          {!loading && !error && (
            <div>
              {(data ?? []).map((item, index) => (
                <ExperienceItem
                  key={item.id}
                  item={item}
                  index={index}
                  isLast={index === (data?.length ?? 0) - 1}
                />
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  )
}
