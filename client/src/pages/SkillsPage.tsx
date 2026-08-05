// FILE: client/src/pages/SkillsPage.tsx
import { motion } from 'framer-motion'
import { SEO } from '@/components/SEO'
import { PageHero } from '@/components/PageHero'
import { Reveal } from '@/components/Reveal'
import { Section, SectionHeader, Container } from '@/components/Section'
import { Card, CardContent } from '@/components/ui/card'
import { ErrorState } from '@/components/State'
import { getIcon } from '@/lib/icons'
import { useLanguage } from '@/contexts/LanguageContext'
import { useFetch } from '@/hooks/useFetch'
import type { Skill, Skills } from '@/types'

function SkillCard({ skill, index, delay }: { skill: Skill; index: number; delay: number }) {
  const Icon = getIcon(skill.icon)

  return (
    <Reveal delay={delay}>
      <Card className="group h-full transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-card-hover">
        <CardContent className="flex flex-col gap-4 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-display text-sm font-semibold">{skill.name}</h3>
              <p className="font-mono text-[11px] text-muted-foreground">{skill.level}%</p>
            </div>
          </div>
          <div
            className="h-1.5 overflow-hidden rounded-full bg-secondary"
            role="progressbar"
            aria-valuenow={skill.level}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${skill.name} ${skill.level}%`}
          >
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
              initial={{ width: 0 }}
              whileInView={{ width: `${skill.level}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.2 + index * 0.05, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </CardContent>
      </Card>
    </Reveal>
  )
}

function SkillGroup({
  title,
  skills,
  index,
}: {
  title: string
  skills: Skill[]
  index: number
}) {
  if (!skills.length) return null

  return (
    <div>
      <SectionHeader
        align="left"
        title={title}
        className="mb-8 md:mb-10"
        eyebrow={`0${index + 1}`}
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {skills.map((skill, i) => (
          <SkillCard key={skill.name} skill={skill} index={i} delay={i * 0.06} />
        ))}
      </div>
    </div>
  )
}

export function SkillsPage() {
  const { t } = useLanguage()
  const { data, loading, error, refetch } = useFetch<Skills>('/skills')

  return (
    <>
      <SEO
        title={t('nav.skills')}
        description={t('skills.subtitle')}
        canonicalPath="/skills"
      />
      <PageHero eyebrow={t('skills.eyebrow')} title={t('skills.title')} subtitle={t('skills.subtitle')} />

      <Section className="pt-6">
        <Container className="flex flex-col gap-16">
          {error && <ErrorState message={error} onRetry={refetch} />}
          {loading && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-2xl bg-secondary" />
              ))}
            </div>
          )}
          {!loading && !error && (
            <>
              <SkillGroup title={t('skills.frontend')} skills={data?.frontend ?? []} index={0} />
              <SkillGroup title={t('skills.backend')} skills={data?.backend ?? []} index={1} />
              <SkillGroup title={t('skills.tools')} skills={data?.tools ?? []} index={2} />
            </>
          )}
        </Container>
      </Section>
    </>
  )
}
