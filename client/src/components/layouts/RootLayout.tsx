// FILE: client/src/components/layouts/RootLayout.tsx
import { InteractiveBackground } from '@/components/InteractiveBackground'
import { CursorGlow } from '@/components/CursorGlow'
import { ScrollProgress } from '@/components/ScrollProgress'
import { LoadingScreen } from '@/components/LoadingScreen'
import { ScrollToTop } from '@/components/ScrollToTop'
import { BackToTop } from '@/components/BackToTop'
import { Header } from '@/components/layouts/Header'
import { Footer } from '@/components/layouts/Footer'
import { PageTransition } from '@/components/layouts/PageTransition'

export function RootLayout() {
  return (
    <div className="relative min-h-screen">
      <InteractiveBackground />
      <CursorGlow />
      <ScrollProgress />
      <LoadingScreen />
      <ScrollToTop />
      <Header />
      <PageTransition />
      <Footer />
      <BackToTop />
    </div>
  )
}
