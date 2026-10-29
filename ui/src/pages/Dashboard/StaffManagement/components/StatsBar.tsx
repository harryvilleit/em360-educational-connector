import { Ban, UserCheck, UserX, UsersRound } from "lucide-react"
import { StatCard } from "@/components/general/StatCard"

interface StatsBarProps {
  totalStaff: number
  activeCount: number
  inactiveCount: number
  suspendedCount: number
}

export function StatsBar({
  totalStaff,
  activeCount,
  inactiveCount,
  suspendedCount,
}: StatsBarProps) {
  const stats = [
    { label: "Total Staff", value: totalStaff, valueColor: "text-slate-900", icon: UsersRound, color: "blue" as const },
    { label: "Active", value: activeCount, valueColor: "text-emerald-600", icon: UserCheck, color: "emerald" as const },
    { label: "Inactive", value: inactiveCount, valueColor: "text-slate-500", icon: UserX, color: "gray" as const },
    { label: "Suspended", value: suspendedCount, valueColor: "text-amber-600", icon: Ban, color: "amber" as const },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  )
}
