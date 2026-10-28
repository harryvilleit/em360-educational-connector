import type { ApiResultI } from "@/utils/apiResponse"

export type SafeguardingCaseStatus =
  | "Submitted"
  | "AwaitingTriage"
  | "Open"
  | "Monitoring"
  | "ReferredExternally"
  | "Closed"
export type SafeguardingRiskLevel =
  | "NotAssessed"
  | "Low"
  | "Medium"
  | "High"
  | "Critical"
export type SafeguardingConcernCategory =
  | "PhysicalAbuse"
  | "EmotionalAbuse"
  | "SexualAbuse"
  | "Neglect"
  | "PeerOnPeerAbuse"
  | "OnlineSafety"
  | "DomesticAbuse"
  | "Exploitation"
  | "Radicalisation"
  | "MissingEducation"
  | "MentalHealth"
  | "Bullying"
  | "Discrimination"
  | "Other"
export type SafeguardingActionType =
  | "ImmediateSafety"
  | "SpeakWithLearner"
  | "ContactParentOrGuardian"
  | "InternalReview"
  | "Monitor"
  | "MultiAgencyMeeting"
  | "ExternalReferral"
  | "InformationSharing"
  | "Other"
export type SafeguardingActionStatus = "Open" | "Completed" | "Cancelled"
export type SafeguardingReferralAgency =
  | "LocalAuthority"
  | "ChildrensSocialCare"
  | "Police"
  | "HealthServices"
  | "Camhs"
  | "EarlyHelp"
  | "Lado"
  | "Prevent"
  | "Other"
export type SafeguardingReferralStatus =
  | "Draft"
  | "Submitted"
  | "Acknowledged"
  | "Accepted"
  | "Declined"
  | "Closed"
export type SafeguardingSafetyPlanStatus =
  | "Draft"
  | "Active"
  | "Superseded"
  | "Closed"
export type SafeguardingDocumentCategory =
  | "ConcernEvidence"
  | "ChronologyEvidence"
  | "ReferralCorrespondence"
  | "MultiAgencyRecord"
  | "SafetyPlanEvidence"
  | "Other"
export type SafeguardingAccessRole = "Dsl" | "DeputyDsl" | "CaseReviewer"

export type ApiResult<T> = ApiResultI & { value: T }

export interface SafeguardingAccessI {
  isSchoolMember: boolean
  canSubmitConcern: boolean
  canViewCases: boolean
  canManageCases: boolean
  canConfigureAccess: boolean
  accessRole?: SafeguardingAccessRole
}

export interface SafeguardingConcernReceiptI {
  caseNumber: string
  reportedAtUtc: string
  immediateDanger: boolean
}

export interface SafeguardingCaseListI {
  id: string
  caseNumber: string
  schoolId: string
  studentId: string
  studentSchoolId: string
  studentName: string
  studentGivenId?: string
  className?: string
  profilePicture?: string
  status: SafeguardingCaseStatus
  riskLevel: SafeguardingRiskLevel
  category: SafeguardingConcernCategory
  immediateDanger: boolean
  concernSummary: string
  assignedToName?: string
  incidentAtUtc: string
  reportedAtUtc: string
  nextActionDueAtUtc?: string
  dateCreated: string
  dateModified: string
}

export interface SafeguardingDashboardI {
  awaitingTriage: number
  openCases: number
  highRiskCases: number
  criticalCases: number
  overdueActions: number
  activeSafetyPlans: number
  externalReferrals: number
  priorityCases: SafeguardingCaseListI[]
}

export interface SafeguardingActionI {
  id: string
  type: SafeguardingActionType
  status: SafeguardingActionStatus
  title: string
  details: string
  assignedToUserId?: string
  assignedToName?: string
  dueAtUtc?: string
  completedAtUtc?: string
  outcome?: string
  createdByName?: string
  dateCreated: string
}

export interface SafeguardingActionQueueItemI {
  caseId: string
  caseNumber: string
  studentName: string
  riskLevel: SafeguardingRiskLevel
  action: SafeguardingActionI
}

export interface SafeguardingReferralI {
  id: string
  agency: SafeguardingReferralAgency
  agencyName?: string
  contactName?: string
  contactDetails?: string
  externalReference?: string
  status: SafeguardingReferralStatus
  referredAtUtc: string
  reason: string
  responseSummary?: string
  referredByName?: string
}

export interface SafeguardingSafetyPlanI {
  id: string
  version: number
  status: SafeguardingSafetyPlanStatus
  title: string
  immediateRisks: string
  protectiveActions: string
  trustedAdults?: string
  learnerInstructions?: string
  startDate: string
  reviewDate: string
  createdByName?: string
  activatedAtUtc?: string
  dateCreated: string
}

export interface SafeguardingDocumentI {
  id: string
  category: SafeguardingDocumentCategory
  title: string
  fileName: string
  fileUrl: string
  contentType: string
  fileSizeBytes: number
  version: number
  uploadedByName?: string
  dateCreated: string
}

export interface SafeguardingDocumentDownloadI {
  url: string
  expiresAtUtc: string
}

export interface SafeguardingAuditI {
  id: string
  action: string
  entityType: string
  entityId?: string
  actorName?: string
  summary: string
  dateCreated: string
}

export interface SafeguardingCaseDetailI extends SafeguardingCaseListI {
  incidentLocation?: string
  concernDetails: string
  learnersOwnWords?: string
  emergencyServicesContacted: boolean
  reporterUserId: string
  reporterName?: string
  assignedToUserId?: string
  triageSummary?: string
  immediateActionTaken?: string
  triagedAtUtc?: string
  closedAtUtc?: string
  closureSummary?: string
  linkedLearnerSupportCaseId?: string
  actions: SafeguardingActionI[]
  referrals: SafeguardingReferralI[]
  safetyPlans: SafeguardingSafetyPlanI[]
  documents: SafeguardingDocumentI[]
  auditHistory: SafeguardingAuditI[]
}

export interface SafeguardingAccessGrantI {
  id: string
  userId: string
  userName: string
  email?: string
  role: SafeguardingAccessRole
  isActive: boolean
  dateModified: string
}

export interface SafeguardingEligibleUserI {
  userId: string
  name: string
  email?: string
  roles: string
  currentAccessRole?: SafeguardingAccessRole
}

export interface PaginatedSafeguardingCasesI {
  items: SafeguardingCaseListI[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface GetSafeguardingCasesParamsI {
  schoolId: string
  search?: string
  status?: SafeguardingCaseStatus
  riskLevel?: SafeguardingRiskLevel
  category?: SafeguardingConcernCategory
  pageNumber?: number
  pageSize?: number
}

export interface ReportConcernPayloadI {
  schoolId: string
  studentId: string
  category: SafeguardingConcernCategory
  incidentAtUtc: string
  incidentLocation?: string
  concernSummary: string
  concernDetails: string
  learnersOwnWords?: string
  immediateDanger: boolean
  emergencyServicesContacted: boolean
}

export interface TriageSafeguardingPayloadI {
  schoolId: string
  caseId: string
  status: SafeguardingCaseStatus
  riskLevel: SafeguardingRiskLevel
  assignedToUserId?: string
  assignedToName?: string
  triageSummary: string
  immediateActionTaken?: string
  nextActionDueAtUtc?: string
}

export interface AddSafeguardingActionPayloadI {
  schoolId: string
  caseId: string
  type: SafeguardingActionType
  title: string
  details: string
  assignedToUserId?: string
  assignedToName?: string
  dueAtUtc?: string
}

export interface CompleteSafeguardingActionPayloadI {
  schoolId: string
  actionId: string
  status: SafeguardingActionStatus
  outcome: string
}

export interface AddSafeguardingReferralPayloadI {
  schoolId: string
  caseId: string
  agency: SafeguardingReferralAgency
  agencyName?: string
  contactName?: string
  contactDetails?: string
  externalReference?: string
  status: SafeguardingReferralStatus
  referredAtUtc: string
  reason: string
  responseSummary?: string
}

export interface SaveSafeguardingSafetyPlanPayloadI {
  schoolId: string
  caseId: string
  title: string
  immediateRisks: string
  protectiveActions: string
  trustedAdults?: string
  learnerInstructions?: string
  startDate: string
  reviewDate: string
  activate: boolean
}

export interface UploadSafeguardingDocumentPayloadI {
  schoolId: string
  caseId: string
  category: SafeguardingDocumentCategory
  title: string
  file: File
}

export interface CloseSafeguardingCasePayloadI {
  schoolId: string
  caseId: string
  closureSummary: string
}

export interface GrantSafeguardingAccessPayloadI {
  schoolId: string
  userId: string
  role: SafeguardingAccessRole
}
