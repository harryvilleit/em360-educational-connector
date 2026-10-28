import { ChartCard } from "@/components/charts/ChartCard"
import { Donut } from "@/components/charts/Donut"
import type { EnrollmentBreakdown } from "@/types/schoolOverview"

export default function EnrollmentChart({
  enrollment,
}: {
  enrollment: EnrollmentBreakdown
}) {
  const total = enrollment.totalEnrolled
  const data = enrollment.levels.map((level) => ({
    name: level.levelName,
    value: level.studentCount,
  }))
  return (
    <ChartCard
      title="Enrollment Breakdown"
      subtitle="Students by academic level"
      action={
        <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
          {total.toLocaleString()} Total
        </span>
      }
    >
      {data.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No enrollment data available.
        </p>
      ) : (
        <Donut data={data} nameKey="name" valueKey="value" />
      )}
    </ChartCard>
  )
}
