// FILE: client/src/components/ErrorBoundary.tsx
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
          <div>
            <p className="font-display text-6xl font-bold text-primary">500</p>
            <h1 className="mt-3 font-display text-2xl font-semibold">Oops, something went wrong.</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              An unexpected error occurred. Please refresh the page to continue.
            </p>
            <Button className="mt-6" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
