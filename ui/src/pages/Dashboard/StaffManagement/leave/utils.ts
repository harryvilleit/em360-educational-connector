import {
  HalfDayPeriod,
  LeaveRequestStatus,
  LeaveTransactionType,
  type LeaveRequestDto,
} from "@/api/leaveManagement.api/types"

type StatusLike = LeaveRequestStatus | string | undefined

const STATUS_BY_NAME: Record<string, LeaveRequestStatus> = {
  pending: LeaveRequestStatus.Pending,
  approved: LeaveRequestStatus.Approved,
  rejected: LeaveRequestStatus.Rejected,
  cancelled: LeaveRequestStatus.Cancelled,
  canceled: LeaveRequestStatus.Cancelled,
}

// The backend may serialize enums as numbers or strings.
export function toLeaveStatus(status: StatusLike): LeaveRequestStatus {
  if (typeof status === "number") return status
  return STATUS_BY_NAME[String(status ?? "").toLowerCase()] ?? 0
}

export const LEAVE_STATUS_LABEL: Record<LeaveRequestStatus, string> = {
  [LeaveRequestStatus.Pending]: "Pending",
  [LeaveRequestStatus.Approved]: "Approved",
  [LeaveRequestStatus.Rejected]: "Rejected",
  [LeaveRequestStatus.Cancelled]: "Cancelled",
}

export function toHalfDayPeriod(
  period: HalfDayPeriod | string | undefined
): HalfDayPeriod {
  if (typeof period === "number") return period
  const p = String(period ?? "").toLowerCase()
  if (p === "morning") return HalfDayPeriod.Morning
  if (p === "afternoon") return HalfDayPeriod.Afternoon
  return HalfDayPeriod.None
}

// Dates are plain YYYY-MM-DD strings; parse as local to avoid UTC day shifts.
export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

export function toIsoDate(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${m}-${d}`
}

const dayMonth = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
})
const dayMonthYear = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

export function formatLeaveRange(start: string, end: string): string {
  const s = parseIsoDate(start)
  const e = parseIsoDate(end)
  if (start.slice(0, 10) === end.slice(0, 10)) return dayMonthYear.format(s)
  return `${dayMonth.format(s)} – ${dayMonthYear.format(e)}`
}

export function formatLeaveDate(iso: string): string {
  return dayMonthYear.format(parseIsoDate(iso))
}

export function formatTimeRange(start: string, end: string): string {
  return `${start.slice(0, 5)} – ${end.slice(0, 5)}`
}

export function formatDays(days: number): string {
  return `${days} ${days === 1 ? "day" : "days"}`
}

export function canCancelLeave(request: LeaveRequestDto): boolean {
  const status = toLeaveStatus(request.status)
  if (status === LeaveRequestStatus.Pending) return true
  return (
    status === LeaveRequestStatus.Approved &&
    parseIsoDate(request.startDate) > new Date()
  )
}

const LEAVE_TYPE_COLORS = [
  "#4F46E5",
  "#F59E0B",
  "#EC4899",
  "#10B981",
  "#0EA5E9",
  "#8B5CF6",
  "#EF4444",
  "#14B8A6",
]

// The API has no colour field, so a stable colour is derived from the leave type id.
export function leaveTypeColor(key: string): string {
  let hash = 0
  for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return LEAVE_TYPE_COLORS[hash % LEAVE_TYPE_COLORS.length]
}

export const TRANSACTION_LABEL: Record<LeaveTransactionType, string> = {
  [LeaveTransactionType.AnnualAllocation]: "Annual allocation",
  [LeaveTransactionType.LeaveRequested]: "Leave requested",
  [LeaveTransactionType.LeaveApproved]: "Leave approved",
  [LeaveTransactionType.LeaveRejected]: "Leave rejected",
  [LeaveTransactionType.LeaveCancelled]: "Leave cancelled",
  [LeaveTransactionType.ManualAdjustment]: "Manual adjustment",
  [LeaveTransactionType.YearlyRollover]: "Yearly rollover",
  [LeaveTransactionType.Expired]: "Expired",
}
