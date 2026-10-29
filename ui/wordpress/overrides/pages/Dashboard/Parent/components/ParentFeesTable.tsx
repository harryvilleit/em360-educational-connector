import { FeesRow } from "@/pages/Dashboard/Parent/components/FeesRow"
import type { SchoolParentItemI } from "@/api/guardian.api/types"

const TABLE_HEADERS = [
  "Parent",
  "Children",
  "Total",
  "Paid",
  "Outstanding",
  "Status",
  "",
]

export function ParentFeesTable({
  parents,
  schoolId,
  sessionId,
  termId,
  classId,
  onView,
}: {
  parents: SchoolParentItemI[]
  schoolId: string
  sessionId: string
  termId?: string
  classId?: string
  onView: (guardianId: string) => void
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3">
      <div className="hidden grid-cols-[1fr_90px_110px_110px_120px_110px_40px] gap-4 border-b border-gray-100 bg-gray-50 px-5 py-3 lg:grid dark:border-white/5 dark:bg-white/2">
        {TABLE_HEADERS.map((h) => (
          <p
            key={h}
            className="text-xs font-medium text-gray-500 dark:text-gray-400"
          >
            {h}
          </p>
        ))}
      </div>

      {parents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-medium text-gray-500">
            No matching parents
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Try a different search term.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-white/5">
          {parents.map((parent) => (
            <FeesRow
              key={parent.guardianId}
              parent={parent}
              schoolId={schoolId}
              sessionId={sessionId}
              termId={termId}
              classId={classId}
              onView={onView}
            />
          ))}
        </div>
      )}
    </div>
  )
}
