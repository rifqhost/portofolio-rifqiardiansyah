// FILE: client/src/pages/admin/AdminLoginPage.tsx
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, Lock, ShieldCheck } from 'lucide-react'
import { SEO } from '@/components/SEO'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { api } from '@/services/api'
import { setToken } from '@/services/auth'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await api.post<{ token: string; user: { username: string } }>('/auth/login', {
        username,
        password,
      })
      if (result.data?.token) {
        setToken(result.data.token)
        navigate('/admin/dashboard', { replace: true })
      } else {
        setError('Login gagal, silakan coba lagi')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <SEO title="Login Admin" noindex />
      <div className="relative flex min-h-screen items-center justify-center px-6 py-16">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h1 className="mt-4 font-display text-xl font-bold">Panel Admin</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Masuk untuk mengelola konten portfolio
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  autoComplete="username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                {loading ? 'Memproses…' : 'Masuk'}
              </Button>
            </form>

            <p className="mt-6 rounded-xl bg-secondary/50 px-4 py-3 text-center text-xs text-muted-foreground">
              Default: username <code className="font-mono text-primary">admin</code> · password{' '}
              <code className="font-mono text-primary">admin123</code>
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
