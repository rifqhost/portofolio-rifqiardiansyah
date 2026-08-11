// FILE: client/src/pages/CertificatesPage.tsx
import { Award, ExternalLink, Sparkles } from 'lucide-react'
import { SEO } from '@/components/SEO'
import { PageHero } from '@/components/PageHero'
import { Reveal } from '@/components/Reveal'
import { Section, Container } from '@/components/Section'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/State'
import { useLanguage } from '@/contexts/LanguageContext'
import { useFetch } from '@/hooks/useFetch'
import type { Certificates } from '@/types'

export function CertificatesPage() {
  const { t } = useLanguage()
  const { data, loading, error, refetch } = useFetch<Certificates>('/certificates')

  return (
    <>
      <SEO
        title={t('nav.certificates')}
        description={data?.subtitle || t('certificates.subtitle')}
        canonicalPath="/certificates"
      />
      <PageHero
        eyebrow={t('certificates.eyebrow')}
        title={t('certificates.title')}
        subtitle={t('certificates.subtitle')}
      />

      <Section className="pt-6">
        <Container>
          {error && <ErrorState message={error} onRetry={refetch} />}

          {loading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl bg-secondary" />
              ))}
            </div>
          )}

          {!loading && !error && data?.comingSoon && (
            <Reveal>
              <div className="mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-dashed border-border bg-secondary/30 px-8 py-20 text-center">
                <div className="relative mb-6">
                  <div className="absolute inset-0 -z-10 animate-pulse rounded-full bg-accent/20 blur-2xl" />
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/15 text-accent">
                    <Sparkles className="h-9 w-9" />
                  </div>
                </div>
                <h2 className="font-display text-2xl font-bold">{data.comingSoonTitle}</h2>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  {data.comingSoonDescription}
                </p>
              </div>
            </Reveal>
          )}

          {!loading && !error && !data?.comingSoon && (data?.items.length ?? 0) > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data?.items.map((certificate, index) => (
                <Reveal key={certificate.id} delay={index * 0.07}>
                  <Card className="group relative h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/40">
                    {certificate.image ? (
                      <div className="flex aspect-[16/10] items-center justify-center overflow-hidden bg-secondary/50">
                        <img
                          src={certificate.image}
                          alt={certificate.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center bg-gradient-to-br from-primary/15 to-accent/10 px-6 py-10">
                        <Award className="h-14 w-14 text-primary transition-transform duration-300 group-hover:scale-110" />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <h3 className="font-display text-base font-semibold leading-snug">
                        {certificate.title}
                      </h3>
                      <p className="mt-1.5 text-sm font-medium text-primary">{certificate.issuer}</p>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">{certificate.date}</p>
                      {certificate.credentialUrl && (
                        <Button asChild variant="ghost" size="sm" className="mt-4 gap-2">
                          <a href={certificate.credentialUrl} target="_blank" rel="noopener noreferrer">
                            {t('common.viewCredential')}
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      )}
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
