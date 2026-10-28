import { History, X } from "lucide-react"
import { Button } from "@/components/ui/button"

function timeAgo(savedAt: number): string {
  const diffMs = Date.now() - savedAt
  const minutes = Math.round(diffMs / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`
  const days = Math.round(hours / 24)
  return `${days} day${days === 1 ? "" : "s"} ago`
}

interface FormDraftBannerProps {
  savedAt: number
  onRestore: () => void
  onDiscard: () => void
}

export function FormDraftBanner({
  savedAt,
  onRestore,
  onDiscard,
}: FormDraftBannerProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5">
      <div className="flex items-center gap-2 text-xs text-amber-800">
        <History className="size-4 shrink-0" />
        <span>
          You have an unsaved draft from {timeAgo(savedAt)}. Restore it to
          continue where you left off?
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          size="sm"
          className="rounded-lg bg-amber-600 text-white hover:bg-amber-700"
          onClick={onRestore}
        >
          Restore
        </Button>
        <button
          type="button"
          onClick={onDiscard}
          aria-label="Discard draft"
          className="flex size-6 shrink-0 items-center justify-center rounded-lg text-amber-700 hover:bg-amber-100"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
