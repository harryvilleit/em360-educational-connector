import {
  BookOpen,
  GraduationCap,
  TrendingUp,
  Users,
  UsersRound,
  Wallet,
} from "lucide-react"
import { StatCard, type StatCardProps } from "@/components/general/StatCard"
import type { SchoolOverviewKpis } from "@/types/schoolOverview"
const signed = (value: number) => `${value > 0 ? "+" : ""}${value}`
const trend = (value: number) =>
  value > 0 ? "up" : value < 0 ? "down" : "neutral"

const createStats = (kpis: SchoolOverviewKpis): StatCardProps[] => [
  {
    label: "Total Students",
    value: kpis.totalStudents.toLocaleString(),
    meta: `${signed(kpis.studentsThisTermDelta)} this term`,
    metaType: trend(kpis.studentsThisTermDelta),
    icon: GraduationCap,
    color: "blue",
  },
  {
    label: "Total Teachers",
    value: kpis.totalTeachers.toLocaleString(),
    meta: `${signed(kpis.teachersThisTermDelta)} this term`,
    metaType: trend(kpis.teachersThisTermDelta),
    icon: UsersRound,
    color: "indigo",
  },
  {
    label: "Active Parents",
    value: kpis.activeParentsCount.toLocaleString(),
    meta: kpis.activeParentsSubtitle,
    metaType: "neutral",
    icon: Users,
    color: "purple",
  },
  {
    label: "Classes Running",
    value: kpis.classesRunningCount.toLocaleString(),
    meta: kpis.classesRunningSubtitle,
    metaType: "neutral",
    icon: BookOpen,
    color: "cyan",
  },
  {
    label: "Avg. Attendance",
    value: `${kpis.averageAttendancePercentage}%`,
    meta: `${signed(kpis.attendanceVsLastWeekDelta)}% vs last week`,
    metaType: trend(kpis.attendanceVsLastWeekDelta),
    icon: TrendingUp,
    color: "green",
  },
  {
    label: "Fees Collected",
    value:
      kpis.formattedFeesCollected ||
      new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: kpis.currencyCode,
        notation: "compact",
      }).format(kpis.totalFeesCollected),
    meta: `${kpis.feesTargetPercentage}% of target`,
    metaType: "neutral",
    icon: Wallet,
    color: "amber",
  },
]

export default function StatsCards({ kpis }: { kpis: SchoolOverviewKpis }) {
  const stats = createStats(kpis)

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  )
}
