import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ChartCard, ChartEmpty } from "@/components/charts/ChartCard"
import { AXIS, GRID, PRIMARY, SECONDARY } from "@/components/charts/chartTheme"
import { useReportMoney } from "../../useReportMoney"
import type { ReportData } from "../../useReportData"
import { useReportPath } from "../../useReportPath"

function Gradient({ id, color }: { id: string; color: string }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor={color} stopOpacity={0.15} />
      <stop offset="95%" stopColor={color} stopOpacity={0} />
    </linearGradient>
  )
}

export function FeeTrendChart({ data }: { data: ReportData }) {
  const to = useReportPath()
  const { formatMoney, formatCompactMoney } = useReportMoney()
  const trend = data.fee.data?.collectionTrend ?? []

  return (
    <ChartCard
      title="Fee Collection Trend"
      subtitle="Collected vs outstanding by month"
      to={to("financial")}
      className="xl:col-span-2"
    >
      {trend.length === 0 ? (
        <ChartEmpty text="No collection data yet" />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={trend}>
            <defs>
              <Gradient id="rp-collected" color={PRIMARY} />
              <Gradient id="rp-outstanding" color={SECONDARY} />
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={GRID}
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={AXIS}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={AXIS}
              axisLine={false}
              tickLine={false}
              width={64}
              tickFormatter={(v: number) => formatCompactMoney(v)}
            />
            <Tooltip formatter={(v) => formatMoney(Number(v))} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
            />
            <Area
              type="monotone"
              dataKey="collected"
              name="Collected"
              stroke={PRIMARY}
              strokeWidth={2}
              fill="url(#rp-collected)"
            />
            <Area
              type="monotone"
              dataKey="outstanding"
              name="Outstanding"
              stroke={SECONDARY}
              strokeWidth={2}
              fill="url(#rp-outstanding)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}
