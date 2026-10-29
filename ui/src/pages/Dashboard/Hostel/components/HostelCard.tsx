/* eslint-disable @typescript-eslint/no-explicit-any */
import { Building2 } from "lucide-react"
import { Link } from "react-router"
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

const OCCUPIED_COLOR = "#9333ea"
const AVAILABLE_COLOR = "#16a34a"
const EMPTY_COLOR = "#e5e7eb"

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    const d = payload[0].payload
    return (
      <div className="rounded-xl border border-gray-100 bg-white px-3 py-2 text-xs shadow-sm">
        <p className="flex items-center gap-1.5 font-semibold text-gray-700">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: d.color }}
          />
          {d.name}
        </p>
        <p className="font-bold text-gray-900">{d.value} beds</p>
      </div>
    )
  }
  return null
}

export function HostelCard({
  hostel,
  stats,
  toRooms,
}: {
  hostel: { name: string; gender: "male" | "female" }
  stats: {
    totalCapacity: number
    occupied: number
    available: number
    percentageUsed: number
  }
  toRooms: string
}) {
  const isBoys = hostel.gender === "male"
  const hasBeds = stats.totalCapacity > 0
  const pct = hasBeds ? Math.min(Math.round(stats.percentageUsed), 100) : 0
  const pctColor = !hasBeds
    ? "text-gray-400"
    : pct >= 100
      ? "text-red-600"
      : pct >= 80
        ? "text-orange-600"
        : "text-green-600"

  const donutData = hasBeds
    ? [
        { name: "Occupied", value: stats.occupied, color: OCCUPIED_COLOR },
        { name: "Available", value: stats.available, color: AVAILABLE_COLOR },
      ]
    : [{ name: "No beds yet", value: 1, color: EMPTY_COLOR }]

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${
              isBoys ? "bg-blue-100" : "bg-pink-100"
            }`}
          >
            <Building2
              className={`h-4 w-4 ${isBoys ? "text-blue-600" : "text-pink-600"}`}
            />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{hostel.name}</p>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                isBoys
                  ? "bg-blue-100 text-blue-700"
                  : "bg-pink-100 text-pink-700"
              }`}
            >
              {isBoys ? "Boys" : "Girls"}
            </span>
          </div>
        </div>
        <Link
          to={toRooms}
          className="text-xs font-medium text-blue-600 hover:underline"
        >
          View Rooms
        </Link>
      </div>

      {/* Donut + breakdown */}
      <div className="mt-4 flex items-center gap-5">
        <div className="relative h-28 w-28 shrink-0">
          <ResponsiveContainer width={112} height={112}>
            <PieChart>
              <Pie
                data={donutData}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={55}
                paddingAngle={hasBeds ? 3 : 0}
                stroke="none"
              >
                {donutData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              {hasBeds && <Tooltip content={<CustomTooltip />} />}
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-xl font-bold ${pctColor}`}>
              {hasBeds ? `${pct}%` : "0%"}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {hasBeds ? "occupied" : "no beds"}
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: OCCUPIED_COLOR }}
              />
              <span className="text-xs text-gray-500">Occupied</span>
            </div>
            <span className="text-sm font-bold text-gray-900">
              {stats.occupied}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: AVAILABLE_COLOR }}
              />
              <span className="text-xs text-gray-500">Available</span>
            </div>
            <span className="text-sm font-bold text-gray-900">
              {stats.available}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 pt-2">
            <span className="text-xs text-gray-400">Total Beds</span>
            <span className="text-sm font-bold text-gray-900">
              {stats.totalCapacity}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
