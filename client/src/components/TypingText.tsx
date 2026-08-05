// FILE: client/src/components/TypingText.tsx
import { useTyping } from '@/hooks/useTyping'

interface TypingTextProps {
  words: string[]
  className?: string
  typeSpeed?: number
  deleteSpeed?: number
  pause?: number
}

export function TypingText({ words, className, typeSpeed, deleteSpeed, pause }: TypingTextProps) {
  const { text } = useTyping({ words, typeSpeed, deleteSpeed, pause })

  return (
    <span className={className} aria-label={words.join(', ')}>
      {text}
      <span
        aria-hidden
        className="ml-0.5 inline-block h-[0.9em] w-[3px] animate-pulse-soft rounded-full bg-current align-middle"
      />
    </span>
  )
}
