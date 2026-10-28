import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { PALETTE } from "./chartTheme"

export function Donut({
  data,
  nameKey,
  valueKey,
}: {
  data: object[]
  nameKey: string
  valueKey: string
}) {
  const rows = data.map((row, i) => {
    const r = row as Record<string, string | number>
    return {
      name: String(r[nameKey]),
      value: Number(r[valueKey]),
      color: PALETTE[i % PALETTE.length],
    }
  })
  const total = rows.reduce((sum, r) => sum + r.value, 0)

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row xl:flex-col 2xl:flex-row">
      <div className="relative shrink-0">
        <ResponsiveContainer width={160} height={160}>
          <PieChart>
            <Pie
              data={rows}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={72}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {rows.map((r) => (
                <Cell key={r.name} fill={r.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-gray-900">
            {total.toLocaleString()}
          </span>
          <span className="text-[10px] text-muted-foreground">total</span>
        </div>
      </div>
      <div className="w-full flex-1 space-y-3">
        {rows.map((r) => (
          <div key={r.name} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-gray-600">
              <span className="size-2.5 rounded-full" style={{ background: r.color }} />
              {r.name}
            </span>
            <span className="font-semibold text-gray-900">
              {r.value.toLocaleString()}
              <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                {total ? Math.round((r.value / total) * 100) : 0}%
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

