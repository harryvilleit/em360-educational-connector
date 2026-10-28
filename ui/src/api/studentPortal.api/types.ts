import type { AcademicRecord, WelfareRecord } from "@/types/student"
export interface StudentProfileData {
  middleName?: string
  admissionDate?: string
  previousSchool?: string
  behavioralNotes?: string
  academicHistory: AcademicRecord[]
  welfareRecords: WelfareRecord[]
  extracurriculars: string[]
}
export const emptyStudentProfile: StudentProfileData = {
  academicHistory: [],
  welfareRecords: [],
  extracurriculars: [],
}

export interface StudentGuardianI {
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

export interface CreateStudentPayloadI {
  profile?: StudentProfileData
  previousSchool?: string | null
  studentId?: string
  guardianIds?: string[]
  schoolId: string
  studentGivenId?: string
  firstname: string
  lastname: string
  email: string
  isDefaultEmail: boolean
  password: string
  dateofBirth?: string
  gender: number
  profilePicture?: string
  nationality?: string
  stateOfOrigin?: string
  city?: string
  localGovernment?: string
  homeAddress?: string
  religion?: string
  bloodGroup?: string
  genotype?: string
  allergies?: string
  chronicCondtions?: string
  disabilities?: string
  specialNeeds?: boolean
  specialNeedsDescription?: string
}

export interface CreateStudentValueI {
  studentId: string
  studentSchoolId: string
  email: string
  emailWasGenerated: boolean
  emailNotificationSent: boolean
}

export interface CreateStudentResponseI {
  isSuccess: boolean
  error: string
  timestamp: string
  isFailure: boolean
  value: CreateStudentValueI
}

export interface UpdateStudentPayloadI {
  profile?: StudentProfileData
  previousSchool?: string | null
  studentId: string
  schoolId: string
  studentGivenId?: string
  firstname: string
  lastname: string
  email?: string
  phoneNumber?: string
  dateofBirth?: string
  gender: number
  profilePicture?: string
  nationality?: string
  stateOfOrigin?: string
  city?: string
  localGovernment?: string
  homeAddress?: string
  religion?: string
  status: number
  bloodGroup?: string
  genotype?: string
  allergies?: string
  chronicCondtions?: string
  disabilities?: string
  specialNeeds?: boolean
  specialNeedsDescription?: string
}

export interface UpdateStudentResponseI {
  isSuccess: boolean
  error: string
  timestamp: string
  isFailure: boolean
}

export interface DeleteStudentParamsI {
  studentId: string
  schoolId: string
}

export interface DeleteStudentResponseI {
  isSuccess: boolean
  error: string
  timestamp: string
  isFailure: boolean
}

export interface EnrollStudentPayloadI {
  studentId: string
  schoolId: string
  schoolClassId: string
  schoolSessionId: string
  schoolSessionTermId: string
  schoolArmId?: string
}

export interface EnrollStudentResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}

export interface EnrollToAdditionalClassPayloadI {
  studentId: string
  schoolId: string
  schoolClassId: string
  schoolSessionId: string
  schoolSessionTermId: string
  schoolArmId?: string
}

export interface EnrollToAdditionalClassResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}

export interface SearchStudentsParamsI {
  schoolId: string
  keyword?: string
}

export interface StudentSearchResultI {
  studentId: string
  firstname: string
  lastname: string
  email: string
  phoneNumber: string
  dateofBirth: string
  gender: number | string
  profilePicture: string
  nationality: string
  stateOfOrigin: string
  city: string
  localGovernment: string
  homeAddress: string
  religion: string
  specialNeeds: boolean
  specialNeedsDescription: string
  status: number
}

export interface SearchStudentsResponseI {
  isSuccess: boolean
  error: string
  timestamp: string
  isFailure: boolean
  value: StudentSearchResultI[]
}

export interface GetSchoolStudentsParamsI {
  schoolId: string
  search?: string
  status?: number
  pageNumber?: number
  pageSize?: number
}

export interface SchoolStudentItemI {
  studentId: string
  studentGivenId: string
  firstname: string
  lastname: string
  email: string
  gender: number | string
  dateofBirth: string
  status: number
  isEnrolled: boolean
  guardians: StudentGuardianI[]
}

export interface GetSchoolStudentsValueI {
  items: SchoolStudentItemI[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface GetSchoolStudentsResponseI {
  isSuccess: boolean
  error: string
  timestamp: string
  isFailure: boolean
  value: GetSchoolStudentsValueI
}

export interface GetStudentByIdParamsI {
  studentId: string
  schoolId: string
}

export interface StudentSubjectI {
  subjectId: string
  subjectName: string
  isActive: boolean
}

export interface StudentDetailI {
  enrolledClasses?: StudentEnrolledClassI[]
  profile?: StudentProfileData
  previousSchool?: string | null
  studentId: string
  studentGivenId: string
  schoolId: string
  firstname: string
  lastname: string
  email: string
  // Older API responses may omit this flag; never infer it from the address.
  isDefaultEmail?: boolean
  phoneNumber: string
  dateofBirth: string
  admissionDate?: string
  gender: number | string
  profilePicture: string
  nationality: string
  stateOfOrigin: string
  city: string
  localGovernment: string
  homeAddress: string
  religion: string
  status: number
  bloodGroup: string
  genotype: string
  allergies: string
  chronicCondtions: string
  disabilities: string
  specialNeeds: boolean
  specialNeedsDescription: string
  guardians: StudentGuardianI[]
  enrollmentId: string
  schoolClassId?: string
  schoolClassName: string
  schoolArmName: string
  subjects: StudentSubjectI[]
}

export interface GetStudentByIdResponseI {
  isSuccess: boolean
  error: string
  timestamp: string
  isFailure: boolean
  value: StudentDetailI
}

export interface StudentDashboardOverviewI {
  totalStudents: number
  activeStudents: number
  suspendedStudents: number
  withdrawnStudents: number
  graduatedStudents: number
  maleStudents: number
  femaleStudents: number
}

export interface GetStudentDashboardOverviewResponseI {
  isSuccess: boolean
  error: string
  timestamp: string
  isFailure: boolean
  value: StudentDashboardOverviewI
}

export interface AdminResetStudentPasswordPayloadI {
  studentId: string
  password: string
  schoolId: string
}

export interface AdminResetStudentPasswordResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}

export interface GetStudentPortalOverviewParamsI {
  studentId: string
  schoolId: string
}

export interface StudentPortalOverviewI {
  className: string
  termName: string
  sessionName: string
  upcomingClassesCount: number
  latestAverage: number
  position: number
}

export interface GetStudentPortalOverviewResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: StudentPortalOverviewI
}

export interface GetStudentPortalTimetableParamsI {
  studentId: string
  schoolId: string
  timetableType?: number
  weekStartDate?: string
}

export interface StudentPortalTimetableSlotI {
  id: string
  schoolId: string
  schoolSessionId: string
  schoolSessionTermId: string
  schoolClassId: string
  schoolClassName: string
  timetableType: number
  timetableTypeName: string
  dayOfWeek: number
  dayOfWeekName: string
  date: string
  formattedDate: string
  weekStartDate: string
  formattedWeekStartDate: string
  periodTypeId: string
  periodTypeName: string
  periodTypeCode: string
  startTime: string
  formattedStartTime: string
  endTime: string
  formattedEndTime: string
  subjectId: string
  subjectName: string
  classMode: number | null
  classModeName: string
  venue: string
  assessmentType: string
  dateCreated: string
}

export interface StudentPortalTimetableSectionI {
  id: string
  schoolId: string
  schoolSessionId: string
  schoolSessionName: string
  schoolSessionTermId: string
  schoolTermName: string
  schoolClassId: string
  schoolClassName: string
  timetableType: number
  typeName: string
  status: number
  statusName: string
  dateCreated: string
  slots: StudentPortalTimetableSlotI[]
}

export interface StudentPortalTimetableI {
  classTimetable: StudentPortalTimetableSectionI
  assessmentSchedule: StudentPortalTimetableSectionI
}

export interface GetStudentPortalTimetableResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: StudentPortalTimetableI
}

export interface GetStudentPortalResultsParamsI {
  studentId: string
  schoolId: string
  schoolSessionId?: string
  schoolSessionTermId?: string
}

export interface StudentPortalResultStudentI {
  studentId: string
  fullName: string
  profileImageUrl: string
  admissionNumber: string
  className: string
  sessionName: string
  termName: string
}

export interface StudentPortalResultSummaryI {
  averageScore: number
  averageScoreChange: number
  position: number
  positionChange: number
  totalScore: number
  subjectCount: number
  totalStudentsInClass: number
}

export interface StudentPortalResultAnalyticsSubjectI {
  subjectName: string
  score: number
  change: number
}

export interface StudentPortalResultPerformanceAnalyticsI {
  strongestSubjects: StudentPortalResultAnalyticsSubjectI[]
  needsAttentionSubjects: StudentPortalResultAnalyticsSubjectI[]
}

export interface StudentPortalResultTermComparisonI {
  subjectName: string
  previousTermScore: number
  previousTermName: string
  currentTermScore: number
  currentTermName: string
  change: number
}

export interface StudentPortalResultAssessmentI {
  assessmentName: string
  score: number
  weightPercentage: number
}

export interface StudentPortalResultSubjectI {
  subjectName: string
  score: number
  maxScore: number
  grade: string
  remark: string
  assessments: StudentPortalResultAssessmentI[]
}

export interface StudentPortalResultI {
  student: StudentPortalResultStudentI
  summary: StudentPortalResultSummaryI
  performanceAnalytics: StudentPortalResultPerformanceAnalyticsI
  termComparison: StudentPortalResultTermComparisonI[]
  subjectResults: StudentPortalResultSubjectI[]
}

export interface GetStudentPortalResultsResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: StudentPortalResultI
}

export interface GetStudentPortalHostelParamsI {
  studentId: string
  schoolId: string
}

export interface StudentPortalHostelI {
  isAssigned: boolean
  hostelName: string
  floorName: string
  roomName: string
  bedLabel: string
}

export interface GetStudentPortalHostelResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: StudentPortalHostelI
}

export interface GetStudentPortalHealthRecordParamsI {
  studentId: string
  schoolId: string
}

export interface StudentPortalMedicalProfileI {
  bloodGroup: string
  genotype: string
  allergies: string
  chronicConditions: string
  disabilities: string
  specialNeeds: boolean
  specialNeedsDescription: string
}

export interface StudentPortalSickBayVisitI {
  id: string
  complaint: string
  treatment: string
  attendedBy: string
  status: number | string
  isParentNotified: boolean
  additionalNotes?: string
  visitDate: string
  dischargeTime?: string
}

export interface StudentPortalHealthRecordI {
  medicalProfile: StudentPortalMedicalProfileI
  sickBayVisits: StudentPortalSickBayVisitI[]
}

export interface GetStudentPortalHealthRecordResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: StudentPortalHealthRecordI
}

// ─── Student Portal bootstrap (StudentPortal/LaunchSchool) ──────────────────

export interface GetStudentPortalLaunchParamsI {
  studentId: string
  schoolId: string
}

export interface StudentPortalLaunchClassI {
  enrollmentId: string
  schoolClassId: string
  className: string
  schoolArmId: string | null
  armName: string | null
  isPrimaryClass: boolean
  classType: string
  isCurrent: boolean
}

export interface StudentPortalLaunchTermI {
  schoolSessionTermId: string
  termId: string
  termName: string
  isCurrentTerm: boolean
  startDate: string
  endDate: string
  classes: StudentPortalLaunchClassI[]
}

export interface StudentPortalLaunchSessionI {
  sessionId: string
  sessionName: string
  isCurrentSession: boolean
  terms: StudentPortalLaunchTermI[]
}

export interface StudentPortalLaunchDataI {
  studentId: string
  studentSchoolId: string
  studentGivenId: string
  firstname: string
  lastname: string
  fullName: string
  gender: string
  profilePicture: string | null
  schoolId: string
  schoolName: string
  schoolLogoUrl: string | null
  baseCurrency: string | null
  currentSessionId?: string | null
  currentSessionName?: string | null
  currentTermId?: string | null
  currentTermName?: string | null
  currentSchoolSessionTermId?: string | null
  currentClassName?: string | null
  currentSchoolClassId?: string | null
  currentSchoolArmName?: string | null
  currentSchoolArmId?: string | null
  totalClasses: number
  totalSubscribedSubjects: number
  currentSessionClasses: StudentPortalLaunchClassI[]
  sessions: StudentPortalLaunchSessionI[]
}

// ─── Student Portal weekly timetable (StudentPortal/TimetableByWeek) ────────
// Live-verified 2026-08-20: uses the same {isSuccess, value} envelope as
// every other endpoint in this file (an earlier guess of a distinct
// {code, status, data} envelope was wrong and silently returned no data).
// Distinct from the older, unwired StudentPortalTimetableI above (see
// GetStudentPortalTimetableParamsI).

export interface GetStudentPortalTimetableByWeekParamsI {
  studentId: string
  schoolId: string
  // Query params — names inferred from this codebase's existing conventions
  // (weekStartDate matches the older /StudentPortal/Timetable endpoint;
  // schoolClassId matches every other class-scoped endpoint), NOT confirmed
  // against a live Swagger doc. Verify against the real backend contract.
  schoolClassId?: string
  weekStartDate?: string
}

export interface StudentPortalTimetableByWeekSlotI {
  id: string
  schoolSessionId: string
  schoolSessionTermId: string
  schoolClassId: string
  schoolClassName: string
  timetableType: string
  dayOfWeek: string
  dayOfWeekName: string
  periodTypeId: string
  periodTypeName: string
  periodTypeCode: string
  startTime: string
  formattedStartTime: string
  endTime: string
  formattedEndTime: string
  subjectId: string
  subjectName: string
  classMode: string
  venue: string | null
}

export interface StudentPortalTimetableByWeekDataI {
  schoolId: string
  schoolSessionId: string
  schoolSessionTermId: string
  // Live-verified null when the endpoint isn't filtered to one class.
  schoolClassId: string | null
  weekStartDate: string
  formattedWeekStartDate: string
  weekEndDate: string
  totalSlotsThisWeek: number
  slots: StudentPortalTimetableByWeekSlotI[]
}

export interface GetStudentPortalTimetableByWeekResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: StudentPortalTimetableByWeekDataI
}

export interface GetStudentPortalLaunchResponseI {
  isSuccess: boolean
  message: string
  error?: string
  isFailure?: boolean
  statusCode: number
  value: StudentPortalLaunchDataI
}

// ─── Student self-service attendance (Student/GetMyAttendance) ──────────────
// Same {isSuccess, value} envelope as every other endpoint in this app —
// used here instead of the {code, status, data} shape a spec described,
// since that shape has been wrong before (Student/GetById) against the live
// response for what looked like the same kind of endpoint.

export interface GetMyAttendanceParamsI {
  studentId: string
  schoolId: string
  schoolClassId?: string
  schoolSessionId?: string
  schoolSessionTermId?: string
  startDate?: string
  endDate?: string
}

export interface StudentAttendanceRecordItemI {
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

export interface StudentAttendanceResultI {
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

  records: StudentAttendanceRecordItemI[]
}

export interface GetMyAttendanceResponseI {
  isSuccess: boolean
  message?: string
  error?: string
  isFailure?: boolean
  value: StudentAttendanceResultI
}

// ─── Admin Student Details (Student/GetById) ────────────────────────────────
// Live-verified 2026-08-24: this endpoint uses the same {isSuccess, value}
// envelope as every other endpoint here (an earlier guess of a distinct
// {code, status, data} envelope was wrong and made the details page always
// hit its "student not found" branch). Also confirmed live: `gender` and
// `status` (both here and per-enrollment) serialize as their string enum
// names ("Male", "Active"), not numbers — same gotcha as SchoolStudentItemI.

export interface StudentEnrolledClassI {
  enrollmentId: string
  schoolClassId: string
  schoolClassName: string
  schoolArmId: string | null
  schoolArmName: string | null
  sessionId: string
  sessionName: string
  isPrimary: boolean
  status: number | string
}

export interface StudentBillI {
  schoolStudentBillId: string
  invoiceNumber: string
  schoolClassId: string
  schoolClassName: string
  sessionName: string
  termName: string
  paymentStatus: string
  totalAmount: number
  amountPaid: number
  balance: number
}

export interface StudentFeeStatusI {
  overallStatus: string
  totalBilled: number
  amountPaid: number
  outstandingBalance: number
  bills: StudentBillI[]
}

export interface StudentDetailSubjectI {
  subjectId: string
  subjectName: string
  classId?: string
  className?: string
  isActive: boolean
}

export interface StudentClassTimetableEntryI {
  dayOfWeek: number
  dayOfWeekName: string
  formattedStartTime: string
  formattedEndTime: string
  subjectName: string
  classModeName: string
}

export interface StudentMedicalInformationI {
  bloodGroup: string | null
  genotype: string | null
  allergies: string | null
  chronicConditions: string | null
  disabilities: string | null
  specialNeeds: boolean
  specialNeedsDescription: string | null
}

export interface StudentDetailDataI {
  profile?: StudentProfileData
  studentId: string
  studentGivenId: string
  schoolId: string
  firstname: string
  lastname: string
  fullName: string
  email: string
  phoneNumber: string
  dateofBirth: string
  gender: number | string
  profilePicture: string | null
  nationality: string | null
  stateOfOrigin: string | null
  city: string | null
  localGovernment: string | null
  homeAddress: string | null
  religion: string | null
  status: number | string
  admissionDate: string | null
  previousSchool?: string | null
  lastClass?: string | null
  lastSession?: string | null
  lastTerm?: string | null
  reasonForLeaving?: string | null

  currentSessionId: string
  currentSessionName: string
  currentTermId: string
  currentTermName: string

  primarySchoolClassName: string | null

  enrolledClasses: StudentEnrolledClassI[]
  guardians: StudentGuardianI[]
  feeStatus: StudentFeeStatusI
  subjects: StudentDetailSubjectI[]
  classTimetable: StudentClassTimetableEntryI[]
  medicalInformation: StudentMedicalInformationI
}

export interface GetStudentDetailResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: StudentDetailDataI
}
