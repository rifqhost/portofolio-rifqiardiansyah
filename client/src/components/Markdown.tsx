// FILE: client/src/components/Markdown.tsx
import { Fragment, type ReactNode } from 'react'

function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={index}
          className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[0.85em] text-primary"
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return <Fragment key={index}>{part}</Fragment>
  })
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  return (
    <div className="my-4 overflow-hidden rounded-xl border border-border bg-background/80">
      <div className="flex items-center justify-between border-b border-border/70 px-4 py-2">
        <span className="font-mono text-xs text-muted-foreground">{language || 'code'}</span>
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
        </span>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-foreground/90">
        <code>{code}</code>
      </pre>
    </div>
  )
}

export function Markdown({ content }: { content: string }) {
  const lines = content.split('\n')
  const blocks: ReactNode[] = []
  let listBuffer: string[] = []
  let codeBuffer: string[] = []
  let codeLanguage = ''
  let inCode = false
  let key = 0

  const flushList = () => {
    if (listBuffer.length === 0) return
    blocks.push(
      <ul key={`list-${key++}`} className="my-3 space-y-1.5 pl-1">
        {listBuffer.map((item, i) => (
          <li key={i} className="flex gap-2 text-muted-foreground">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span>{renderInline(item)}</span>
          </li>
        ))}
      </ul>,
    )
    listBuffer = []
  }

  const flushCode = () => {
    if (codeBuffer.length === 0) return
    blocks.push(
      <CodeBlock key={`code-${key++}`} language={codeLanguage} code={codeBuffer.join('\n')} />,
    )
    codeBuffer = []
    codeLanguage = ''
  }

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.startsWith('```')) {
      if (inCode) {
        inCode = false
        flushCode()
      } else {
        flushList()
        inCode = true
        codeLanguage = trimmed.slice(3).trim()
      }
      continue
    }

    if (inCode) {
      codeBuffer.push(line)
      continue
    }

    if (trimmed === '') {
      flushList()
      continue
    }

    if (trimmed.startsWith('## ')) {
      flushList()
      blocks.push(
        <h2 key={`h2-${key++}`} className="mb-2 mt-8 font-display text-2xl font-bold">
          {renderInline(trimmed.slice(3))}
        </h2>,
      )
      continue
    }

    if (trimmed.startsWith('### ')) {
      flushList()
      blocks.push(
        <h3 key={`h3-${key++}`} className="mb-2 mt-6 font-display text-xl font-bold">
          {renderInline(trimmed.slice(4))}
        </h3>,
      )
      continue
    }

    if (trimmed.startsWith('- ')) {
      listBuffer.push(trimmed.slice(2))
      continue
    }

    if (trimmed.startsWith('![')) {
      flushList()
      const match = trimmed.match(/!\[([^\]]*)\]\(([^)]+)\)/)
      if (match) {
        blocks.push(
          <img key={`img-${key++}`} src={match[2]} alt={match[1] || ''} className="my-4 rounded-xl border border-border" />,
        )
        continue
      }
    }

    flushList()
    blocks.push(
      <p key={`p-${key++}`} className="my-3 leading-relaxed text-muted-foreground">
        {renderInline(line)}
      </p>,
    )
  }

  flushList()
  flushCode()

  return <div className="text-[15px]">{blocks}</div>
}
