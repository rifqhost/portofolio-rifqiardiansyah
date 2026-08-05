// FILE: client/src/hooks/useFetch.ts
import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '@/services/api'
import { getErrorMessage } from '@/lib/utils'

interface UseFetchOptions<T> {
  enabled?: boolean
  initialData?: T | null
  deps?: unknown[]
}

export function useFetch<T>(path: string, options: UseFetchOptions<T> = {}) {
  const { enabled = true, initialData = null, deps = [] } = options
  const [data, setData] = useState<T | null>(initialData)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)
  const mounted = useRef(true)

  const fetchData = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    setError(null)
    try {
      const response = await api.get<T>(path)
      if (mounted.current) setData(response.data)
    } catch (err) {
      if (mounted.current) setError(getErrorMessage(err))
    } finally {
      if (mounted.current) setLoading(false)
    }
  }, [path, enabled])

  useEffect(() => {
    mounted.current = true
    fetchData()
    return () => {
      mounted.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, loading, error, refetch: fetchData }
}
