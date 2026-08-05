// FILE: client/src/components/ui/skeleton.tsx
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-secondary/70', className)}
      {...props}
    />
  )
}

export { Skeleton }
