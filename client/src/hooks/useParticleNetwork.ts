// FILE: client/src/hooks/useParticleNetwork.ts
import { useEffect, useRef, type RefObject } from 'react'

export interface ParticleNetworkOptions {
  enabled?: boolean
  particleCount?: number
  linkDistance?: number
  mouseRadius?: number
  color?: string
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  r: number
}

interface MouseState {
  x: number
  y: number
  active: boolean
  trail: { x: number; y: number }[]
}

export function useParticleNetwork(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  options: ParticleNetworkOptions = {},
) {
  const { enabled = true, particleCount, linkDistance = 130, mouseRadius = 170, color } = options

  useEffect(() => {
    if (!enabled) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let animationFrame = 0
    let particles: Particle[] = []
    const mouse: MouseState = { x: -9999, y: -9999, active: false, trail: [] }

    const isMobile = window.innerWidth < 768
    const targetCount = particleCount ?? (isMobile ? 45 : 85)

    const getColor = () => {
      if (color) return color
      const dark = document.documentElement.classList.contains('dark')
      return dark ? '168 85 247' : '109 40 217'
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      particles = Array.from({ length: targetCount }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.8,
      }))
    }

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
      mouse.active = true
      mouse.trail.push({ x: mouse.x, y: mouse.y })
      if (mouse.trail.length > 26) mouse.trail.shift()
    }

    const onMouseLeave = () => {
      mouse.active = false
      mouse.trail = []
    }

    const draw = () => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      ctx.clearRect(0, 0, w, h)
      const rgb = getColor()

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > w) p.vx *= -1
        if (p.y < 0 || p.y > h) p.vy *= -1

        if (mouse.active) {
          const dx = mouse.x - p.x
          const dy = mouse.y - p.y
          const dist = Math.hypot(dx, dy)
          if (dist < mouseRadius && dist > 0.01) {
            const force = (mouseRadius - dist) / mouseRadius
            p.x += (dx / dist) * force * 0.6
            p.y += (dy / dist) * force * 0.6
          }
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgb(${rgb} / 0.55)`
        ctx.fill()
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i]
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.hypot(dx, dy)
          if (dist < linkDistance) {
            const alpha = (1 - dist / linkDistance) * 0.28
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgb(${rgb} / ${alpha})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }

      if (mouse.active) {
        for (const p of particles) {
          const dx = mouse.x - p.x
          const dy = mouse.y - p.y
          const dist = Math.hypot(dx, dy)
          if (dist < mouseRadius) {
            const alpha = (1 - dist / mouseRadius) * 0.45
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(mouse.x, mouse.y)
            ctx.strokeStyle = `rgb(${rgb} / ${alpha})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }

      if (mouse.trail.length > 1) {
        for (let i = 1; i < mouse.trail.length; i++) {
          const prev = mouse.trail[i - 1]
          const curr = mouse.trail[i]
          const alpha = (i / mouse.trail.length) * 0.4
          ctx.beginPath()
          ctx.moveTo(prev.x, prev.y)
          ctx.lineTo(curr.x, curr.y)
          ctx.strokeStyle = `rgb(${rgb} / ${alpha})`
          ctx.lineWidth = 1.6
          ctx.stroke()
        }
      }

      animationFrame = requestAnimationFrame(draw)
    }

    resize()
    draw()

    const onVisibility = () => {
      cancelAnimationFrame(animationFrame)
      if (!document.hidden) animationFrame = requestAnimationFrame(draw)
    }

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    document.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseLeave)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [enabled, particleCount, linkDistance, mouseRadius, color, canvasRef])
}

export function useMousePositionRef() {
  const ref = useRef({ x: -100, y: -100 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      ref.current.x = e.clientX
      ref.current.y = e.clientY
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return ref
}
