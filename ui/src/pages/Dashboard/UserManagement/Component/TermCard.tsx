import { memo } from "react"
import { CheckCircle2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDate, termBadgeColor } from "@/utils"
import type { SchoolSessionTermItem } from "@/api/userMgt.api/types"

export const TermCard = memo(function TermCard({
  term,
  onSetCurrent,
}: {
  term: SchoolSessionTermItem
  onSetCurrent: (termId: string) => void
}) {
  const start = new Date(term.StartDate)
  const end = new Date(term.EndDate)
  const weeks = Math.round(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7)
  )

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 transition-shadow hover:shadow-md ${
        term.IsCurrent ? "border-green-200 bg-green-50/30" : "border-gray-100 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${termBadgeColor(term.TermName)}`}>
          {term.TermName}
        </span>
        {term.IsCurrent && (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-semibold text-green-700">
            <CheckCircle2 className="size-3" />
            Active
          </span>
        )}
      </div>

      <div className="mt-3 space-y-1.5 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Starts</span>
          <span className="font-medium text-gray-900">{formatDate(term.StartDate, "short") || "—"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Ends</span>
          <span className="font-medium text-gray-900">{formatDate(term.EndDate, "short") || "—"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Duration</span>
          <span className="font-medium text-gray-900">
            {weeks > 0 ? `${weeks} week${weeks !== 1 ? "s" : ""}` : "—"}
          </span>
        </div>
      </div>

      {!term.IsCurrent && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSetCurrent(term.Id)}
          className="mt-3 w-full gap-1.5 rounded-lg border-green-200 text-xs font-medium text-green-600 hover:bg-green-50"
        >
          <Star className="size-3" />
          Set as Active Term
        </Button>
      )}
    </div>
  )
})
