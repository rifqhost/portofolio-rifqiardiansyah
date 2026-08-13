// FILE: client/src/pages/BlogDetailPage.tsx
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CalendarDays, Check, Clock, Share2, Tags, UserRound } from 'lucide-react'
import { SEO } from '@/components/SEO'
import { Reveal } from '@/components/Reveal'
import { Section, Container } from '@/components/Section'
import { Markdown } from '@/components/Markdown'
import { BlogCard } from '@/components/BlogCard'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ErrorState } from '@/components/State'
import { useLanguage } from '@/contexts/LanguageContext'
import { useToast } from '@/contexts/ToastContext'
import { useFetch } from '@/hooks/useFetch'
import type { BlogPost } from '@/types'

export function BlogDetailPage() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const { slug } = useParams<{ slug: string }>()
  const { data: post, loading, error, refetch } = useFetch<BlogPost>(`/blog/${slug}`)
  const { data: allPosts } = useFetch<BlogPost[]>('/blog?limit=100')
  const [copied, setCopied] = useState(false)

  const related = useMemo(() => {
    if (!post) return []
    return (allPosts ?? [])
      .filter((p) => p.id !== post.id && (p.category === post.category || p.tags.some((tag) => post.tags.includes(tag))))
      .slice(0, 3)
  }, [allPosts, post])

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: post?.title, url })
        return
      } catch {
        /* user cancelled */
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast(t('common.copied'), 'success')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast(t('common.copyFailed'), 'error')
    }
  }

  if (loading) {
    return (
      <Section className="pt-28 md:pt-36">
        <Container className="max-w-3xl">
          <div className="space-y-6">
            <div className="h-6 w-32 animate-pulse rounded-lg bg-secondary" />
            <div className="aspect-[16/9] animate-pulse rounded-2xl bg-secondary" />
            <div className="h-10 w-3/4 animate-pulse rounded-xl bg-secondary" />
            <div className="h-64 animate-pulse rounded-xl bg-secondary" />
          </div>
        </Container>
      </Section>
    )
  }

  if (error || !post) {
    return (
      <Section className="pt-28 md:pt-36">
        <Container className="max-w-3xl">
          <ErrorState message={error || 'Not found'} onRetry={refetch} />
        </Container>
      </Section>
    )
  }

  return (
    <>
      <SEO
        title={post.title}
        description={post.excerpt}
        image={post.cover}
        canonicalPath={`/blog/${post.slug}`}
        type="article"
        keywords={post.tags.join(', ')}
      />

      <Section className="pt-28 md:pt-36">
        <Container className="max-w-3xl">
          <Reveal direction="down" distance={0.6}>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('common.back')}
            </Link>
          </Reveal>

          <Reveal delay={0.08}>
            <Badge className="mt-6">{post.category}</Badge>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              {post.title}
            </h1>
          </Reveal>

          <Reveal delay={0.14}>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                {post.date}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {post.readTime} {t('blog.readTime')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <UserRound className="h-4 w-4" />
                {post.author}
              </span>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <img
              src={post.cover || '/images/placeholder.svg'}
              alt={post.title}
              decoding="async"
              width={1200}
              height={675}
              className="mt-8 aspect-[16/9] w-full rounded-2xl border border-border/60 object-cover shadow-soft"
            />
          </Reveal>

          <Reveal delay={0.26}>
            <Card className="mt-8 p-6 sm:p-10">
              <Markdown content={post.content} />
            </Card>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="mt-8 flex flex-wrap items-start justify-between gap-6">
              <div className="flex flex-col gap-3">
                <span className="inline-flex items-center gap-2 text-sm font-medium">
                  <Tags className="h-4 w-4 text-primary" />
                  {t('blog.tags')}
                </span>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
                {copied ? <Check className="h-4 w-4 text-primary" /> : <Share2 className="h-4 w-4" />}
                {copied ? t('common.copied') : t('common.share')}
              </Button>
            </div>
          </Reveal>

          <Separator className="my-10" />

          <Reveal delay={0.1}>
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src="/images/avatar.webp" alt={post.author} />
                <AvatarFallback>{post.author.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs text-muted-foreground">{t('common.writtenBy')}</p>
                <p className="font-display font-semibold">{post.author}</p>
              </div>
            </div>
          </Reveal>

          {related.length > 0 && (
            <div className="mt-16">
              <Reveal>
                <h2 className="mb-8 font-display text-2xl font-bold">{t('common.related')}</h2>
              </Reveal>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item, index) => (
                  <BlogCard key={item.id} post={item} index={index} />
                ))}
              </div>
            </div>
          )}
        </Container>
      </Section>
    </>
  )
}
