// FILE: client/src/components/PageHero.tsx
import { Sparkles } from 'lucide-react'
import { Container } from '@/components/Section'
import { Reveal } from '@/components/Reveal'

interface PageHeroProps {
  eyebrow?: string
  title: string
  subtitle?: string
}

export function PageHero({ eyebrow, title, subtitle }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden pb-6 pt-28 md:pt-36">
      <Container>
        <div className="flex max-w-3xl flex-col items-start gap-4">
          <Reveal direction="down" distance={0.6}>
            {eyebrow && (
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                {eyebrow}
              </span>
            )}
          </Reveal>
          <Reveal delay={0.1} distance={0.8}>
            <h1 className="section-title text-4xl sm:text-5xl">{title}</h1>
          </Reveal>
          {subtitle && (
            <Reveal delay={0.2} distance={0.8}>
              <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">{subtitle}</p>
            </Reveal>
          )}
        </div>
      </Container>
    </section>
  )
}
