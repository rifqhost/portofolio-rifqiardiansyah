// FILE: client/src/pages/HomePage.tsx
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BadgeCheck,
  Download,
  Github,
  MessageCircle,
  Send,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SEO } from '@/components/SEO'
import { Reveal } from '@/components/Reveal'
import { Section, SectionHeader, Container } from '@/components/Section'
import { Magnetic } from '@/components/Magnetic'
import { RippleButton } from '@/components/RippleButton'
import { TypingText } from '@/components/TypingText'
import { AnimatedCounter } from '@/components/AnimatedCounter'
import { ProjectCard } from '@/components/ProjectCard'
import { BlogCard } from '@/components/BlogCard'
import { SocialLinks } from '@/components/SocialLinks'
import { EmptyState, ErrorState } from '@/components/State'
import { getIcon } from '@/lib/icons'
import { useLanguage } from '@/contexts/LanguageContext'
import { useFetch } from '@/hooks/useFetch'
import type { BlogPost, Experience, Profile, Project, Skills, Testimonial } from '@/types'

function Hero() {
  const { t } = useLanguage()
  const { data: profile, loading } = useFetch<Profile>('/profile')

  return (
    <section className="relative overflow-hidden pb-16 pt-32 md:pb-24 md:pt-44">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="flex flex-col items-start gap-5">
            <Reveal direction="down" distance={0.6}>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <BadgeCheck className="h-3.5 w-3.5" />
                {t('hero.availability')}
              </span>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="font-mono text-sm text-muted-foreground">{t('hero.greeting')} 👋</p>
            </Reveal>

            <Reveal delay={0.15}>
              <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
                {loading ? (
                  <span className="inline-block h-14 w-48 animate-pulse rounded-xl bg-secondary" />
                ) : (
                  <span className="text-gradient">{profile?.name || 'Rifqi Ardiansyah'}</span>
                )}
              </h1>
            </Reveal>

            <Reveal delay={0.2}>
              <TypingText
                words={profile?.roles ?? ['Web Developer', 'Backend Developer', 'Full Stack Enthusiast']}
                className="font-display text-2xl font-semibold text-foreground sm:text-3xl"
              />
            </Reveal>

            <Reveal delay={0.25}>
              <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
                {t('hero.description')}
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <Magnetic>
                  <RippleButton asChild size="lg">
                    <a href={profile?.cv || '/uploads/cv-rifqi-ardiansyah.pdf'} download aria-label={t('common.downloadCv')}>
                      <Download />
                      {t('common.downloadCv')}
                    </a>
                  </RippleButton>
                </Magnetic>
                <Magnetic>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/contact">
                      <Send />
                      {t('common.contactMe')}
                    </Link>
                  </Button>
                </Magnetic>
                <Magnetic>
                  <Button asChild size="lg" variant="ghost">
                    <Link to="/projects">
                      {t('common.viewProjects')}
                      <ArrowRight />
                    </Link>
                  </Button>
                </Magnetic>
              </div>
            </Reveal>

            <Reveal delay={0.35}>
              <div className="mt-3 flex items-center gap-3">
                <span className="font-mono text-xs text-muted-foreground">{profile?.role}</span>
                <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                <span className="font-mono text-xs text-muted-foreground">{profile?.status}</span>
              </div>
            </Reveal>

            <Reveal delay={0.4}>
              {profile?.socials && (
                <SocialLinks socials={profile.socials} className="mt-2" itemClassName="h-10 w-10" />
              )}
            </Reveal>
          </div>

          <Reveal delay={0.3} direction="left" className="hidden lg:block">
            <div className="relative mx-auto max-w-sm">
              <div className="absolute -inset-6 rounded-[2.5rem] bg-primary/20 blur-3xl" aria-hidden />
              <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/60 p-3 shadow-card-hover backdrop-blur-xl">
                <div className="relative overflow-hidden rounded-[1.5rem]">
                  <img
                    src={profile?.avatar || '/images/avatar.webp'}
                    alt={profile?.name || 'Rifqi Ardiansyah'}
                    className="aspect-square w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent" />
                </div>
                <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between">
                  <div className="glass-strong flex items-center gap-3 rounded-2xl p-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 font-display text-xs font-bold text-primary">
                      {profile?.initials || 'RA'}
                    </span>
                    <div>
                      <p className="text-sm font-semibold leading-none">{profile?.name || 'Rifqi Ardiansyah'}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{profile?.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  )
}

function StatsBar({ profile }: { profile: Profile | null }) {
  const { t } = useLanguage()
  const stats = [
    { label: t('hero.stats.projects'), value: profile?.stats.projects ?? 0 },
    { label: t('hero.stats.techStack'), value: profile?.stats.techStack ?? 0 },
    { label: t('hero.stats.github'), value: profile?.stats.github ?? 0 },
  ]

  return (
    <Container>
      <Reveal>
        <div className="glass grid grid-cols-3 divide-x divide-border/70 overflow-hidden rounded-2xl">
          {stats.map((stat, index) => (
            <div key={stat.label} className="flex flex-col items-center gap-1 px-4 py-6 text-center">
              <AnimatedCounter
                value={stat.value}
                className="font-display text-3xl font-bold sm:text-4xl"
              />
              <span className="text-xs text-muted-foreground sm:text-sm">{stat.label}</span>
              {index < 2 && <span className="sr-only">•</span>}
            </div>
          ))}
        </div>
      </Reveal>
    </Container>
  )
}

function AboutPreview({ profile }: { profile: Profile | null }) {
  const { t } = useLanguage()
  if (!profile) return null

  return (
    <Section id="about">
      <Container>
        <SectionHeader eyebrow={t('about.eyebrow')} title={t('about.title')} subtitle={t('about.subtitle')} />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {profile.highlights?.map((highlight, index) => {
            const Icon = getIcon(highlight.icon)
            return (
              <Reveal key={highlight.title} delay={index * 0.08}>
                <Card className="group h-full transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-card-hover">
                  <CardContent className="flex h-full flex-col gap-3 p-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-base font-semibold">{highlight.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {highlight.description}
                    </p>
                  </CardContent>
                </Card>
              </Reveal>
            )
          })}
        </div>
        <Reveal className="mt-10 flex justify-center">
          <Button asChild variant="outline">
            <Link to="/about">
              {t('common.readMore')}
              <ArrowRight />
            </Link>
          </Button>
        </Reveal>
      </Container>
    </Section>
  )
}

function FeaturedProjects({ projects, loading, error }: { projects: Project[]; loading: boolean; error: string | null }) {
  const { t } = useLanguage()

  return (
    <Section id="projects" className="bg-secondary/30">
      <Container>
        <SectionHeader eyebrow={t('projects.eyebrow')} title={t('projects.title')} subtitle={t('projects.subtitle')} />
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-secondary" />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} />
        ) : projects.length === 0 ? (
          <EmptyState title={t('common.noResults')} />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.slice(0, 3).map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        )}
        <Reveal className="mt-10 flex justify-center">
          <Button asChild>
            <Link to="/projects">
              {t('common.viewAll')}
              <ArrowRight />
            </Link>
          </Button>
        </Reveal>
      </Container>
    </Section>
  )
}

function ExperiencePreview({ experiences }: { experiences: Experience[] }) {
  const { t } = useLanguage()
  if (!experiences.length) return null

  return (
    <Section id="experience">
      <Container>
        <SectionHeader
          eyebrow={t('experience.eyebrow')}
          title={t('experience.title')}
          subtitle={t('experience.subtitle')}
        />
        <div className="mx-auto max-w-3xl">
          <ol className="relative space-y-8 border-l border-border pl-8">
            {experiences.slice(0, 3).map((exp, index) => (
              <Reveal key={exp.id} delay={index * 0.08}>
                <li className="relative">
                  <span className="absolute -left-[2.1rem] top-1 flex h-4 w-4 items-center justify-center rounded-full border border-primary/40 bg-background">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-base font-semibold">{exp.role}</h3>
                    {exp.current && (
                      <Badge variant="success">{t('experience.current')}</Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-primary">{exp.company}</p>
                  <p className="font-mono text-xs text-muted-foreground">{exp.period}</p>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {exp.description}
                  </p>
                </li>
              </Reveal>
            ))}
          </ol>
          <Reveal className="mt-8 flex justify-center">
            <Button asChild variant="outline">
              <Link to="/experience">
                {t('common.viewAll')}
                <ArrowRight />
              </Link>
            </Button>
          </Reveal>
        </div>
      </Container>
    </Section>
  )
}

function BlogPreview({ posts, loading, error }: { posts: BlogPost[]; loading: boolean; error: string | null }) {
  const { t } = useLanguage()

  return (
    <Section id="blog" className="bg-secondary/30">
      <Container>
        <SectionHeader eyebrow={t('blog.eyebrow')} title={t('blog.title')} subtitle={t('blog.subtitle')} />
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-secondary" />
            ))}
          </div>
        ) : error ? (
          <ErrorState message={error} />
        ) : posts.length === 0 ? (
          <EmptyState title={t('common.noResults')} />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.slice(0, 3).map((post, index) => (
              <BlogCard key={post.id} post={post} index={index} />
            ))}
          </div>
        )}
        <Reveal className="mt-10 flex justify-center">
          <Button asChild>
            <Link to="/blog">
              {t('common.viewAll')}
              <ArrowRight />
            </Link>
          </Button>
        </Reveal>
      </Container>
    </Section>
  )
}

function TestimonialPreview({ testimonials }: { testimonials: Testimonial[] }) {
  const { t } = useLanguage()
  if (!testimonials.length) return null

  return (
    <Section id="testimonials">
      <Container>
        <SectionHeader
          eyebrow={t('testimonials.eyebrow')}
          title={t('testimonials.title')}
          subtitle={t('testimonials.subtitle')}
        />
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.slice(0, 3).map((item, index) => (
            <Reveal key={item.id} delay={index * 0.08}>
              <Card className="h-full">
                <CardContent className="flex h-full flex-col gap-4 p-6">
                  <div className="flex gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < item.rating ? 'text-amber-400' : 'text-muted-foreground/30'}>
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
                    “{item.message}”
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary">
                      {item.name.slice(0, 1)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-10 flex justify-center">
          <Button asChild variant="outline">
            <Link to="/testimonials">
              {t('common.viewAll')}
              <ArrowRight />
            </Link>
          </Button>
        </Reveal>
      </Container>
    </Section>
  )
}

function CallToAction({ profile }: { profile: Profile | null }) {
  const { t } = useLanguage()

  return (
    <Section id="cta">
      <Container>
        <Reveal>
          <motion.div
            className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card/60 to-accent/15 px-6 py-16 text-center shadow-soft backdrop-blur-xl"
            whileHover={{ scale: 1.01 }}
          >
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" aria-hidden />
            <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-accent/25 blur-3xl" aria-hidden />
            <div className="relative">
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                {t('contact.title')}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t('contact.subtitle')}</p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <RippleButton asChild size="lg">
                  <Link to="/contact">
                    <Send />
                    {t('common.contactMe')}
                  </Link>
                </RippleButton>
                <Button asChild size="lg" variant="outline">
                  <a
                    href={profile?.socials?.github || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github />
                    GitHub
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a
                    href={`https://wa.me/${profile?.socials?.whatsapp || ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle />
                    WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          </motion.div>
        </Reveal>
      </Container>
    </Section>
  )
}

export function HomePage() {
  const { t } = useLanguage()
  const { data: profile } = useFetch<Profile>('/profile')
  const { data: projects, loading: projectsLoading, error: projectsError } = useFetch<Project[]>('/projects?limit=10')
  const { data: posts, loading: postsLoading, error: postsError } = useFetch<BlogPost[]>('/blog?limit=10')
  const { data: experiences } = useFetch<Experience[]>('/experience')
  const { data: testimonials } = useFetch<Testimonial[]>('/testimonials')
  const { data: skills } = useFetch<Skills>('/skills')

  const skillTotal =
    (skills?.frontend?.length ?? 0) + (skills?.backend?.length ?? 0) + (skills?.tools?.length ?? 0)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile?.name || 'Rifqi Ardiansyah',
    jobTitle: 'Web Developer & Backend Developer',
    description: profile?.tagline || t('hero.description'),
    url: import.meta.env.VITE_SITE_URL || window.location.origin,
    image: `${import.meta.env.VITE_SITE_URL || window.location.origin}${profile?.avatar || '/images/avatar.webp'}`,
    knowsAbout: ['Web Development', 'Backend Development', 'React', 'Node.js', 'REST API'],
  }

  const statsProfile = profile ? { ...profile, stats: { ...profile.stats, techStack: skillTotal || profile.stats.techStack } } : null

  return (
    <>
      <SEO
        title={profile?.seo?.title}
        description={profile?.seo?.description}
        keywords={profile?.seo?.keywords}
        image={profile?.seo?.ogImage}
        jsonLd={jsonLd}
      />
      <Hero />
      <StatsBar profile={statsProfile} />
      <AboutPreview profile={profile} />
      <FeaturedProjects projects={projects ?? []} loading={projectsLoading} error={projectsError} />
      <ExperiencePreview experiences={experiences ?? []} />
      <BlogPreview posts={posts ?? []} loading={postsLoading} error={postsError} />
      <TestimonialPreview testimonials={testimonials ?? []} />
      <CallToAction profile={profile} />
    </>
  )
}
