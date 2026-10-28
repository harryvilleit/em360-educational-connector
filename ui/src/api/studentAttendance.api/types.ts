// tsconfig has erasableSyntaxOnly on — no `enum` keyword. Const-object +
// derived type instead, same pattern as the rest of this codebase.
export const AttendanceStatus = {
  Present: 1,
  Absent: 2,
  Late: 3,
  Excused: 4,
} as const

export type AttendanceStatusValue =
  (typeof AttendanceStatus)[keyof typeof AttendanceStatus]

export function isAttendanceStatusValue(
  value: unknown
): value is AttendanceStatusValue {
  return (
    value === AttendanceStatus.Present ||
    value === AttendanceStatus.Absent ||
    value === AttendanceStatus.Late ||
    value === AttendanceStatus.Excused
  )
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface GetAttendanceDashboardParamsI {
  schoolId: string
  attendanceDate?: string
  schoolSessionId?: string
  schoolSessionTermId?: string
}

export interface PendingClassI {
  schoolClassId: string
  schoolClassName: string
  studentCount: number
  statusText: string
}

export interface ClassAttendanceSummaryI {
  sessionId: string
  schoolClassId: string
  schoolClassName: string
  totalStudents: number
  presentCount: number
  absentCount: number
  lateCount: number
  excusedCount: number
  presentPercentage: number
  dateMarked: string
}

export interface StudentAttendanceDashboardI {
  schoolId: string
  attendanceDate: string
  formattedDate: string

  totalStudents: number
  presentToday: number
  absentToday: number

  markedClassesCount: number
  totalClassesCount: number
  classesMarkedText: string

  classesNotYetMarked: PendingClassI[]
  todaysSummary: ClassAttendanceSummaryI[]
}

// Every other endpoint in this app is normalized through normalizeResponse()
// into {isSuccess, value} — matching that convention here rather than the
// {code, status, data} shape sometimes described in specs, since that's been
// wrong before (Student/GetById) when checked against the live response.
export interface GetAttendanceDashboardResponseI {
  isSuccess: boolean
  message?: string
  error?: string
  isFailure?: boolean
  value: StudentAttendanceDashboardI
}

// ─── Roster ──────────────────────────────────────────────────────────────────

export interface GetClassAttendanceRosterParamsI {
  schoolClassId: string
  schoolId: string
  attendanceDate?: string
  schoolSessionId?: string
  schoolSessionTermId?: string
}

export interface StudentRosterItemI {
  studentId: string
  studentSchoolId: string
  studentGivenId: string
  fullName: string
  profilePicture: string | null

  status: AttendanceStatusValue
  statusName: string

  remarks: string | null
}

export interface ClassAttendanceRosterI {
  schoolClassId: string
  schoolClassName: string

  attendanceDate: string
  formattedDate: string

  schoolSessionId: string | null
  schoolSessionTermId: string | null

  totalStudents: number

  presentCount: number
  absentCount: number
  lateCount: number
  excusedCount: number

  presentPercentage: number

  students: StudentRosterItemI[]
}

export interface GetClassAttendanceRosterResponseI {
  isSuccess: boolean
  message?: string
  error?: string
  isFailure?: boolean
  value: ClassAttendanceRosterI
}

// ─── Save ────────────────────────────────────────────────────────────────────

export interface SaveAttendanceItemPayloadI {
  studentId: string
  status: AttendanceStatusValue
  remarks?: string | null
}

export interface SaveStudentAttendancePayloadI {
  schoolId: string
  schoolClassId: string

  schoolArmId?: string | null

  schoolSessionId?: string | null
  schoolSessionTermId?: string | null

  attendanceDate?: string | null

  items: SaveAttendanceItemPayloadI[]
}

export interface SaveStudentAttendanceResponseI {
  isSuccess: boolean
  message?: string
  error?: string
  isFailure?: boolean
  statusCode?: number
}

// ─── Student history (staff, student-self, or linked guardian) ───────────────
export interface GetStudentAttendanceHistoryParamsI {
  studentId: string
  schoolId: string
  schoolClassId?: string
  schoolSessionId?: string
  schoolSessionTermId?: string
  startDate?: string
  endDate?: string
}

export interface StudentAttendanceHistoryRecordI {
  recordId: string
  sessionHeaderId: string
  attendanceDate: string
  formattedDate: string
  schoolClassId: string
  schoolClassName: string
  schoolSessionId?: string | null
  sessionName?: string | null
  schoolSessionTermId?: string | null
  termName?: string | null
  status: AttendanceStatusValue
  statusName: string
  remarks?: string | null
}

export interface StudentAttendanceHistoryI {
  studentId: string
  studentGivenId: string
  studentName: string
  schoolId: string
  schoolName: string
  currentClassId?: string | null
  currentClassName?: string | null
  totalDaysMarked: number
  presentDays: number
  absentDays: number
  lateDays: number
  excusedDays: number
  attendancePercentage: number
  records: StudentAttendanceHistoryRecordI[]
}

export interface GetStudentAttendanceHistoryResponseI {
  isSuccess: boolean
  message?: string
  error?: string
  value: StudentAttendanceHistoryI
}
