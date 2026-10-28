import { Users2 } from "lucide-react"
import type { SubUserItem } from "@/api/userMgt.api/types"

function statusColor(status: string) {
  if (status === "Active") return "bg-green-50 text-green-700"
  if (status === "Pending") return "bg-amber-50 text-amber-700"
  return "bg-red-50 text-red-600"
}

export function RecentlyAddedUsersCard({
  recentUsers,
  onViewAll,
}: {
  recentUsers: SubUserItem[]
  onViewAll: () => void
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <p className="font-semibold text-gray-900">Recently Added Users</p>
        <button
          onClick={onViewAll}
          className="text-xs font-medium text-blue-600 hover:underline"
        >
          View all
        </button>
      </div>
      {recentUsers.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <Users2 className="size-8 text-gray-300" />
          <p className="text-sm text-muted-foreground">No users yet</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {recentUsers.map((user) => {
            const initials =
              `${user.FirstName[0]}${user.LastName[0]}`.toUpperCase()
            const jobRole = user.JobRoles[0]?.JobRoleName ?? "—"
            return (
              <div
                key={user.SubUserId}
                className="flex items-center gap-3 px-5 py-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {user.FirstName} {user.LastName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {jobRole}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusColor(user.Status || user.status || "")}`}
                >
                  {user.Status || user.status || "0"}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
