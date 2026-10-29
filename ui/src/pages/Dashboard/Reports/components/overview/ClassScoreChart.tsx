import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ChartCard, ChartEmpty } from "@/components/charts/ChartCard"
import { AXIS, CURSOR, GRID, PRIMARY } from "@/components/charts/chartTheme"
import type { ReportData } from "../../useReportData"
import { useReportPath } from "../../useReportPath"

export function ClassScoreChart({ data }: { data: ReportData }) {
  const to = useReportPath()
  const byClass = data.exam.data?.performanceByClass ?? []

  return (
    <ChartCard
      title="Average Score by Class"
      subtitle="Mean result per class"
      to={to("academic")}
    >
      {byClass.length === 0 ? (
        <ChartEmpty text="No class results yet" />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={byClass} layout="vertical" margin={{ left: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={AXIS} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="className" tick={AXIS} axisLine={false} tickLine={false} width={72} />
            <Tooltip cursor={CURSOR} />
            <Bar
              dataKey="avgScore"
              name="Average score (%)"
              fill={PRIMARY}
              radius={[0, 6, 6, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}
