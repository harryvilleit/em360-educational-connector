/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo, useMemo } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { ParentGrowthPoint } from "@/hooks/useParentsOverview"

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload?.length) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm shadow-sm">
        <p className="mb-1 font-semibold text-gray-700">{label}</p>
        <p className="text-blue-600">
          <span className="font-bold">{payload[0].value}</span> new parent
          {payload[0].value === 1 ? "" : "s"}
        </p>
      </div>
    )
  }
  return null
}

interface ParentGrowthChartProps {
  data: ParentGrowthPoint[]
}

export const ParentGrowthChart = memo(function ParentGrowthChart({
  data,
}: ParentGrowthChartProps) {
  const total = useMemo(
    () => data.reduce((sum, d) => sum + d.newParents, 0),
    [data]
  )

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">Parent Growth</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            New parent accounts registered per month
          </p>
        </div>
        <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          {total} in last 6 months
        </span>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="newParents" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="newParents"
            name="New parents"
            stroke="#2563eb"
            strokeWidth={2}
            fill="url(#newParents)"
            dot={{ r: 4, fill: "#2563eb" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
})
