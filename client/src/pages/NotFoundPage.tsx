// FILE: client/src/pages/NotFoundPage.tsx
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, Home } from 'lucide-react'
import { SEO } from '@/components/SEO'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/LanguageContext'

export function NotFoundPage() {
  const { t } = useLanguage()

  return (
    <>
      <SEO title="404" description={t('notFound.description')} />
      <section className="flex min-h-[70vh] items-center justify-center px-6 py-24">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-mono text-[7rem] font-bold leading-none text-primary/90 sm:text-[10rem]"
          >
            404
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 font-display text-2xl font-bold sm:text-3xl"
          >
            {t('notFound.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground"
          >
            {t('notFound.description')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.26 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Button asChild>
              <Link to="/">
                <Home />
                {t('common.backToHome')}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/projects">
                <ArrowLeft />
                {t('common.viewProjects')}
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  )
}
