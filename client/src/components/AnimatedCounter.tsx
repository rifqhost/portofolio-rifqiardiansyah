// FILE: client/src/components/AnimatedCounter.tsx
import { useCountUp } from '@/hooks/useCountUp'

interface AnimatedCounterProps {
  value: number
  suffix?: string
  className?: string
}

export function AnimatedCounter({ value, suffix = '', className }: AnimatedCounterProps) {
  const { ref, value: count } = useCountUp(value)
  return (
    <span ref={ref} className={className}>
      {count}
      {suffix}
    </span>
  )
}
