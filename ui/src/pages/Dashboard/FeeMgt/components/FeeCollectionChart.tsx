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
import { ChartCard } from "@/components/charts/ChartCard"
import type { FeeOverviewCollectionTrendPointI } from "@/api/feeManagement.api/types"
import { useSchoolMoney } from "@/hooks/useSchoolMoney"
import FeeCollectionTooltip from "./FeeCollectionTooltip"

interface FeeCollectionChartProps {
  trend: FeeOverviewCollectionTrendPointI[]
  isLoading?: boolean
  isError?: boolean
}

export default function FeeCollectionChart({
  trend,
  isLoading,
  isError,
}: FeeCollectionChartProps) {
  const { formatMoney } = useSchoolMoney()
  return (
    <ChartCard
      title="Collection Trend"
      subtitle="Collected vs outstanding by month"
      className="h-full"
    >

      {isLoading ? (
        <div className="flex h-85 items-center justify-center text-sm text-muted-foreground">
          Loading trend...
        </div>
      ) : isError || trend.length === 0 ? (
        <div className="flex h-85 items-center justify-center text-sm text-muted-foreground">
          {isError
            ? "Unable to load collection data"
            : "No collection data yet"}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={340}>
          <AreaChart data={trend}>
            <defs>
              <linearGradient id="collected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="outstanding" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f0f0f0"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => formatMoney(Number(v))}
            />
            <Tooltip content={<FeeCollectionTooltip formatMoney={formatMoney} />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
            />
            <Area
              type="monotone"
              dataKey="collected"
              name="Collected"
              stroke="#2563eb"
              strokeWidth={2}
              fill="url(#collected)"
              dot={{ r: 4, fill: "#2563eb" }}
            />
            <Area
              type="monotone"
              dataKey="outstanding"
              name="Outstanding"
              stroke="#ef4444"
              strokeWidth={2}
              fill="url(#outstanding)"
              dot={{ r: 4, fill: "#ef4444" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}
