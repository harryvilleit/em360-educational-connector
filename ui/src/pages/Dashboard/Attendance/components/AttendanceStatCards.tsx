import { CheckCircle2, XCircle, Clock, AlertCircle, Users } from "lucide-react"
import { StatCard } from "@/components/general/StatCard"
import type { AttendanceStats } from "@/types/attendance"

export function AttendanceStatCards({ stats }: { stats: AttendanceStats }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      <StatCard
        label="Total Students"
        value={stats.total}
        icon={Users}
        color="blue"
      />
      <StatCard
        label="Present"
        value={stats.present}
        icon={CheckCircle2}
        color="green"
        meta={stats.total > 0 ? `${Math.round((stats.present / stats.total) * 100)}%` : undefined}
      />
      <StatCard
        label="Absent"
        value={stats.absent}
        icon={XCircle}
        color="red"
        meta={stats.absent > 0 ? "Needs attention" : "None"}
        metaType={stats.absent > 0 ? "down" : "neutral"}
      />
      <StatCard
        label="Late"
        value={stats.late}
        icon={Clock}
        color="amber"
      />
      <StatCard
        label="Excused"
        value={stats.excused}
        icon={AlertCircle}
        color="indigo"
      />
    </div>
  )
}
