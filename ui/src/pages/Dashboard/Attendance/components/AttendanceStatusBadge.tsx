import type { AttendanceStatus } from "@/types/attendance"

const CONFIG: Record<AttendanceStatus, { label: string; className: string }> = {
  present: { label: "Present", className: "bg-green-100 text-green-700" },
  absent:  { label: "Absent",  className: "bg-red-100 text-red-600" },
  late:    { label: "Late",    className: "bg-amber-100 text-amber-700" },
  excused: { label: "Excused", className: "bg-blue-100 text-blue-700" },
}

export function AttendanceStatusBadge({ status }: { status: AttendanceStatus }) {
  const { label, className } = CONFIG[status]
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}>
      {label}
    </span>
  )
}
