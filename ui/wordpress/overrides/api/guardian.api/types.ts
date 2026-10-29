import type { PeriodTypeI } from "@/api/timetablePeriodType.api/types"

export interface CreateGuardianPayloadI {
  firstName: string
  lastName: string
  address?: string
  phone: string
  email?: string
  password: string
  relationship: string
  occupation?: string
  schoolId?: string
}

export interface CreateGuardianResponseI {
  isSuccess: boolean
  error: string
  timestamp: string
  isFailure: boolean
}

export interface UpdateGuardianPayloadI {
  id: string
  firstName: string
  lastName: string
  address?: string
  phone: string
  relationship: string
  occupation?: string
}

export interface UpdateGuardianResponseI {
  isSuccess: boolean
  error: string
  timestamp: string
  isFailure: boolean
}

export interface DeleteGuardianParamsI {
  id: string
}

export interface DeleteGuardianResponseI {
  isSuccess: boolean
  error: string
  timestamp: string
  isFailure: boolean
}

export interface GuardianItemI {
  id: string
  firstName: string
  lastName: string
  address: string
  phone: string
  email: string
  relationship: string
  occupation: string
  numberOfStudents: number
  dateCreated: string
  dateModified: string
}

export interface GetAllGuardiansParamsI {
  pageNumber?: number
  pageSize?: number
  keyword?: string
}

export interface GetAllGuardiansValueI {
  items: GuardianItemI[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface GetAllGuardiansResponseI {
  isSuccess: boolean
  error: string
  timestamp: string
  isFailure: boolean
  value: GetAllGuardiansValueI
}

export interface GetGuardianByIdParamsI {
  schoolId?: string
  id: string
}

export interface GetGuardianByIdResponseI {
  isSuccess: boolean
  error: string
  timestamp: string
  isFailure: boolean
  value: GuardianItemI
}

export interface GetGuardianByEmailParamsI {
  email: string
}

export interface GetGuardianByEmailResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: GuardianItemI | null
}

export interface SchoolParentItemI {
  guardianId: string
  fullName: string
  email: string
  phoneNumber: string
  address: string
  occupation: string
  childrenCount: number
  dateCreated: string
}

export interface GetSchoolParentsParamsI {
  schoolId: string
  pageNumber?: number
  pageSize?: number
  search?: string
}

export interface GetSchoolParentsValueI {
  items: SchoolParentItemI[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface GetSchoolParentsResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: GetSchoolParentsValueI
}

export interface GuardianDetailsChildI {
  studentId: string
  studentGivenId: string
  fullName: string
  gender: string
  dateOfBirth: string
  currentSchoolName: string
  currentClassName: string
}

export interface GuardianDetailsI {
  guardianId: string
  fullName: string
  email: string
  phoneNumber: string
  address: string
  occupation: string
  dateCreated: string
  profilePhotoUrl: string
  childrenCount: number
  children: GuardianDetailsChildI[]
}

export interface GetGuardianDetailsParamsI {
  schoolId?: string
  guardianId: string
}

export interface GetGuardianDetailsResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: GuardianDetailsI
}

export interface GuardianChildI {
  studentId: string
  studentSchoolId: string
  fullName: string
  admissionNumber: string
  currentClass: string | null
  currentSession: string | null
  profileImageUrl: string
  currentSessionClasses?: LaunchSchoolPortalCurrentClassI[]
  currentClassName?: string | null
  currentSchoolClassId?: string | null
  currentSchoolArmName?: string | null
  currentSchoolArmId?: string | null
}

export interface GetGuardianChildrenParamsI {
  guardianId: string
  schoolId: string
}

export interface GetGuardianChildrenResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: GuardianChildI[]
}

export interface GuardianFeeManagementStudentI {
  studentId: string
  studentSchoolId: string
  studentEnrollmentId: string
  fullName: string
  admissionNumber: string
  profileImageUrl: string
  classId: string
  className: string
  schoolId: string
  schoolName: string
  sessionId: string
  sessionName: string
}

export interface GuardianFeeManagementTermSummaryI {
  schoolSessionTermId: string
  termName: string
  totalBill: number
  totalPaid: number
  outstandingAmount: number
  paymentStatus: number
}

export interface GuardianFeeManagementSummaryI {
  walletBalance: number
  totalBilled: number
  totalPaid: number
  outstandingBalance: number
  currentTermSummary: GuardianFeeManagementTermSummaryI
}

export interface GuardianFeeManagementBillItemI {
  schoolStudentBillItemId: string
  schoolPaymentStructureItemId: string
  schoolPaymentItemId: string
  paymentItemName: string
  amount: number
  paymentRequirement: string | number
  isSelected: boolean
  isCustom: boolean
}

export interface GuardianFeeManagementPaymentHistoryI {
  schoolStudentPaymentId: string
  amountPaid: number
  paymentDate: string
  paymentReference: string
  paymentMethod: string
  paymentStatus: string
}

export interface GuardianFeeManagementPaymentIdentifiersI {
  parentId: string
  studentId: string
  studentSchoolId: string
  studentEnrollmentId: string
  schoolId: string
  schoolSessionId: string
  schoolSessionTermId: string
  schoolStudentBillId: string
  schoolPaymentStructureId: string
}

export interface GuardianFeeManagementTermI {
  schoolSessionTermId: string
  termName: string
  schoolStudentBillId: string
  schoolPaymentStructureId: string
  totalBilled: number
  totalPaid: number
  outstandingAmount: number
  paymentStatus: number
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
  canMakePayment: boolean
  billItems: GuardianFeeManagementBillItemI[]
  paymentHistory: GuardianFeeManagementPaymentHistoryI[]
  paymentIdentifiers: GuardianFeeManagementPaymentIdentifiersI
}

export interface GuardianFeeManagementI {
  currencyCode?: string | null
  student: GuardianFeeManagementStudentI
  summary: GuardianFeeManagementSummaryI
  terms: GuardianFeeManagementTermI[]
}

export interface GetGuardianFeeManagementParamsI {
  guardianId: string
  schoolId: string
  studentId: string
  schoolSessionId: string
}

export interface GetGuardianFeeManagementResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: GuardianFeeManagementI
}

export interface SubscribeToPaymentItemPayloadI {
  schoolStudentBillItemId: string
  schoolStudentBillId: string
}

export interface SubscribeToPaymentItemResponseI {
  isSuccess: boolean
  message?: string
  error?: string
  isFailure?: boolean
  statusCode: number
}

export interface EnrolledClassSubjectI {
  subjectId: string
  classSubjectId: string
  subjectName: string
  isOptional: boolean
  isMandatory: boolean
  isSubscribed: boolean
  canSubscribe: boolean
}

export interface EnrolledClassSummaryI {
  totalSubjects: number
  mandatorySubjects: number
  optionalSubjects: number
  subscribedOptionalSubjects: number
  availableOptionalSubjects: number
}

export interface StudentEnrolledClassI {
  studentEnrollmentId: string
  classId: string
  className: string
  classArmId: string | null
  classArmName: string | null
  subjects: EnrolledClassSubjectI[]
  summary: EnrolledClassSummaryI
}

export interface StudentEnrolledClassesSessionI {
  id: string
  name: string
  isCurrent: boolean
}

export interface StudentEnrolledClassesTermI {
  id: string
  name: string
  isCurrent: boolean
}

// Consumer-facing params stay camelCase (matches every other hook in this
// file); getStudentEnrolledClassesApi maps them onto the exact PascalCase
// query keys (SchoolId/StudentId/SchoolSessionId/SchoolSessionTermId) the
// backend request model requires.
export interface GetStudentEnrolledClassesParamsI {
  studentId: string
  schoolId: string
  schoolSessionId?: string
  schoolSessionTermId?: string
}

export interface StudentEnrolledClassesDataI {
  studentId: string
  studentName: string
  schoolId: string
  session: StudentEnrolledClassesSessionI | null
  term: StudentEnrolledClassesTermI | null
  enrolledClasses: StudentEnrolledClassI[]
}

export interface GetStudentEnrolledClassesResponseI {
  isSuccess: boolean
  message?: string
  error?: string
  isFailure?: boolean
  statusCode: number
  value: StudentEnrolledClassesDataI
}

export interface SubscribeToOptionalSubjectPayloadI {
  studentId: string
  schoolId: string
  classSubjectId: string
  guardianId?: string
}

export interface SubscribeToOptionalSubjectResponseI {
  isSuccess: boolean
  message?: string
  error?: string
  isFailure?: boolean
  statusCode: number
}

export interface GuardianStudentResultStudentI {
  studentId: string
  fullName: string
  profileImageUrl: string
  admissionNumber: string
  className: string
  sessionName: string
  termName: string
}

export interface GuardianStudentResultSummaryI {
  averageScore: number
  averageScoreChange: number
  position: number
  positionChange: number
  totalScore: number
  subjectCount: number
  totalStudentsInClass: number
}

export interface GuardianStudentResultAnalyticsSubjectI {
  subjectName: string
  score: number
  change: number
}

export interface GuardianStudentResultPerformanceAnalyticsI {
  strongestSubjects: GuardianStudentResultAnalyticsSubjectI[]
  needsAttentionSubjects: GuardianStudentResultAnalyticsSubjectI[]
}

export interface GuardianStudentResultTermComparisonI {
  subjectName: string
  previousTermScore: number
  previousTermName: string
  currentTermScore: number
  currentTermName: string
  change: number
}

export interface GuardianStudentResultAssessmentI {
  assessmentName: string
  score: number
  weightPercentage: number
}

export interface GuardianStudentResultSubjectI {
  subjectName: string
  score: number
  maxScore: number
  grade: string
  remark: string
  assessments: GuardianStudentResultAssessmentI[]
}

export interface GuardianStudentResultI {
  student: GuardianStudentResultStudentI
  summary: GuardianStudentResultSummaryI
  performanceAnalytics: GuardianStudentResultPerformanceAnalyticsI
  termComparison: GuardianStudentResultTermComparisonI[]
  subjectResults: GuardianStudentResultSubjectI[]
}

export interface GetGuardianStudentResultParamsI {
  guardianId: string
  schoolId: string
  studentId: string
  schoolSessionId: string
  schoolSessionTermId?: string
  schoolClassId?: string
}

export interface GetGuardianStudentResultResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: GuardianStudentResultI
}

export interface GetGuardianStudentAttendanceParamsI {
  studentId: string
  schoolId: string
  schoolClassId?: string
  schoolSessionId?: string
  schoolSessionTermId?: string
  startDate?: string
  endDate?: string
}

export interface GuardianAttendanceRecordItemI {
  recordId: string
  sessionHeaderId: string

  attendanceDate: string
  formattedDate: string

  schoolClassId: string
  schoolClassName: string

  schoolSessionId: string | null
  sessionName: string | null

  schoolSessionTermId: string | null
  termName: string | null

  status: number
  statusName: string

  remarks: string | null
}

export interface GuardianStudentAttendanceResultI {
  studentId: string
  studentGivenId: string
  studentName: string

  schoolId: string
  schoolName: string

  currentClassId: string | null
  currentClassName: string | null

  totalDaysMarked: number
  presentDays: number
  absentDays: number
  lateDays: number
  excusedDays: number

  attendancePercentage: number

  records: GuardianAttendanceRecordItemI[]
}

export interface GetGuardianStudentAttendanceResponseI {
  isSuccess: boolean
  message?: string
  error?: string
  isFailure?: boolean
  value: GuardianStudentAttendanceResultI
}

export interface AdminResetGuardianPasswordPayloadI {
  guardianId: string
  password: string
  schoolId: string
}

export interface AdminResetGuardianPasswordResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}

export interface GetLaunchSchoolPortalParamsI {
  schoolId: string
  guardianId?: string
}

export interface LaunchSchoolPortalTermI {
  schoolSessionTermId: string
  termId: string
  termName: string
  status: string
  isCurrentTerm: boolean
  startDate: string
  endDate: string
  className: string
  armName: string | null
  classes: LaunchSchoolPortalCurrentClassI[]
}

export interface LaunchSchoolPortalSessionI {
  sessionId: string
  sessionName: string
  isCurrentSession: boolean
  terms: LaunchSchoolPortalTermI[]
}

export interface LaunchSchoolPortalBillItemI {
  schoolStudentBillItemId: string
  paymentItemName: string
  amount: number
  paymentRequirement: string
  isSelected: boolean
}

export interface LaunchSchoolPortalTermBreakdownI {
  schoolSessionTermId: string
  termName: string
  schoolStudentBillId: string
  schoolPaymentStructureId: string
  totalBilled: number
  totalPaid: number
  outstandingAmount: number
  paymentStatus: string
  issueDate: string
  dueDate: string
  canMakePayment: boolean
  billItems: LaunchSchoolPortalBillItemI[]
}

export interface LaunchSchoolPortalClassFeeBreakdownI {
  classId: string
  className: string
  classArmId: string | null
  armName: string | null
  totalBilled: number
  totalPaid: number
  outstandingBalance: number
  termBreakdowns: LaunchSchoolPortalTermBreakdownI[]
}

export interface LaunchSchoolPortalActiveSessionFeeBreakdownI {
  activeSessionId: string
  activeSessionName: string
  walletBalance: number
  totalBilled: number
  totalPaid: number
  outstandingBalance: number
  termBreakdowns: LaunchSchoolPortalTermBreakdownI[]
  classFeeBreakdowns: LaunchSchoolPortalClassFeeBreakdownI[]
}

export interface LaunchSchoolPortalCurrentClassI {
  enrollmentId: string
  schoolClassId: string
  className: string
  schoolArmId: string | null
  armName: string | null
  isCurrent: boolean
}

export interface LaunchSchoolPortalChildI {
  studentId: string
  studentSchoolId: string
  studentGivenId: string
  firstname: string
  lastname: string
  fullName: string
  gender: string
  profilePicture: string | null
  currentClassName?: string | null
  currentSchoolClassId?: string | null
  currentSchoolArmName?: string | null
  currentSchoolArmId?: string | null
  currentArmName?: string | null
  currentSessionClasses: LaunchSchoolPortalCurrentClassI[]
  sessions: LaunchSchoolPortalSessionI[]
  activeSessionFeeBreakdown: LaunchSchoolPortalActiveSessionFeeBreakdownI | null
}

export interface LaunchSchoolPortalDataI {
  guardianId: string
  guardianFullName: string
  guardianEmail: string
  guardianPhone: string
  schoolId: string
  schoolName: string
  schoolLogoUrl: string | null
  baseCurrency: string | null
  myChildrenCount: number
  totalPendingFees: number
  upcomingVisitsCount: number
  unreadNotificationsCount: number
  timetablePeriodTypes: PeriodTypeI[]
  children: LaunchSchoolPortalChildI[]
}

export interface LaunchSchoolPortalResponseI {
  isSuccess: boolean
  message: string
  error?: string
  isFailure?: boolean
  statusCode: number
  value: LaunchSchoolPortalDataI
}

export interface StudentFeeBreakdownBillItemI {
  notes?: string | null
  description?: string | null
  subscriptionDueDate?: string | null
  schoolStudentBillItemId: string
  paymentItemName: string
  amount: number
  paymentRequirement: string
  isSelected: boolean
}

export interface StudentFeeBreakdownTermI {
  schoolSessionTermId: string
  termName: string
  schoolStudentBillId: string
  schoolPaymentStructureId: string
  studentEnrollmentId: string
  totalBilled: number
  totalPaid: number
  outstandingAmount: number
  paymentStatus: string
  issueDate: string
  dueDate: string
  canMakePayment: boolean
  billItems: StudentFeeBreakdownBillItemI[]
}

export interface StudentClassFeeBreakdownI {
  classId: string
  className: string
  classArmId: string | null
  armName: string | null
  totalBilled: number
  totalPaid: number
  outstandingBalance: number
  terms: StudentFeeBreakdownTermI[]
}

export interface StudentFeeBreakdownI {
  currencyCode?: string | null
  sessionId: string
  sessionName: string
  filteredClassId?: string | null
  filteredClassName?: string | null
  walletBalance: number
  totalBilled: number
  totalPaid: number
  outstandingBalance: number
  terms: StudentFeeBreakdownTermI[]
  classFeeBreakdowns: StudentClassFeeBreakdownI[]
}

export interface GetStudentFeeBreakdownParamsI {
  guardianId: string
  schoolId: string
  studentId: string
  schoolSessionId: string
  classId?: string
}

export interface GetStudentFeeBreakdownResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: StudentFeeBreakdownI
}

export interface ChildPaymentHistoryItemI {
  id: string
  amountPaid: number
  paymentDate: string
  paymentReference: string | null
  paymentMethod: string | null
  termName: string | null
  sessionName: string | null
}

export interface ChildPaymentHistoryPageI {
  items: ChildPaymentHistoryItemI[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface AssignGuardiansToStudentPayloadI {
  studentId: string
  guardianIds: string[]
}

export interface AssignGuardiansToStudentResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}
