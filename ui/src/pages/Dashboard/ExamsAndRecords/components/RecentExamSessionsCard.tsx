import { Skeleton } from "@/components/ui/skeleton"

type RecentActivityItem = {
  id: string
  title: string
  subtitle: string
  timeAgo: string
}

type RecentExamSessionsCardProps = {
  isLoadingOverview: boolean
  isError: boolean
  recentActivity: RecentActivityItem[]
  onRetry: () => void
}

export function RecentExamSessionsCard({
  isLoadingOverview,
  isError,
  recentActivity,
  onRetry,
}: RecentExamSessionsCardProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white">
      <div className="border-b border-gray-100 px-6 py-4">
        <p className="font-semibold text-gray-900">Recent Exam Sessions</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Latest academic examinations held
        </p>
      </div>
      <div className="px-6 py-4">
        <div className="space-y-3">
          {isLoadingOverview ? (
            <Skeleton className="h-75 w-full" />
          ) : isError ? (
            <p className="text-sm text-muted-foreground">
              Recent activity is unavailable.
            </p>
          ) : recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No recent activity for this period.
            </p>
          ) : null}
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between border-b border-gray-50 py-2 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <p className="text-xs text-muted-foreground">{activity.subtitle}</p>
              </div>
              <p className="text-xs text-muted-foreground">{activity.timeAgo}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
