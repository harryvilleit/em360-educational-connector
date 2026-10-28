import type { ApiResultI } from "@/utils/apiResponse"

export type LearnerSupportCaseStatus =
  | "Draft"
  | "Submitted"
  | "UnderTriage"
  | "Assessing"
  | "SupportPlanActive"
  | "ReviewDue"
  | "StatutoryAssessment"
  | "StatutoryPlanActive"
  | "Monitoring"
  | "Closed"

export type LearnerSupportReferralSource =
  | "Teacher"
  | "ParentOrGuardian"
  | "Learner"
  | "HealthProfessional"
  | "ExternalProfessional"
  | "SchoolLeadership"
  | "Other"

export type LearnerSupportPlanStatus = "Draft" | "Published" | "Superseded"
export type ProvisionDeliveryStatus = "Delivered" | "Missed" | "Rescheduled" | "Cancelled"
export type LearnerSupportReviewDecision =
  | "ContinueUnchanged"
  | "AmendPlan"
  | "AddOrRemoveProvision"
  | "MoveToMonitoring"
  | "CloseSupport"
  | "RequestStatutoryAssessment"
  | "UpdateStatutoryPlan"
export type LearnerSupportContributionType =
  | "Learner"
  | "ParentOrGuardian"
  | "Teacher"
  | "SupportStaff"
  | "ExternalProfessional"
  | "CaseManager"
export type LearnerSupportAdjustmentCategory =
  | "Teaching"
  | "Assessment"
  | "Communication"
  | "Environment"
  | "Timetable"
  | "ELearning"
  | "LiveClass"
  | "Other"
export type LearnerSupportAdjustmentScope =
  | "Classroom"
  | "Assessment"
  | "ELearning"
  | "LiveClass"
  | "Timetable"
  | "AllLearning"
export type LearnerSupportDocumentCategory =
  | "ReferralEvidence"
  | "Assessment"
  | "SupportPlan"
  | "ReviewEvidence"
  | "ProfessionalReport"
  | "LearnerVoice"
  | "ParentContribution"
  | "Other"

export interface LearnerSupportCaseListI {
  id: string
  caseNumber: string
  schoolId: string
  studentId: string
  studentSchoolId: string
  studentName: string
  studentGivenId?: string
  className?: string
  profilePicture?: string
  status: LearnerSupportCaseStatus
  referralSource: LearnerSupportReferralSource
  isOnRegister: boolean
  immediateSafetyConcern: boolean
  caseOwnerName?: string
  nextReviewDate?: string
  dateCreated: string
  dateModified: string
}

export interface ProvisionLogI {
  id: string
  deliveryDate: string
  status: ProvisionDeliveryStatus
  actualDurationMinutes: number
  outcomeRating?: number
  notes?: string
  evidenceUrl?: string
  deliveredByName?: string
  dateCreated: string
}

export interface LearnerSupportProvisionI {
  id: string
  title: string
  description?: string
  frequency: string
  durationMinutes: number
  deliveryType?: string
  assignedUserId?: string
  assignedUserName?: string
  estimatedCost: number
  successMeasure?: string
  isActive: boolean
  deliveryLogs: ProvisionLogI[]
}

export interface LearnerSupportPlanI {
  id: string
  version: number
  status: LearnerSupportPlanStatus
  title: string
  needs: string
  outcomes: string
  parentAndLearnerViews?: string
  successCriteria?: string
  startDate: string
  endDate?: string
  reviewDate: string
  createdByName?: string
  publishedAtUtc?: string
  dateCreated: string
  provisions: LearnerSupportProvisionI[]
}

export interface LearnerSupportAdjustmentI {
  id: string
  category: LearnerSupportAdjustmentCategory
  scope: LearnerSupportAdjustmentScope
  title: string
  description: string
  extraTimeMinutes?: number
  allowRestBreaks: boolean
  allowVoiceResponse: boolean
  requireCaptions: boolean
  isActive: boolean
  effectiveFrom: string
  effectiveTo?: string
  approvedByName?: string
}

export interface LearnerSupportReviewI {
  id: string
  learnerSupportPlanId?: string
  reviewDate: string
  progressSummary: string
  learnerContribution?: string
  parentContribution?: string
  staffContribution?: string
  decision: LearnerSupportReviewDecision
  decisionReason: string
  nextReviewDate?: string
  completedByName?: string
  dateCreated: string
}

export interface LearnerSupportContributionI {
  id: string
  learnerSupportReviewId?: string
  contributorType: LearnerSupportContributionType
  contributorName?: string
  content: string
  attachmentUrl?: string
  voiceNoteUrl?: string
  isSharedWithFamily: boolean
  dateCreated: string
}

export interface LearnerSupportDocumentI {
  id: string
  category: LearnerSupportDocumentCategory
  title: string
  fileName: string
  fileUrl: string
  version: number
  isVisibleToFamily: boolean
  uploadedByName?: string
  dateCreated: string
}

export interface LearnerSupportAuditI {
  id: string
  action: string
  entityType: string
  entityId?: string
  actorName?: string
  summary: string
  dateCreated: string
}

export interface LearnerSupportCaseDetailI extends LearnerSupportCaseListI {
  jurisdictionCode: string
  statutoryPlanType?: string
  strengths: string
  concern: string
  impact?: string
  strategiesTried?: string
  triageDecisionReason?: string
  supportSummary?: string
  communicationPreferences?: string
  triggers?: string
  effectiveStrategies?: string
  learnerVoice?: string
  parentVoice?: string
  caseOwnerUserId?: string
  submittedByUserId: string
  submittedByName?: string
  submittedAtUtc?: string
  plans: LearnerSupportPlanI[]
  adjustments: LearnerSupportAdjustmentI[]
  reviews: LearnerSupportReviewI[]
  contributions: LearnerSupportContributionI[]
  documents: LearnerSupportDocumentI[]
  auditHistory: LearnerSupportAuditI[]
}

export interface LearnerSupportDashboardI {
  openReferrals: number
  learnersOnRegister: number
  activePlans: number
  reviewsDue: number
  overdueReviews: number
  provisionSessionsDue: number
  activeProvisionCost: number
  priorityCases: LearnerSupportCaseListI[]
}

export interface LearnerSupportTeacherSummaryI {
  caseId: string
  studentId: string
  studentName: string
  profilePicture?: string
  supportSummary?: string
  communicationPreferences?: string
  triggers?: string
  effectiveStrategies?: string
  adjustments: LearnerSupportAdjustmentI[]
  assignedProvisions: LearnerSupportProvisionI[]
}

export interface PaginatedLearnerSupportCasesI {
  items: LearnerSupportCaseListI[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export type ApiResult<T> = ApiResultI & { value: T }

export interface GetLearnerSupportCasesParamsI {
  schoolId: string
  search?: string
  status?: LearnerSupportCaseStatus
  isOnRegister?: boolean
  pageNumber?: number
  pageSize?: number
}

export interface CreateReferralPayloadI {
  schoolId: string
  studentId: string
  referralSource: LearnerSupportReferralSource
  strengths: string
  concern: string
  impact?: string
  strategiesTried?: string
  immediateSafetyConcern: boolean
  jurisdictionCode: string
}

export interface TriagePayloadI {
  schoolId: string
  caseId: string
  status: LearnerSupportCaseStatus
  isOnRegister: boolean
  caseOwnerUserId?: string
  caseOwnerName?: string
  decisionReason: string
  statutoryPlanType?: string
  nextReviewDate?: string
}

export interface PassportPayloadI {
  schoolId: string
  caseId: string
  supportSummary?: string
  communicationPreferences?: string
  triggers?: string
  effectiveStrategies?: string
  learnerVoice?: string
  parentVoice?: string
}

export interface ProvisionInputI {
  title: string
  description?: string
  frequency: string
  durationMinutes: number
  deliveryType?: string
  assignedUserId?: string
  assignedUserName?: string
  estimatedCost: number
  successMeasure?: string
}

export interface SavePlanPayloadI {
  schoolId: string
  caseId: string
  title: string
  needs: string
  outcomes: string
  parentAndLearnerViews?: string
  successCriteria?: string
  startDate: string
  endDate?: string
  reviewDate: string
  publish: boolean
  provisions: ProvisionInputI[]
}

export interface LogProvisionPayloadI {
  schoolId: string
  provisionId: string
  deliveryDate: string
  status: ProvisionDeliveryStatus
  actualDurationMinutes: number
  outcomeRating?: number
  notes?: string
  evidenceUrl?: string
}

export interface UpsertAdjustmentPayloadI {
  schoolId: string
  caseId: string
  adjustmentId?: string
  category: LearnerSupportAdjustmentCategory
  scope: LearnerSupportAdjustmentScope
  title: string
  description: string
  extraTimeMinutes?: number
  allowRestBreaks: boolean
  allowVoiceResponse: boolean
  requireCaptions: boolean
  isActive: boolean
  effectiveFrom: string
  effectiveTo?: string
}

export interface CompleteReviewPayloadI {
  schoolId: string
  caseId: string
  planId?: string
  reviewDate: string
  progressSummary: string
  learnerContribution?: string
  parentContribution?: string
  staffContribution?: string
  decision: LearnerSupportReviewDecision
  decisionReason: string
  nextReviewDate?: string
}

export interface AddContributionPayloadI {
  schoolId: string
  caseId: string
  reviewId?: string
  contributorType?: LearnerSupportContributionType
  contributorName?: string
  content: string
  attachmentUrl?: string
  voiceNoteUrl?: string
  isSharedWithFamily: boolean
}

export interface UploadDocumentPayloadI {
  schoolId: string
  caseId: string
  category: LearnerSupportDocumentCategory
  title: string
  isVisibleToFamily: boolean
  file: File
}
