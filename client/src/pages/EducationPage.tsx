// FILE: client/src/pages/EducationPage.tsx
import { GraduationCap, Award, MapPin } from 'lucide-react'
import { SEO } from '@/components/SEO'
import { PageHero } from '@/components/PageHero'
import { Reveal } from '@/components/Reveal'
import { Section, Container } from '@/components/Section'
import { Card, CardContent } from '@/components/ui/card'
import { ErrorState } from '@/components/State'
import { useLanguage } from '@/contexts/LanguageContext'
import { useFetch } from '@/hooks/useFetch'
import type { Education } from '@/types'

export function EducationPage() {
  const { t } = useLanguage()
  const { data, loading, error, refetch } = useFetch<Education[]>('/education')

  return (
    <>
      <SEO
        title={t('nav.education')}
        description={t('education.subtitle')}
        canonicalPath="/education"
      />
      <PageHero eyebrow={t('education.eyebrow')} title={t('education.title')} subtitle={t('education.subtitle')} />

      <Section className="pt-6">
        <Container className="max-w-4xl">
          {error && <ErrorState message={error} onRetry={refetch} />}
          {loading && (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-44 animate-pulse rounded-2xl bg-secondary" />
              ))}
            </div>
          )}
          {!loading && !error && (
            <div className="space-y-6">
              {(data ?? []).map((item, index) => (
                <Reveal key={item.id} delay={index * 0.08}>
                  <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/40">
                    <div className="absolute left-0 top-0 hidden h-full w-1 bg-gradient-to-b from-primary to-accent sm:block" />
                    <CardContent className="grid gap-4 p-6 sm:grid-cols-[auto_1fr] sm:gap-6 sm:p-8">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                        <GraduationCap className="h-7 w-7" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 pb-1.5">
                          <span className="font-mono text-xs text-primary">{item.period}</span>
                          {item.location && (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {item.location}
                            </span>
                          )}
                        </div>
                        <h3 className="font-display text-xl font-bold">{item.degree}</h3>
                        <p className="text-sm font-medium text-primary">{item.school}</p>
                        <p className="mt-0.5 text-sm text-muted-foreground">{item.field}</p>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                          {item.description}
                        </p>
                        {item.achievements.length > 0 && (
                          <ul className="mt-4 flex flex-col gap-2">
                            {item.achievements.map((achievement) => (
                              <li
                                key={achievement}
                                className="flex items-start gap-2 text-sm text-muted-foreground"
                              >
                                <Award className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                                {achievement}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  )
}
