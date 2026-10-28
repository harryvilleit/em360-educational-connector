import { GraduationCap, UserCheck, UserX, Users } from "lucide-react"
import { StatCard, type StatCardProps } from "@/components/general/StatCard"
import type { StudentDashboardOverviewI } from "@/api/studentPortal.api/types"

interface StudentStatsProps {
  overview?: StudentDashboardOverviewI
}

export function StudentStats({ overview }: StudentStatsProps) {
  const total = overview?.totalStudents ?? 0
  const active = overview?.activeStudents ?? 0
  const suspended = overview?.suspendedStudents ?? 0
  const graduated = overview?.graduatedStudents ?? 0
  const withdrawn = overview?.withdrawnStudents ?? 0

  const stats: StatCardProps[] = [
    {
      label: "Total Students",
      value: total,
      icon: Users,
      color: "blue",
    },
    {
      label: "Active",
      value: active,
      icon: UserCheck,
      color: "emerald",
      meta: total ? `${Math.round((active / total) * 100)}% of total` : undefined,
      metaType: "up",
    },
    {
      label: "Suspended",
      value: suspended,
      icon: UserX,
      color: "red",
      meta: suspended > 0 ? "Needs attention" : "None",
      metaType: suspended > 0 ? "down" : "neutral",
    },
    {
      label: "Graduated",
      value: graduated,
      icon: GraduationCap,
      color: "indigo",
      meta: `${withdrawn} withdrawn`,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  )
}
