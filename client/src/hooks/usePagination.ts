// FILE: client/src/hooks/usePagination.ts
import { useMemo, useState } from 'react'

export function usePagination<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const currentPage = Math.min(page, totalPages)

  const pageItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return items.slice(start, start + pageSize)
  }, [items, currentPage, pageSize])

  const setPageSafe = (next: number) => {
    setPage(Math.min(Math.max(1, next), totalPages))
  }

  return {
    page: currentPage,
    setPage: setPageSafe,
    pageItems,
    totalPages,
    totalItems: items.length,
  }
}
