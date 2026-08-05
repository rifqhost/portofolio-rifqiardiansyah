import {
  Children,
  cloneElement,
  useRef,
  useState,
  type MouseEvent,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
} from 'react'
import { Button, buttonVariants, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Ripple {
  id: number
  x: number
  y: number
  size: number
}

export function RippleButton({
  className,
  onClick,
  asChild = false,
  variant,
  size,
  children,
  ...props
}: ButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([])
  const idRef = useRef(0)

  const addRipple = (e: MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 2.2
    const ripple = {
      id: ++idRef.current,
      x: e.clientX - rect.left - size / 2,
      y: e.clientY - rect.top - size / 2,
      size,
    }
    setRipples((prev) => [...prev, ripple])
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== ripple.id))
    }, 650)
  }

  const handleClick: MouseEventHandler<HTMLElement> = (e) => {
    addRipple(e)
    onClick?.(e as unknown as MouseEvent<HTMLButtonElement>)
  }

  const rippleEls: ReactNode = ripples.map((r) => (
    <span
      key={r.id}
      className="pointer-events-none absolute rounded-full bg-white/30 animate-ripple"
      style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
    />
  ))

  if (asChild) {
    const child = Children.only(children) as ReactElement<{
      className?: string
      onClick?: MouseEventHandler<HTMLElement>
      children?: ReactNode
    }>
    const childProps = child.props

    return cloneElement(
      child,
      {
        className: cn(
          buttonVariants({ variant, size, className }),
          'relative overflow-hidden',
          childProps.className,
        ),
        onClick: (e: MouseEvent<HTMLElement>) => {
          handleClick(e)
          childProps.onClick?.(e)
        },
      },
      <>
        {rippleEls}
        {childProps.children}
      </>,
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={cn('relative overflow-hidden', className)}
      {...props}
    >
      {rippleEls}
      {children}
    </Button>
  )
}
