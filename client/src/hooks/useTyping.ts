// FILE: client/src/hooks/useTyping.ts
import { useEffect, useMemo, useState } from 'react'

interface UseTypingOptions {
  words: string[]
  typeSpeed?: number
  deleteSpeed?: number
  pause?: number
  startDelay?: number
  loop?: boolean
}

export function useTyping({
  words,
  typeSpeed = 70,
  deleteSpeed = 40,
  pause = 1800,
  startDelay = 400,
  loop = true,
}: UseTypingOptions) {
  const safeWords = useMemo(() => (words.length ? words : ['']), [words])
  const [index, setIndex] = useState(0)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const timeout = window.setTimeout(() => setReady(true), startDelay)
    return () => window.clearTimeout(timeout)
  }, [startDelay])

  useEffect(() => {
    if (!ready || safeWords.length === 0) return

    if (!loop && index >= safeWords.length) return

    const current = safeWords[index % safeWords.length]
    let timeout: number | undefined

    if (!deleting && text === current) {
      timeout = window.setTimeout(() => setDeleting(true), pause)
    } else if (deleting && text === '') {
      setDeleting(false)
      setIndex((prev) => prev + 1)
    } else {
      timeout = window.setTimeout(
        () => {
          setText((prev) =>
            deleting ? current.slice(0, prev.length - 1) : current.slice(0, prev.length + 1),
          )
        },
        deleting ? deleteSpeed : typeSpeed,
      )
    }

    return () => {
      if (timeout !== undefined) window.clearTimeout(timeout)
    }
  }, [text, deleting, index, ready, safeWords, typeSpeed, deleteSpeed, pause, loop])

  return { text: ready ? text : '', isDeleting: deleting }
}
