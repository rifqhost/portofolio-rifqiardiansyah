// FILE: client/src/pages/AboutPage.tsx
import { Download, Mail, MapPin, GraduationCap, Languages, UserRound, Briefcase } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SEO } from '@/components/SEO'
import { PageHero } from '@/components/PageHero'
import { Reveal } from '@/components/Reveal'
import { Section, Container } from '@/components/Section'
import { ErrorState } from '@/components/State'
import { getIcon } from '@/lib/icons'
import { useLanguage } from '@/contexts/LanguageContext'
import { useFetch } from '@/hooks/useFetch'
import type { Profile } from '@/types'

export function AboutPage() {
  const { t } = useLanguage()
  const { data: profile, loading, error } = useFetch<Profile>('/profile')

  const infoItems = [
    { icon: UserRound, label: t('common.project'), value: profile?.personalInfo?.fullName },
    { icon: Briefcase, label: t('nav.skills'), value: profile?.personalInfo?.role },
    { icon: GraduationCap, label: t('nav.education'), value: profile?.personalInfo?.status },
    { icon: MapPin, label: t('contact.location'), value: profile?.personalInfo?.location },
    { icon: Mail, label: 'Email', value: profile?.socials?.email },
    { icon: Languages, label: 'Languages', value: profile?.personalInfo?.languages },
  ]

  return (
    <>
      <SEO
        title={t('nav.about')}
        description={profile?.about?.[0] || t('about.subtitle')}
        canonicalPath="/about"
      />
      <PageHero eyebrow={t('about.eyebrow')} title={t('about.title')} subtitle={t('about.subtitle')} />

      <Section className="pt-6">
        <Container>
          {error ? (
            <ErrorState message={error} />
          ) : (
            <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                {profile?.about?.map((paragraph, index) => (
                  <Reveal key={index} delay={index * 0.06}>
                    <p className="leading-relaxed text-muted-foreground">{paragraph}</p>
                  </Reveal>
                ))}
                <Reveal delay={0.3}>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button asChild>
                      <a href={profile?.cv || '/uploads/cv-rifqi-ardiansyah.pdf'} download>
                        <Download />
                        {t('common.downloadCv')}
                      </a>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/contact">{t('common.contactMe')}</Link>
                    </Button>
                  </div>
                </Reveal>
              </div>

              <Reveal delay={0.15} direction="left">
                <Card className="overflow-hidden">
                  <div className="border-b border-border/60 bg-secondary/40 px-6 py-4">
                    <h2 className="font-display text-base font-semibold">
                      {t('about.personalInfo')}
                    </h2>
                  </div>
                  <CardContent className="p-0">
                    <ul className="divide-y divide-border/60">
                      {infoItems.map((item, index) => (
                        <li key={index} className="flex items-center gap-3 px-6 py-3.5">
                          <item.icon className="h-4 w-4 shrink-0 text-primary" />
                          <span className="w-32 shrink-0 text-sm text-muted-foreground">
                            {item.label}
                          </span>
                          <span className="truncate text-sm font-medium">{item.value || '-'}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </Reveal>
            </div>
          )}
        </Container>
      </Section>

      <Section className="pt-0">
        <Container>
          <Reveal>
            <h2 className="mb-8 font-display text-2xl font-bold">{t('about.highlights')}</h2>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2">
            {profile?.highlights?.map((highlight, index) => {
              const Icon = getIcon(highlight.icon)
              return (
                <Reveal key={highlight.title} delay={index * 0.08}>
                  <Card className="group h-full transition-all duration-300 hover:-translate-y-1 hover:border-primary/40">
                    <CardContent className="flex gap-4 p-6">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-display text-base font-semibold">{highlight.title}</h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                          {highlight.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Reveal>
              )
            })}
          </div>
        </Container>
      </Section>
      {loading && (
        <Section className="pt-0">
          <Container>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-40 animate-pulse rounded-2xl bg-secondary" />
              ))}
            </div>
          </Container>
        </Section>
      )}
    </>
  )
}
