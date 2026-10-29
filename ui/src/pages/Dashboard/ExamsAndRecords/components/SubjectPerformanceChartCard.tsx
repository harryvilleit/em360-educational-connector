import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

type SubjectPerformanceItem = {
  subjectName: string
  avgScore: number
  passRate: number
}

type SubjectPerformanceChartCardProps = {
  isLoadingOverview: boolean
  isError: boolean
  subjectPerformance: SubjectPerformanceItem[]
  onRetry: () => void
}

export function SubjectPerformanceChartCard({
  isLoadingOverview,
  isError,
  subjectPerformance,
  onRetry,
}: SubjectPerformanceChartCardProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white">
      <div className="border-b border-gray-100 px-6 py-4">
        <h3 className="font-semibold text-gray-900">Performance by Subject</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Subject-wise average scores and pass rates
        </p>
      </div>
      <div className="px-6 py-4">
        {isLoadingOverview ? (
          <Skeleton className="h-75 w-full" />
        ) : isError ? (
          <div className="flex h-75 flex-col items-center justify-center gap-3">
            <p className="text-sm text-muted-foreground">Overview data is unavailable.</p>
            <Button variant="outline" onClick={onRetry}>
              Try again
            </Button>
          </div>
        ) : subjectPerformance.length === 0 ? (
          <div className="flex h-75 items-center justify-center">
            <p className="text-sm text-muted-foreground">No results for this period.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subjectPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subjectName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgScore" fill="#8b5cf6" name="Avg Score" />
              <Bar dataKey="passRate" fill="#06b6d4" name="Pass Rate %" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
