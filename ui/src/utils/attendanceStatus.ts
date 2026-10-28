import {
  AttendanceStatus,
  isAttendanceStatusValue,
} from "@/api/studentAttendance.api/types"
import type { AttendanceStatus as AttendanceStatusKey } from "@/types/attendance"

const STATUS_NAME_TO_KEY: Record<string, AttendanceStatusKey> = {
  present: "present",
  absent: "absent",
  late: "late",
  excused: "excused",
}


export function attendanceStatusToBadgeKey(
  status: unknown,
  statusName?: string | null
): AttendanceStatusKey {
  const byName = statusName && STATUS_NAME_TO_KEY[statusName.trim().toLowerCase()]
  if (byName) return byName

  if (isAttendanceStatusValue(status)) {
    switch (status) {
      case AttendanceStatus.Absent:
        return "absent"
      case AttendanceStatus.Late:
        return "late"
      case AttendanceStatus.Excused:
        return "excused"
      default:
        return "present"
    }
  }

  if (typeof status === "string") {
    const byRaw = STATUS_NAME_TO_KEY[status.trim().toLowerCase()]
    if (byRaw) return byRaw
  }

  return "present"
}
