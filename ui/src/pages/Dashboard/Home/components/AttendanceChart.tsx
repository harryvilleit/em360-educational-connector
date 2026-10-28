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

import { ChartCard } from "@/components/charts/ChartCard"
import type { WeeklyAttendance } from "@/types/schoolOverview"

export default function AttendanceChart({
  attendance,
}: {
  attendance: WeeklyAttendance
}) {
  return (
    <ChartCard
      title="Weekly Attendance"
      subtitle="Overall student attendance this week"
      action={
        <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
          {attendance.weekLabel}
        </span>
      }
    >
      {attendance.days.length === 0 ? (
        <p className="py-20 text-center text-sm text-muted-foreground">
          No attendance recorded for this week.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={attendance.days} barSize={18} barGap={4}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f0f0f0"
              vertical={false}
            />
            <XAxis
              dataKey="dayName"
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip cursor={{ fill: "#f9fafb" }} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
            />
            <Bar
              dataKey="presentCount"
              fill="#2563eb"
              radius={[6, 6, 0, 0]}
              name="Present"
            />
            <Bar
              dataKey="absentCount"
              fill="#e0e7ff"
              radius={[6, 6, 0, 0]}
              name="Absent"
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}
