import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
export function QueryState({
  query,
  children,
}: {
  query: {
    isPending: boolean
    isError: boolean
    error: Error | null
    refetch: () => unknown
  }
  children: ReactNode
}) {
  if (query.isPending)
    return (
      <p role="status" className="p-6">
        Loading school records…
      </p>
    )
  if (query.isError)
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 p-5"
      >
        <p>{query.error?.message || "Unable to load school records."}</p>
        <Button variant="outline" onClick={() => void query.refetch()}>
          Try again
        </Button>
      </div>
    )
  return <>{children}</>
}
export function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  )
}
export function Pager({
  page,
  total,
  setPage,
}: {
  page: number
  total: number
  setPage: (page: number) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <Button
        variant="outline"
        disabled={page <= 1}
        onClick={() => setPage(page - 1)}
      >
        Previous
      </Button>
      <span>
        Page {page} of {Math.max(1, total)}
      </span>
      <Button
        variant="outline"
        disabled={page >= total}
        onClick={() => setPage(page + 1)}
      >
        Next
      </Button>
    </div>
  )
}
export const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm disabled:bg-slate-100"
