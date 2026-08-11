// FILE: client/src/pages/TestimonialsPage.tsx
import { Quote, Star } from 'lucide-react'
import { SEO } from '@/components/SEO'
import { PageHero } from '@/components/PageHero'
import { Reveal } from '@/components/Reveal'
import { Section, Container } from '@/components/Section'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { EmptyState, ErrorState } from '@/components/State'
import { useLanguage } from '@/contexts/LanguageContext'
import { useFetch } from '@/hooks/useFetch'
import type { Testimonial } from '@/types'

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-border'}`}
        />
      ))}
    </div>
  )
}

export function TestimonialsPage() {
  const { t } = useLanguage()
  const { data, loading, error, refetch } = useFetch<Testimonial[]>('/testimonials')

  return (
    <>
      <SEO
        title={t('nav.testimonials')}
        description={t('testimonials.subtitle')}
        canonicalPath="/testimonials"
      />
      <PageHero
        eyebrow={t('testimonials.eyebrow')}
        title={t('testimonials.title')}
        subtitle={t('testimonials.subtitle')}
      />

      <Section className="pt-6">
        <Container>
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl bg-secondary" />
              ))}
            </div>
          ) : error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : (data?.length ?? 0) === 0 ? (
            <EmptyState title={t('testimonials.noData')} description={t('common.noData')} />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data?.map((testimonial, index) => (
                <Reveal key={testimonial.id} delay={index * 0.07}>
                  <Card className="group relative flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/40">
                    <Quote className="absolute right-5 top-5 h-10 w-10 text-primary/10 transition-colors duration-300 group-hover:text-primary/20" />
                    <div className="flex-1 p-6 pb-0">
                      <Stars rating={testimonial.rating} />
                      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                        “{testimonial.message}”
                      </p>
                    </div>
                    <div className="mt-6 flex items-center gap-3 border-t border-border/50 p-6">
                      <Avatar className="h-11 w-11">
                        {testimonial.avatar && (
                          <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                        )}
                        <AvatarFallback>{testimonial.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-display text-sm font-semibold">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
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
