// FILE: client/src/components/InteractiveBackground.tsx
import { useRef } from 'react'
import { useParticleNetwork } from '@/hooks/useParticleNetwork'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

export function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const reduced = usePrefersReducedMotion()
  useParticleNetwork(canvasRef, {})

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-grid animate-grid-move opacity-50 mask-fade" />
      <div className="absolute -left-40 -top-40 h-[480px] w-[480px] animate-blob-float rounded-full bg-primary/15 blur-[140px]" />
      <div className="absolute -bottom-40 -right-40 h-[520px] w-[520px] animate-blob-float-2 rounded-full bg-accent/25 blur-[150px]" />
      <div className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 animate-blob-float rounded-full bg-primary/10 blur-[120px]" />
      {!reduced && <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />}
    </div>
  )
}
