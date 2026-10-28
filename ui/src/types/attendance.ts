export type AttendanceStatus = "present" | "absent" | "late" | "excused"

export interface AttendanceStats {
  present: number
  absent: number
  late: number
  excused: number
  total: number
  rate: number
}
