import { PieChart as PieChartIcon, TrendingUp } from "lucide-react"
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"

type Segment = { value: number; color: string; label: string }

function EnrollmentDonut({ segments }: { segments: Segment[] }) {
  const total = segments.reduce((s, x) => s + x.value, 0)
  const data = total > 0 ? segments : [{ value: 1, color: "#f1f5f9", label: "No data" }]

  return (
    <div className="relative h-20 w-20 shrink-0">
      <ResponsiveContainer width={80} height={80}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            innerRadius={23}
            outerRadius={34}
            paddingAngle={total > 0 ? 3 : 0}
            stroke="none"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-gray-800">{total}</span>
      </div>
    </div>
  )
}

interface EnrollmentChartsRowProps {
  statusSegments: Segment[]
  genderSegments: Segment[]
  total: number
  male: number
  female: number
}

export function EnrollmentChartsRow({
  statusSegments,
  genderSegments,
  total,
  male,
  female,
}: EnrollmentChartsRowProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
            <PieChartIcon className="size-4 text-blue-600" />
          </div>
          <p className="text-sm font-semibold text-gray-900">
            Enrollment Status
          </p>
        </div>
        <div className="flex items-center gap-4">
          <EnrollmentDonut segments={statusSegments} />
          <div className="space-y-1.5">
            {statusSegments.map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-xs text-gray-500">{s.label}</span>
                <span className="ml-auto text-xs font-semibold text-gray-800">
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gender split */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-50">
            <TrendingUp className="size-4 text-pink-500" />
          </div>
          <p className="text-sm font-semibold text-gray-900">Gender Split</p>
        </div>
        <div className="flex items-center gap-4">
          <EnrollmentDonut segments={genderSegments} />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-xs text-gray-500">Male</span>
              </div>
              <span className="text-xs font-bold text-gray-800">{male}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-pink-400" />
                <span className="text-xs text-gray-500">Female</span>
              </div>
              <span className="text-xs font-bold text-gray-800">{female}</span>
            </div>
            {total > 0 && (
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-blue-500"
                  style={{ width: `${(male / total) * 100}%` }}
                />
              </div>
            )}
            <p className="text-xs text-gray-400">
              {total > 0
                ? `${Math.round((male / total) * 100)}% male · ${Math.round((female / total) * 100)}% female`
                : "No data"}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
