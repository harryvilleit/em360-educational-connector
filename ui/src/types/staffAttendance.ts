import type { GeoCoordinates } from "@/utils/geolocation"
import type { Staff } from "@/pages/Dashboard/StaffManagement/types"

export type StaffAttendanceStatus = "present" | "absent" | "late"
export type SignInPunctuality = "OnTime" | "Late"
export type SignOutPunctuality = "OnTime" | "EarlyLeave"

export interface StaffAttendanceRecord {
  id: string
  staffId: string
  staff: Staff
  date: string
  status: StaffAttendanceStatus
  checkIn?: string
  checkOut?: string
  signInStatus?: SignInPunctuality
  signOutStatus?: SignOutPunctuality
  signInLocation?: GeoCoordinates
  signOutLocation?: GeoCoordinates
}

export interface AttendanceSettings {
  signInTime: string 
  signInGraceMinutes: number
  signOutTime: string 
  signOutGraceMinutes: number
}

export interface ExtraLessonSession {
  id: string
  staffId: string
  staff: Staff
  date: string
  signInAt: string
  signInLocation: GeoCoordinates
  signOutAt?: string
  signOutLocation?: GeoCoordinates
}

export type SummaryGranularity = "weekly" | "monthly"

export interface AttendancePeriodSummary {
  label: string
  startDate: string
  endDate: string
  present: number
  absent: number
  late: number
  total: number
  signInLateCount: number
  signOutEarlyCount: number
  rate: number
}


export interface StaffAttendanceRollup {
  staffId: string
  staff: Staff
  present: number
  absent: number
  late: number
  total: number
  signInLateCount: number
  signOutEarlyCount: number
  rate: number
}



export interface StaffAttendanceSettingsI {
  signInTime: string
  signInCutOffTime: string
  signOutTime: string
  campusLatitude?: number | null
  campusLongitude?: number | null
  campusRadiusMetres: number
  campusConfigured: boolean
  enforceGeofence: boolean
  effectiveFromDate?: string | null
  isScheduled: boolean
}

export interface StaffAttendancePersonI {
  subUserId: string
  userId: string
  name: string
  email: string
  role: string
  department: string
  status: string
}

export interface StaffAttendanceLocationI {
  latitude: number
  longitude: number
  accuracyMetres: number
  distanceMetres?: number | null
  isWithinCampus?: boolean | null
}

export interface StaffAttendanceAuditI {
  id: string
  action: string
  changedByUserId: string
  changedByUserName: string
  reason?: string | null
  changedAtUtc: string
  previousSignInTime?: string | null
  previousSignOutTime?: string | null
  newSignInTime?: string | null
  newSignOutTime?: string | null
}

export type PersistedStaffAttendanceStatus =
  "OnTime" | "Late" | "Absent" | "Upcoming" | "OutsideTerm"

export type PersistedSignInStatus = PersistedStaffAttendanceStatus

export type PersistedSignOutStatus =
  | "OnTime"
  | "EarlyOut"
  | "Pending"
  | "NotApplicable"
  | "Upcoming"
  | "OutsideTerm"

export interface StaffAttendanceRecordI {
  id?: string | null
  staffSubUserId: string
  attendancePolicyVersionId?: string | null
  attendanceDate: string
  dayName: string
  expectedSignInTime: string
  expectedSignOutTime: string
  signInAtUtc?: string | null
  signOutAtUtc?: string | null
  signInTime?: string | null
  signOutTime?: string | null
  signInStatus: PersistedSignInStatus
  signOutStatus: PersistedSignOutStatus
  /** @deprecated Use signInStatus and signOutStatus. */
  status: PersistedStaffAttendanceStatus
  /** @deprecated Use signOutStatus === "EarlyOut". */
  isEarlyOut: boolean
  isManual: boolean
  earlyLeaveReason?: string | null
  notes?: string | null
  signInLocation?: StaffAttendanceLocationI | null
  signOutLocation?: StaffAttendanceLocationI | null
  auditLogs: StaffAttendanceAuditI[]
}

export interface MyStaffAttendanceI {
  schoolDate: string
  schoolTime: string
  isStaff: boolean
  canSignIn: boolean
  signInWindowClosed: boolean
  canSignOut: boolean
  canLeaveEarly: boolean
  settings: StaffAttendanceSettingsI
  staff?: StaffAttendancePersonI | null
  record?: StaffAttendanceRecordI | null
}

export interface StaffAttendanceDailyRowI {
  staff: StaffAttendancePersonI
  record: StaffAttendanceRecordI
}

export interface StaffAttendanceDailyI {
  date: string
  totalStaff: number
  onTimeCount: number
  lateInCount: number
  earlyOutCount: number
  absentCount: number
  staff: StaffAttendanceDailyRowI[]
}

export interface StaffAttendanceWeekI {
  weekNumber: number
  startDate: string
  endDate: string
  days: StaffAttendanceRecordI[]
}

export interface StaffAttendanceTermI {
  termId: string
  termName: string
  startDate: string
  endDate: string
  staff: StaffAttendancePersonI
  settings: StaffAttendanceSettingsI
  weeks: StaffAttendanceWeekI[]
}

export interface StaffAttendanceSettingsPayloadI {
  signInTime: string
  signOutTime: string
  campusLatitude?: number | null
  campusLongitude?: number | null
  campusRadiusMetres: number
  enforceGeofence: boolean
}

export interface StaffAttendancePunchPayloadI extends GeoCoordinates {
  earlyLeaveReason?: string
}

export interface ManualStaffAttendancePayloadI {
  schoolSessionTermId: string
  attendanceDate: string
  signInTime: string
  signOutTime: string
  notes?: string
  reason?: string
}
