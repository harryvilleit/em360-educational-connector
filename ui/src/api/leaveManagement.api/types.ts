import type { ApiResultI } from "@/utils/apiResponse"

export interface LeaveResultI<T> extends ApiResultI {
  value: T
  statusCode?: number
}

export interface LeavePaginatedI<T> {
  items: T[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export const LeaveRequestStatus = {
  Pending: 0,
  Approved: 1,
  Rejected: 2,
  Cancelled: 3,
} as const
export type LeaveRequestStatus =
  (typeof LeaveRequestStatus)[keyof typeof LeaveRequestStatus]

export const HalfDayPeriod = { None: 0, Morning: 1, Afternoon: 2 } as const
export type HalfDayPeriod = (typeof HalfDayPeriod)[keyof typeof HalfDayPeriod]

export const LeaveTransactionType = {
  AnnualAllocation: 1,
  LeaveRequested: 2,
  LeaveApproved: 3,
  LeaveRejected: 4,
  LeaveCancelled: 5,
  ManualAdjustment: 6,
  YearlyRollover: 7,
  Expired: 8,
} as const
export type LeaveTransactionType =
  (typeof LeaveTransactionType)[keyof typeof LeaveTransactionType]

export const WorkingDaysPattern = {
  MondayToFriday: 0,
  MondayToSaturday: 1,
  Custom: 2,
} as const
export type WorkingDaysPattern =
  (typeof WorkingDaysPattern)[keyof typeof WorkingDaysPattern]

export interface LeaveTypeDto {
  id: string
  schoolId: string
  name: string
  code: string
  description?: string | null
  isPaid: boolean
  requiresAttachment: boolean
  attachmentRequiredAfterDays?: number | null
  allowHalfDay: boolean
  status: number
  isActive: boolean
}

export interface LeavePolicyRuleDto {
  id: string
  leavePolicyId: string
  leaveTypeId: string
  leaveTypeName: string
  leaveTypeCode: string
  entitlementDays: number
  carryForwardEnabled: boolean
  maxCarryForwardDays: number
  minimumNoticeDays: number
  maxConsecutiveDays?: number | null
}

export interface LeavePolicyDto {
  id: string
  schoolId: string
  name: string
  schoolJobRoleId?: string | null
  schoolJobRoleName?: string | null
  schoolDepartmentId?: string | null
  schoolDepartmentName?: string | null
  staffCategory?: string | null
  schoolSessionId: string
  schoolSessionName?: string | null
  isDefault: boolean
  rules: LeavePolicyRuleDto[]
}

export interface LeaveWorkingDaysConfigDto {
  schoolId: string
  pattern: WorkingDaysPattern
  monday: boolean
  tuesday: boolean
  wednesday: boolean
  thursday: boolean
  friday: boolean
  saturday: boolean
  sunday: boolean
}

export interface StaffLeaveBalanceDto {
  id: string
  staffSubUserId: string
  staffName: string
  leaveTypeId: string
  leaveTypeName: string
  leaveTypeCode: string
  schoolSessionId: string
  entitledDays: number
  carriedForwardDays: number
  usedDays: number
  pendingDays: number
  availableDays: number
  isPaid: boolean
  allowHalfDay: boolean
  requiresAttachment: boolean
  attachmentRequiredAfterDays?: number | null
}

export interface StaffLeaveBalanceTransactionDto {
  id: string
  staffSubUserId: string
  staffName: string
  leaveTypeId: string
  leaveTypeName: string
  leaveRequestId?: string | null
  transactionType: LeaveTransactionType
  days: number
  balanceBefore: number
  balanceAfter: number
  reason: string
  createdByUserId: string
  dateCreated: string
}

export interface ImpactedClassPeriodDto {
  id: string
  timetableId?: string | null
  timetableSlotId?: string | null
  liveClassId?: string | null
  date: string
  dayOfWeek: string
  startTime: string
  endTime: string
  schoolClassId: string
  schoolClassName: string
  subjectId: string
  subjectName: string
  isOnlineLiveClass: boolean
  assignedReliefStaffSubUserId?: string | null
  assignedReliefStaffName?: string | null
}

export interface LeaveRequestDto {
  id: string
  schoolId: string
  staffSubUserId: string
  staffName: string
  staffEmail: string
  staffRole?: string | null
  staffDepartment?: string | null
  staffAvatarUrl?: string | null
  leaveTypeId: string
  leaveTypeName: string
  leaveTypeCode: string
  startDate: string
  endDate: string
  workingDays: number
  isHalfDay: boolean
  halfDayPeriod: HalfDayPeriod
  halfDayPeriodName: string
  reason: string
  attachmentUrl?: string | null
  status: LeaveRequestStatus
  statusName: string
  reviewedByUserId?: string | null
  reviewedByName?: string | null
  reviewedAtUtc?: string | null
  rejectionReason?: string | null
  cancellationReason?: string | null
  dateCreated: string
  impactedPeriods: ImpactedClassPeriodDto[]
}

export interface AvailableReliefTeacherDto {
  staffSubUserId: string
  staffName: string
  email?: string | null
  role?: string | null
  department?: string | null
}

export interface LeaveRequestDetailDto extends LeaveRequestDto {
  availableReliefTeachers: AvailableReliefTeacherDto[]
}

export interface LeaveCalendarItemDto {
  id: string
  leaveRequestId: string
  staffSubUserId: string
  staffName: string
  staffDepartment?: string | null
  staffRole?: string | null
  leaveTypeId: string
  leaveTypeName: string
  startDate: string
  endDate: string
  workingDays: number
  isHalfDay: boolean
  halfDayPeriod: HalfDayPeriod
  status: LeaveRequestStatus
}

export interface LeaveOverviewDto {
  pendingRequestsCount: number
  activeLeaveTypesCount: number
  approvedDaysThisMonth: number
  staffOnLeaveTodayCount: number
  staffOnLeaveToday: {
    staffSubUserId: string
    staffName: string
    staffAvatarUrl?: string | null
    department?: string | null
    role?: string | null
    leaveTypeName: string
    isHalfDay: boolean
  }[]
}

export interface CalculateLeaveDurationQuery {
  schoolId: string
  leaveTypeId: string
  startDate: string
  endDate: string
  isHalfDay: boolean
  halfDayPeriod?: HalfDayPeriod
}

export interface LeaveDurationCalculationResult {
  calendarDays: number
  workingDays: number
  holidaysCount: number
  weekendDaysCount: number
  availableBalance: number
  hasSufficientBalance: boolean
  hasOverlapWithExistingLeave: boolean
  meetsNoticeRequirement: boolean
  minimumNoticeDaysRequired: number
  attachmentRequired: boolean
  impactedPeriodsCount: number
  impactedPeriods: ImpactedClassPeriodDto[]
  validationErrors: string[]
}

export interface SubmitLeaveRequestCommand {
  schoolId: string
  leaveTypeId: string
  startDate: string
  endDate: string
  isHalfDay: boolean
  halfDayPeriod: HalfDayPeriod
  reason: string
  attachmentUrl?: string | null
}

export interface ReviewLeaveRequestCommand {
  leaveRequestId: string
  schoolId: string
  decision: "Approve" | "Reject"
  rejectionReason?: string
  reliefAssignments?: { impactedPeriodId: string; reliefStaffSubUserId: string }[]
}

export interface CancelLeaveRequestCommand {
  leaveRequestId: string
  schoolId: string
  reason?: string
}

export interface AdjustLeaveBalanceCommand {
  schoolId: string
  staffId: string
  leaveTypeId: string
  adjustmentDays: number
  reason: string
}

export interface SaveLeaveTypeCommand {
  id?: string
  schoolId: string
  name: string
  code: string
  description?: string
  isPaid: boolean
  requiresAttachment: boolean
  attachmentRequiredAfterDays?: number | null
  allowHalfDay: boolean
  isActive: boolean
}

export interface SaveLeavePolicyCommand {
  id?: string
  schoolId: string
  name: string
  schoolJobRoleId?: string | null
  schoolDepartmentId?: string | null
  staffCategory?: string | null
  schoolSessionId: string
  isDefault: boolean
  rules: {
    leaveTypeId: string
    entitlementDays: number
    carryForwardEnabled: boolean
    maxCarryForwardDays: number
    minimumNoticeDays: number
    maxConsecutiveDays?: number | null
  }[]
}

export interface MyLeaveRequestsParamsI {
  schoolId: string
  status?: LeaveRequestStatus
  year?: number
}

export interface AdminLeaveRequestsParamsI {
  schoolId: string
  status?: LeaveRequestStatus
  leaveTypeId?: string
  departmentId?: string
  search?: string
  startDate?: string
  endDate?: string
  pageNumber?: number
  pageSize?: number
}

export interface LeaveCalendarParamsI {
  schoolId: string
  startDate: string
  endDate: string
  departmentId?: string
  leaveTypeId?: string
}

export interface LeaveAuditLedgerParamsI {
  schoolId: string
  staffId?: string
  leaveTypeId?: string
  transactionType?: LeaveTransactionType
  pageNumber?: number
  pageSize?: number
}
