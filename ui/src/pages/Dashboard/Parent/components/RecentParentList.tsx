import { memo } from "react"
import type { RecentParentSummary } from "@/hooks/useParentsOverview"


interface RecentParentsListProps {
  parents: RecentParentSummary[]
  onViewAll: () => void
  onSelectParent: (parentId: string) => void
}

export const RecentParentsList = memo(function RecentParentsList({
  parents,
  onViewAll,
  onSelectParent,
}: RecentParentsListProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/5">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Recently added parents
        </h3>
        <button
          onClick={onViewAll}
          className="text-xs text-blue-600 hover:underline dark:text-blue-400"
        >
          View all
        </button>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-100 dark:divide-white/5">
        {parents.map((parent) => (
          <div
            key={parent.id}
            onClick={() => onSelectParent(parent.id)}
            className="flex cursor-pointer items-center justify-between px-5 py-3.5 transition-colors hover:bg-gray-50 dark:hover:bg-white/2"
          >
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {parent.name}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {parent.numberOfStudents === 1
                    ? "1 child"
                    : `${parent.numberOfStudents} children`}
                </p>
              </div>
            </div>
            <span className="text-[11px] text-gray-400 dark:text-gray-500">
              {parent.createdAt}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
})
