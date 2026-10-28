import type { ModuleAccessSummary } from "@/api/userMgt.api/types"

export function ModuleAccessSummaryCard({
  moduleAccessSummary,
}: {
  moduleAccessSummary: ModuleAccessSummary[]
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white">
      <div className="border-b border-gray-100 px-5 py-4">
        <p className="font-semibold text-gray-900">Module Access Summary</p>
        <p className="text-xs text-muted-foreground">
          Number of users with access per module
        </p>
      </div>
      {moduleAccessSummary.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <p className="text-sm text-muted-foreground">No modules configured</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {moduleAccessSummary.map((mod) => (
            <div
              key={mod.ModuleId}
              className="flex items-center justify-between px-5 py-3"
            >
              <p className="text-sm text-gray-700">{mod.ModuleName}</p>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${mod.AccessPercentage}%` }}
                  />
                </div>
                <span className="w-12 text-right text-xs font-medium text-gray-600">
                  {mod.TotalUsersWithAccess} / {mod.TotalSubUsers}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
