// FILE: client/src/components/CursorGlow.tsx
import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement | null>(null)
  const dotRef = useRef<HTMLDivElement | null>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (reduced) return
    if (window.matchMedia('(pointer: coarse)').matches) return

    const glow = glowRef.current
    const dot = dotRef.current
    if (!glow || !dot) return

    let raf = 0
    let tx = -100
    let ty = -100
    let gx = -100
    let gy = -100

    const onMove = (e: MouseEvent) => {
      tx = e.clientX
      ty = e.clientY
    }

    const loop = () => {
      gx += (tx - gx) * 0.08
      gy += (ty - gy) * 0.08
      dot.style.transform = `translate3d(${tx - 5}px, ${ty - 5}px, 0)`
      glow.style.transform = `translate3d(${gx - 160}px, ${gy - 160}px, 0)`
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    raf = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [reduced])

  if (reduced) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[5] hidden lg:block" aria-hidden>
      <div
        ref={glowRef}
        className="absolute left-0 top-0 h-[320px] w-[320px] rounded-full bg-primary/10 blur-[120px] transition-colors duration-700"
      />
      <div
        ref={dotRef}
        className="absolute left-0 top-0 h-2.5 w-2.5 rounded-full bg-primary mix-blend-difference"
      />
    </div>
  )
}
