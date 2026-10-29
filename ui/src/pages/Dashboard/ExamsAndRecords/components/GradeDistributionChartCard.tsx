import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

type GradeDistributionItem = {
  grade: string
  count: number
  percentage: number
}

type GradeDistributionChartCardProps = {
  isLoadingOverview: boolean
  isError: boolean
  gradeDistribution: GradeDistributionItem[]
  onRetry: () => void
}

export function GradeDistributionChartCard({
  isLoadingOverview,
  isError,
  gradeDistribution,
  onRetry,
}: GradeDistributionChartCardProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white">
      <div className="border-b border-gray-100 px-6 py-4">
        <h3 className="font-semibold text-gray-900">Grade Distribution (School-wide)</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          All results across all examinations
        </p>
      </div>
      <div className="px-6 py-4">
        {isLoadingOverview ? (
          <Skeleton className="h-75 w-full" />
        ) : isError ? (
          <div className="flex h-75 flex-col items-center justify-center gap-3">
            <p className="text-sm text-muted-foreground">
              Overview data is unavailable.
            </p>
            <Button variant="outline" onClick={onRetry}>
              Try again
            </Button>
          </div>
        ) : gradeDistribution.length === 0 ? (
          <div className="flex h-75 items-center justify-center">
            <p className="text-sm text-muted-foreground">No results for this period.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={gradeDistribution}
                dataKey="count"
                nameKey="grade"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ index }) => {
                  const item = gradeDistribution[index]
                  return item ? `${item.grade} ${item.percentage}%` : ""
                }}
              >
                <Cell fill="#10b981" />
                <Cell fill="#06b6d4" />
                <Cell fill="#3b82f6" />
                <Cell fill="#f59e0b" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip formatter={(value) => `${value} students`} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
