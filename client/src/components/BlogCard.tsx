// FILE: client/src/components/BlogCard.tsx
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, Calendar, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/contexts/LanguageContext'
import { formatDateShort } from '@/lib/utils'
import type { BlogPost } from '@/types'

interface BlogCardProps {
  post: BlogPost
  index?: number
}

export function BlogCard({ post, index = 0 }: BlogCardProps) {
  const { t, lang } = useLanguage()
  const locale = lang === 'en' ? 'en-US' : 'id-ID'

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="group relative flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/40 hover:shadow-card-hover">
        <Link to={`/blog/${post.slug}`} className="flex flex-1 flex-col" aria-label={post.title}>
          <div className="relative aspect-[16/9] overflow-hidden">
            <img
              src={post.cover || '/images/placeholder.svg'}
              alt={post.title}
              loading="lazy"
              decoding="async"
              width={1200}
              height={675}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            {post.featured && (
              <Badge className="absolute left-3 top-3 bg-primary/90 text-primary-foreground backdrop-blur">
                {t('blog.featured')}
              </Badge>
            )}
          </div>

          <div className="flex flex-1 flex-col p-5">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDateShort(post.date, locale)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {post.readTime} {t('common.minRead')}
              </span>
            </div>
            <h3 className="mt-3 font-display text-lg font-semibold leading-snug transition-colors group-hover:text-primary">
              {post.title}
            </h3>
            <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
              {post.excerpt}
            </p>
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="secondary">{post.category}</Badge>
              <span className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-primary">
                {t('common.readMore')}
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </div>
        </Link>
      </Card>
    </motion.article>
  )
}
