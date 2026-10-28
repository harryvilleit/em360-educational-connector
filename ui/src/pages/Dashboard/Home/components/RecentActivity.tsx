import {
  BookOpen,
  CreditCard,
  GraduationCap,
  UserPlus,
  UsersRound,
} from "lucide-react"
import { useState } from "react"
import type { SchoolRecentActivity } from "@/types/schoolOverview"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

const activityMeta: Record<
  SchoolRecentActivity["activityType"],
  { icon: React.ElementType; bg: string; color: string }
> = {
  Enrollment: { icon: GraduationCap, bg: "bg-blue-50", color: "text-blue-600" },
  Payment: { icon: CreditCard, bg: "bg-green-50", color: "text-green-600" },
  Results: { icon: BookOpen, bg: "bg-amber-50", color: "text-amber-600" },
  Staff: { icon: UsersRound, bg: "bg-indigo-50", color: "text-indigo-600" },
  Timetable: { icon: UserPlus, bg: "bg-purple-50", color: "text-purple-600" },
}

export default function RecentActivity({
  activities,
}: {
  activities: SchoolRecentActivity[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">Recent Activity</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Latest events across the school
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="text-xs font-medium text-blue-600 hover:underline"
        >
          View all
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Recent Activity</DialogTitle>
            <DialogDescription>
              All activity returned for the selected period.
            </DialogDescription>
          </DialogHeader>
          {activities.length === 0 && (
            <p>No recent activity for this period.</p>
          )}
          {activities.map((activity) => (
            <div key={activity.id} className="border-b py-3">
              <p className="font-medium">{activity.title}</p>
              <p className="text-sm text-muted-foreground">
                {activity.subtitle}
              </p>
              <time
                dateTime={activity.occurredAt}
                className="text-xs text-muted-foreground"
              >
                {activity.timeAgo}
              </time>
            </div>
          ))}
        </DialogContent>
      </Dialog>
      <div className="space-y-4">
        {activities.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No recent activity for this period.
          </p>
        )}
        {activities.slice(0, 5).map((activity) => {
          const meta =
            activityMeta[activity.activityType] ?? activityMeta.Timetable
          return (
            <div key={activity.id} className="flex items-start gap-3">
              {/* Icon */}
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${meta.bg}`}
              >
                <meta.icon className={`size-4 ${meta.color}`} />
              </div>
              {/* Text */}
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-tight font-medium text-gray-800">
                  {activity.title}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {activity.subtitle}
                </p>
              </div>
              {/* Time */}
              <span className="max-w-24 text-right text-[11px] text-muted-foreground">
                {activity.timeAgo}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
