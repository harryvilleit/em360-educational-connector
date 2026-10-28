import { AlertTriangle } from "lucide-react"

type SuspendedAlertProps = {
  count: number
  onView: () => void
}

export function SuspendedAlert({ count, onView }: SuspendedAlertProps) {
  if (count === 0) return null

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50/60 p-4">
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-500" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-red-700">
          {count} student{count > 1 ? "s" : ""} currently suspended
        </p>
        <p className="text-xs text-red-500">
          Review suspended students and update their enrollment status as
          appropriate.
        </p>
      </div>
      <button
        onClick={onView}
        className="shrink-0 rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200"
      >
        View
      </button>
    </div>
  )
}
