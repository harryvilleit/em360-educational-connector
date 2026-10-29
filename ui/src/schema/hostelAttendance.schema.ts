// Backend enum: 1 = Morning, 2 = Evening, 3 = Night.
export const ATTENDANCE_PERIOD_OPTIONS = [
  { value: 1, label: "Morning" },
  { value: 2, label: "Evening" },
  { value: 3, label: "Night" },
] as const

export function attendancePeriodLabel(period: number): string {
  return (
    ATTENDANCE_PERIOD_OPTIONS.find((o) => o.value === period)?.label ??
    "Unknown"
  )
}

type StatusVariant = "success" | "danger" | "warning" | "info"

// Backend enum: 1 = Present, 2 = Absent, 3 = Late, 4 = Excused.
export const ATTENDANCE_STATUS_OPTIONS: {
  value: number
  label: string
  variant: StatusVariant
  color: string
}[] = [
  {
    value: 1,
    label: "Present",
    variant: "success",
    color:
      "bg-green-100 text-green-700 border-green-300 data-[active=true]:bg-green-600 data-[active=true]:text-white",
  },
  {
    value: 2,
    label: "Absent",
    variant: "danger",
    color:
      "bg-red-100 text-red-700 border-red-300 data-[active=true]:bg-red-600 data-[active=true]:text-white",
  },
  {
    value: 3,
    label: "Late",
    variant: "warning",
    color:
      "bg-orange-100 text-orange-700 border-orange-300 data-[active=true]:bg-orange-500 data-[active=true]:text-white",
  },
  {
    value: 4,
    label: "Excused",
    variant: "info",
    color:
      "bg-blue-100 text-blue-700 border-blue-300 data-[active=true]:bg-blue-600 data-[active=true]:text-white",
  },
]

export const ATTENDANCE_STATUS = {
  Present: 1,
  Absent: 2,
  Late: 3,
  Excused: 4,
} as const

export function attendanceStatusLabel(status: number): string {
  return (
    ATTENDANCE_STATUS_OPTIONS.find((o) => o.value === status)?.label ??
    "Unknown"
  )
}

export function attendanceStatusVariant(status: number): StatusVariant {
  return (
    ATTENDANCE_STATUS_OPTIONS.find((o) => o.value === status)?.variant ??
    "info"
  )
}
