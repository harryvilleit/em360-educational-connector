export interface HealthRecordOverviewI {
  totalHealthRecords: number
  currentlyAdmitted: number
  allergyFlags: number
  chronicConditions: number
}

export interface GetHealthRecordOverviewParamsI {
  schoolId?: string
}

export interface GetHealthRecordOverviewResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: HealthRecordOverviewI
}

export interface SickBayLogItemI {
  id: string
  schoolId: string
  studentSchoolId: string
  studentName: string
  className: string
  complaint: string
  treatment: string
  attendedBy: string
  // Read back as the enum name (e.g. "Admitted") rather than its ordinal.
  status: string
  isParentNotified: boolean
  additionalNotes?: string
  visitDate: string
  dischargeTime?: string
  isVoided: boolean
  voidedAtUtc?: string
  voidReason?: string
  dateCreated: string
}

export interface GetAllSickBayLogsParamsI {
  schoolId?: string
  searchString?: string
  status?: number
  fromDate?: string
  toDate?: string
  pageNumber?: number
  pageSize?: number
}

export interface PaginatedSickBayLogsValueI {
  items: SickBayLogItemI[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface GetAllSickBayLogsResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: PaginatedSickBayLogsValueI
}

export interface GetSickBayLogByIdResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: SickBayLogItemI
}

export interface LogSickBayVisitPayloadI {
  schoolId: string
  studentSchoolId: string
  complaint: string
  treatment: string
  attendedBy: string
  status: number
  isParentNotified: boolean
  additionalNotes?: string
  visitDate: string
}

export interface LogSickBayVisitResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: SickBayLogItemI
}

export interface UpdateSickBayLogPayloadI {
  id: string
  schoolId: string
  complaint: string
  treatment: string
  attendedBy: string
  status: number
  isParentNotified: boolean
  additionalNotes?: string
  dischargeTime?: string
  correctionReason: string
}

export interface UpdateSickBayLogResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: SickBayLogItemI
}

export interface VoidSickBayLogPayloadI {
  id: string
  schoolId: string
  reason: string
}

export interface VoidSickBayLogResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}

export interface StudentHealthRecordItemI {
  id: string
  studentSchoolId: string
  studentName: string
  className: string
  bloodGroup?: string
  genotype?: string
  allergies?: string
  chronicConditions?: string
  disabilities?: string
  specialNeeds: boolean
  specialNeedsDescription?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyContactRelationship?: string
  emergencyInstructions?: string
  requiresEmergencyMedication: boolean
  lastReviewedAtUtc?: string
  reviewedByUserId?: string
}

export interface GetAllStudentHealthRecordsParamsI {
  hostelResidentsOnly?: boolean
  schoolId?: string
  searchString?: string
  pageNumber?: number
  pageSize?: number
}

export interface PaginatedStudentHealthRecordsValueI {
  items: StudentHealthRecordItemI[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface GetAllStudentHealthRecordsResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: PaginatedStudentHealthRecordsValueI
}

export interface GetStudentHealthRecordByIdResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: StudentHealthRecordItemI
}

export interface UpsertStudentHealthRecordPayloadI {
  schoolId: string
  studentSchoolId: string
  bloodGroup?: string
  genotype?: string
  allergies?: string
  chronicConditions?: string
  disabilities?: string
  specialNeeds?: boolean
  specialNeedsDescription?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyContactRelationship?: string
  emergencyInstructions?: string
  requiresEmergencyMedication?: boolean
  changeReason?: string
}

export interface UpsertStudentHealthRecordResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: StudentHealthRecordItemI
}

export const HealthAccessRole = {
  HealthLead: 1,
  SchoolNurse: 2,
  FirstAider: 3,
  RecordsAdministrator: 4,
  ReadOnly: 5,
} as const
export type HealthAccessRole =
  (typeof HealthAccessRole)[keyof typeof HealthAccessRole]

export const HealthCarePlanStatus = {
  Draft: 1,
  Active: 2,
  Superseded: 3,
  Closed: 4,
} as const
export type HealthCarePlanStatus =
  (typeof HealthCarePlanStatus)[keyof typeof HealthCarePlanStatus]

export const MedicationAuthorisationStatus = {
  Draft: 1,
  Active: 2,
  Suspended: 3,
  Expired: 4,
  Revoked: 5,
} as const
export type MedicationAuthorisationStatus =
  (typeof MedicationAuthorisationStatus)[keyof typeof MedicationAuthorisationStatus]

export const MedicationAdministrationOutcome = {
  Given: 1,
  Refused: 2,
  Missed: 3,
  Withheld: 4,
  SelfAdministered: 5,
} as const
export type MedicationAdministrationOutcome =
  (typeof MedicationAdministrationOutcome)[keyof typeof MedicationAdministrationOutcome]

export const HealthIncidentType = {
  Illness: 1,
  Injury: 2,
  AllergicReaction: 3,
  MedicationError: 4,
  MentalWellbeing: 5,
  Other: 6,
} as const
export type HealthIncidentType =
  (typeof HealthIncidentType)[keyof typeof HealthIncidentType]

export const HealthIncidentSeverity = {
  Low: 1,
  Moderate: 2,
  High: 3,
  Critical: 4,
} as const
export type HealthIncidentSeverity =
  (typeof HealthIncidentSeverity)[keyof typeof HealthIncidentSeverity]

export const HealthIncidentStatus = {
  Open: 1,
  Monitoring: 2,
  Referred: 3,
  Closed: 4,
} as const
export type HealthIncidentStatus =
  (typeof HealthIncidentStatus)[keyof typeof HealthIncidentStatus]

export const HealthConsentType = {
  EmergencyTreatment: 1,
  MedicationAdministration: 2,
  InformationSharing: 3,
  HealthScreening: 4,
  OffSiteCare: 5,
  Other: 6,
} as const
export type HealthConsentType =
  (typeof HealthConsentType)[keyof typeof HealthConsentType]

export const HealthConsentStatus = {
  Pending: 1,
  Granted: 2,
  Declined: 3,
  Withdrawn: 4,
  Expired: 5,
} as const
export type HealthConsentStatus =
  (typeof HealthConsentStatus)[keyof typeof HealthConsentStatus]

export interface HealthActorAccessI {
  isSchoolMember: boolean
  canViewRecords: boolean
  canManageProfiles: boolean
  canManageCarePlans: boolean
  canManageMedication: boolean
  canRecordIncidents: boolean
  canManageConsent: boolean
  canConfigureAccess: boolean
  accessRole?: HealthAccessRole
  isEmergencyAccess: boolean
  emergencyAccessExpiresAtUtc?: string
}

export interface HealthCarePlanI {
  id: string
  version: number
  status: HealthCarePlanStatus
  title: string
  healthSummary: string
  emergencyInstructions: string
  dailySupport?: string
  activitiesAndTripsInstructions?: string
  effectiveFrom: string
  reviewDate: string
  parentAgreedAtUtc?: string
  approvedAtUtc?: string
  approvedByName?: string
  createdByName?: string
  dateCreated: string
}

export interface HealthConsentI {
  id: string
  type: HealthConsentType
  status: HealthConsentStatus
  version: number
  scope: string
  guardianName?: string
  respondedAtUtc?: string
  validFrom: string
  validUntil?: string
  evidenceMethod?: string
  notes?: string
  recordedByName?: string
  dateCreated: string
}

export interface MedicationAuthorisationI {
  id: string
  healthConsentId: string
  status: MedicationAuthorisationStatus
  medicationName: string
  form?: string
  strength?: string
  dose: string
  route: string
  frequency: string
  instructions: string
  reason?: string
  storageInstructions?: string
  startDate: string
  endDate?: string
  isEmergencyMedication: boolean
  createdByName?: string
  dateCreated: string
}

export interface MedicationAdministrationI {
  id: string
  medicationAuthorisationId: string
  medicationName: string
  scheduledAtUtc?: string
  administeredAtUtc: string
  outcome: MedicationAdministrationOutcome
  doseGiven?: string
  notes?: string
  administeredByName?: string
  dateCreated: string
}

export interface HealthIncidentI {
  id: string
  type: HealthIncidentType
  severity: HealthIncidentSeverity
  status: HealthIncidentStatus
  occurredAtUtc: string
  location?: string
  description: string
  firstAidOrActionTaken: string
  emergencyServicesContacted: boolean
  parentNotified: boolean
  parentNotifiedAtUtc?: string
  outcomeOrFollowUp?: string
  recordedByName?: string
  dateCreated: string
}

export interface HealthAuditEventI {
  id: string
  action: string
  entityType: string
  entityId?: string
  actorName?: string
  summary: string
  reason?: string
  correlationId?: string
  isEmergencyAccess: boolean
  dateCreated: string
}

export interface HealthAccessGrantI {
  id: string
  userId: string
  userName: string
  email?: string
  role: HealthAccessRole
  isActive: boolean
  expiresAtUtc?: string
  reason?: string
  dateModified: string
}

export interface StudentHealthWorkspaceI {
  profile: StudentHealthRecordItemI
  access: HealthActorAccessI
  carePlans: HealthCarePlanI[]
  medicationAuthorisations: MedicationAuthorisationI[]
  medicationAdministrations: MedicationAdministrationI[]
  incidents: HealthIncidentI[]
  consents: HealthConsentI[]
  auditHistory: HealthAuditEventI[]
}

export interface HealthApiResponseI<T> {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: T
}

export type GetStudentHealthWorkspaceResponseI =
  HealthApiResponseI<StudentHealthWorkspaceI>
export type GetHealthAccessResponseI = HealthApiResponseI<HealthActorAccessI>
export type GetHealthAccessGrantsResponseI = HealthApiResponseI<
  HealthAccessGrantI[]
>

export interface GrantHealthAccessPayloadI {
  schoolId: string
  userId: string
  role: HealthAccessRole
  isActive: boolean
  expiresAtUtc?: string
  reason: string
}

export interface ActivateEmergencyHealthAccessPayloadI {
  schoolId: string
  studentSchoolId: string
  reason: string
}

export interface HealthEmergencyAccessI {
  id: string
  schoolId: string
  studentSchoolId: string
  reason: string
  grantedAtUtc: string
  expiresAtUtc: string
}

export interface HealthSecurityAlertI {
  id: string
  studentSchoolId?: string
  type: string
  title: string
  message: string
  actorName?: string
  dateCreated: string
  acknowledgedAtUtc?: string
}

export type ActivateEmergencyHealthAccessResponseI =
  HealthApiResponseI<HealthEmergencyAccessI>
export type GetHealthSecurityAlertsResponseI = HealthApiResponseI<
  HealthSecurityAlertI[]
>

export interface SaveHealthCarePlanPayloadI {
  schoolId: string
  studentSchoolId: string
  status: HealthCarePlanStatus
  title: string
  healthSummary: string
  emergencyInstructions: string
  dailySupport?: string
  activitiesAndTripsInstructions?: string
  effectiveFrom: string
  reviewDate: string
  parentAgreedAtUtc?: string
}

export interface RecordHealthConsentPayloadI {
  schoolId: string
  studentSchoolId: string
  type: HealthConsentType
  status: HealthConsentStatus
  scope: string
  guardianName?: string
  respondedAtUtc?: string
  validFrom: string
  validUntil?: string
  evidenceMethod?: string
  notes?: string
}

export interface CreateMedicationAuthorisationPayloadI {
  schoolId: string
  studentSchoolId: string
  healthConsentId: string
  status: MedicationAuthorisationStatus
  medicationName: string
  form?: string
  strength?: string
  dose: string
  route: string
  frequency: string
  instructions: string
  reason?: string
  storageInstructions?: string
  startDate: string
  endDate?: string
  isEmergencyMedication: boolean
}

export interface RecordMedicationAdministrationPayloadI {
  schoolId: string
  medicationAuthorisationId: string
  scheduledAtUtc?: string
  administeredAtUtc: string
  outcome: MedicationAdministrationOutcome
  doseGiven?: string
  notes?: string
}

export interface RecordHealthIncidentPayloadI {
  schoolId: string
  studentSchoolId: string
  type: HealthIncidentType
  severity: HealthIncidentSeverity
  status: HealthIncidentStatus
  occurredAtUtc: string
  location?: string
  description: string
  firstAidOrActionTaken: string
  emergencyServicesContacted: boolean
  parentNotified: boolean
  parentNotifiedAtUtc?: string
  outcomeOrFollowUp?: string
}
