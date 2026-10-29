import type { ApiResultI } from "@/utils/apiResponse"

export type ApiResult<T> = ApiResultI & { value: T }
export type AttendanceRiskLevel = "None" | "Low" | "Medium" | "High" | "Critical"
export type AttendanceInterventionStatus = "Open" | "Monitoring" | "Closed"
export type AttendanceActivityType =
  | "ContactHome"
  | "LearnerMeeting"
  | "ParentMeeting"
  | "AttendancePlan"
  | "PastoralSupport"
  | "Monitor"
  | "Review"
  | "LearnerSupportReferral"
  | "SafeguardingReferral"
  | "Other"
export type AttendanceActivityStatus = "Open" | "Completed" | "Cancelled"
export type AttendanceReviewDecision =
  | "ContinuePlan"
  | "AdjustPlan"
  | "MoveToMonitoring"
  | "CloseIntervention"
  | "ReferToLearnerSupport"
  | "ReferToSafeguarding"
export type AttendanceReferralDestination = "LearnerSupport" | "Safeguarding"
export type StudentAttendanceStatus = "Present" | "Absent" | "Late" | "Excused"

export interface AttendanceInterventionAccessI {
  isSchoolMember: boolean
  canViewRisks: boolean
  canManageInterventions: boolean
  canConfigureRules: boolean
  isLimitedToAssignedClasses: boolean
}

export interface AttendanceRiskSettingsI {
  lookbackCalendarDays: number
  minimumMarkedSessions: number
  schoolTargetPercentage: number
  mediumRiskBelowPercentage: number
  highRiskBelowPercentage: number
  criticalRiskBelowPercentage: number
  repeatedLatenessCount: number
  consecutiveAbsenceMediumCount: number
  consecutiveAbsenceHighCount: number
  consecutiveAbsenceCriticalCount: number
  suddenDeclinePercentagePoints: number
  recurringDayPatternCount: number
  detectRepeatedLateness: boolean
  detectConsecutiveAbsence: boolean
  detectSuddenDecline: boolean
  detectMondayFridayPattern: boolean
}

export interface AttendanceRiskFactorI {
  code: string
  title: string
  explanation: string
  weight: number
}

export interface AttendanceRiskQueueItemI {
  studentId: string
  studentSchoolId: string
  studentName: string
  studentGivenId?: string
  profilePicture?: string
  classId?: string
  className?: string
  riskLevel: AttendanceRiskLevel
  riskScore: number
  attendancePercentage: number
  previousAttendancePercentage?: number
  changePercentagePoints?: number
  markedSessions: number
  presentCount: number
  absentCount: number
  lateCount: number
  excusedCount: number
  consecutiveAbsences: number
  riskFactors: AttendanceRiskFactorI[]
  interventionCaseId?: string
  interventionCaseNumber?: string
  interventionStatus?: AttendanceInterventionStatus
  nextReviewDate?: string
}

export interface AttendanceInterventionActivityI {
  id: string
  caseId: string
  studentId?: string
  caseNumber?: string
  studentName?: string
  type: AttendanceActivityType
  status: AttendanceActivityStatus
  title: string
  details: string
  contactMethod?: string
  contactedPerson?: string
  assignedToUserId?: string
  assignedToName?: string
  dueAtUtc?: string
  completedAtUtc?: string
  outcome?: string
  reviewDecision?: AttendanceReviewDecision
  attendancePercentageAtReview?: number
  nextReviewDate?: string
  restrictedReference?: string
  createdByName?: string
  dateCreated: string
}

export interface AttendanceInterventionAuditI {
  id: string
  action: string
  entityType: string
  entityId?: string
  actorName?: string
  summary: string
  dateCreated: string
}

export interface AttendanceInterventionCaseI {
  id: string
  caseNumber: string
  schoolId: string
  studentId: string
  studentSchoolId: string
  studentName: string
  status: AttendanceInterventionStatus
  riskLevelAtOpen: AttendanceRiskLevel
  attendancePercentageAtOpen: number
  targetAttendancePercentage: number
  reason: string
  planSummary?: string
  assignedToUserId?: string
  assignedToName?: string
  openedDate: string
  nextReviewDate?: string
  closedAtUtc?: string
  closureSummary?: string
  openedByName?: string
  activities: AttendanceInterventionActivityI[]
  auditHistory: AttendanceInterventionAuditI[]
}

export interface AttendanceTimelineItemI {
  attendanceDate: string
  status: StudentAttendanceStatus
  remarks?: string
}

export interface AttendanceStudentRiskProfileI {
  risk: AttendanceRiskQueueItemI
  activeIntervention?: AttendanceInterventionCaseI
  attendanceTimeline: AttendanceTimelineItemI[]
  hasActiveLearnerSupport: boolean
  hasRestrictedSafeguardingInvolvement: boolean
}

export interface AttendanceEarlyInterventionDashboardI {
  learnersAssessed: number
  lowRisk: number
  mediumRisk: number
  highRisk: number
  criticalRisk: number
  openInterventions: number
  overdueActions: number
  reviewsDue: number
  priorityLearners: AttendanceRiskQueueItemI[]
  actionQueue: AttendanceInterventionActivityI[]
}

export interface PaginatedAttendanceRisksI {
  items: AttendanceRiskQueueItemI[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface GetAttendanceRisksParamsI {
  schoolId: string
  search?: string
  riskLevel?: AttendanceRiskLevel
  includeNoRisk?: boolean
  schoolSessionId?: string
  schoolSessionTermId?: string
  pageNumber?: number
  pageSize?: number
}

export type UpdateAttendanceRiskSettingsPayloadI = AttendanceRiskSettingsI & {
  schoolId: string
}

export interface OpenAttendanceInterventionPayloadI {
  schoolId: string
  studentId: string
  reason: string
  planSummary?: string
  targetAttendancePercentage: number
  assignedToUserId?: string
  assignedToName?: string
  nextReviewDate?: string
}

export interface AddAttendanceActivityPayloadI {
  schoolId: string
  caseId: string
  type: AttendanceActivityType
  title: string
  details: string
  contactMethod?: string
  contactedPerson?: string
  assignedToUserId?: string
  assignedToName?: string
  dueAtUtc?: string
}

export interface CompleteAttendanceActivityPayloadI {
  schoolId: string
  activityId: string
  status: "Completed" | "Cancelled"
  outcome: string
}

export interface RecordAttendanceReviewPayloadI {
  schoolId: string
  caseId: string
  decision: Exclude<AttendanceReviewDecision, "ReferToLearnerSupport" | "ReferToSafeguarding">
  outcome: string
  nextReviewDate?: string
}

export interface ReferAttendanceInterventionPayloadI {
  schoolId: string
  caseId: string
  destination: AttendanceReferralDestination
  reason: string
}

export interface CloseAttendanceInterventionPayloadI {
  schoolId: string
  caseId: string
  closureSummary: string
}
