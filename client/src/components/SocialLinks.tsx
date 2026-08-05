// FILE: client/src/components/SocialLinks.tsx
import { Github, Instagram, Linkedin, Mail, MessageCircle } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { Socials } from '@/types'

interface SocialLinksProps {
  socials: Socials | undefined
  className?: string
  itemClassName?: string
}

export function SocialLinks({ socials, className, itemClassName }: SocialLinksProps) {
  if (!socials) return null

  const items = [
    { href: socials.github, label: 'GitHub', icon: Github },
    { href: socials.linkedin, label: 'LinkedIn', icon: Linkedin },
    { href: socials.instagram, label: 'Instagram', icon: Instagram },
    { href: `mailto:${socials.email}`, label: 'Email', icon: Mail },
    { href: `https://wa.me/${socials.whatsapp}`, label: 'WhatsApp', icon: MessageCircle },
  ].filter((item) => item.href)

  return (
    <TooltipProvider delayDuration={200}>
      <div className={cn('flex items-center gap-1.5', className)}>
        {items.map((item) => (
          <Tooltip key={item.label}>
            <TooltipTrigger asChild>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all hover:-translate-y-0.5 hover:bg-secondary hover:text-foreground',
                  itemClassName,
                )}
              >
                <item.icon className="h-4 w-4" />
              </a>
            </TooltipTrigger>
            <TooltipContent>{item.label}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  )
}
