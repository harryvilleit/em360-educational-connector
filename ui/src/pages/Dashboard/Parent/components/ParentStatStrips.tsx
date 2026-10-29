import { memo } from "react"
import { Users, UsersRound, ShieldCheck, DoorOpen } from "lucide-react"
import { StatCard, type StatColor } from "@/components/general/StatCard"
import type { ParentStat } from "@/hooks/useParentsOverview"


interface ParentStatsStripProps {
  stats: ParentStat[]
}

const iconByLabel: Record<string, typeof Users> = {
  "Total parents": Users,
  "Linked children": UsersRound,
  "Pending consent": ShieldCheck,
  "Visit requests": DoorOpen,
}

const colorByLabel: Record<string, StatColor> = {
  "Total parents": "blue",
  "Linked children": "purple",
  "Pending consent": "violet",
  "Visit requests": "amber",
}

export const ParentStatsStrip = memo(function ParentStatsStrip({
  stats,
}: ParentStatsStripProps) {
  return (
    <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <StatCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          icon={iconByLabel[stat.label]}
          color={stat.highlight ? "orange" : (colorByLabel[stat.label] ?? "gray")}
          valueColor={stat.highlight ? "text-orange-600" : "text-gray-900"}
        />
      ))}
    </div>
  )
})
