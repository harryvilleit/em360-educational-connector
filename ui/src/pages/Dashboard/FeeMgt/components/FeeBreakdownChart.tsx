/* eslint-disable @typescript-eslint/no-explicit-any */
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import type { FeeOverviewLevelBreakdownI } from "@/api/feeManagement.api/types"
import { useSchoolMoney } from "@/hooks/useSchoolMoney"

const LEVEL_COLORS = ["#bfdbfe", "#60a5fa", "#2563eb", "#1e3a8a", "#1e293b"]

const CustomTooltip = ({ active, payload, formatMoney }: any) => {
  if (active && payload?.length) {
    const d = payload[0].payload as FeeOverviewLevelBreakdownI
    return (
      <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm shadow-sm">
        <p className="font-semibold text-gray-700">{d.level}</p>
        <p className="font-bold text-blue-600">
          {formatMoney(d.totalCollected)}
        </p>
        <p className="text-gray-400">
          of {formatMoney(d.totalExpected)} target
        </p>
        <p className="text-xs text-gray-500">
          {d.collectionRatePercent}% collected
        </p>
      </div>
    )
  }
  return null
}

interface FeeBreakdownChartProps {
  byLevel: FeeOverviewLevelBreakdownI[]
  collectionRatePercent: number
  isLoading?: boolean
  isError?: boolean
}

export default function FeeBreakdownChart({
  byLevel,
  collectionRatePercent,
  isLoading,
  isError,
}: FeeBreakdownChartProps) {
  const { formatMoney } = useSchoolMoney()

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6">
      <div className="mb-5">
        <h2 className="text-base font-bold text-gray-900">By Academic Level</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Collection rate per level
        </p>
      </div>

      {isLoading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Loading breakdown...
        </p>
      ) : isError || byLevel.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          {isError
            ? "Unable to load level breakdown"
            : "No level breakdown yet"}
        </p>
      ) : (
        <>
          {/* Donut */}
          <div className="relative mx-auto w-fit">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={byLevel}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={3}
                  dataKey="totalCollected"
                  stroke="none"
                >
                  {byLevel.map((entry, i) => (
                    <Cell
                      key={entry.level}
                      fill={LEVEL_COLORS[i % LEVEL_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={<CustomTooltip formatMoney={formatMoney} />}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Centre label */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-gray-900">
                {collectionRatePercent}%
              </span>
              <span className="text-[10px] text-muted-foreground">
                collected
              </span>
            </div>
          </div>

          {/* Per-level breakdown */}
          <div className="mt-5 space-y-3">
            {byLevel.map((item, i) => {
              const pct = item.collectionRatePercent
              const color = LEVEL_COLORS[i % LEVEL_COLORS.length]
              return (
                <div key={item.level} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-gray-600">{item.level}</span>
                    </div>
                    <span className="font-semibold text-gray-800">{pct}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, Math.max(0, pct))}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
