/* eslint-disable @typescript-eslint/no-explicit-any */

export interface SubjectItem {
  Id: string
  SchoolId: string
  Name: string
  Description?: string | null
  IsPublic?: boolean
}

export interface BulkCreateSubjectsPayloadI {
  schoolId: string
  subjects: { name: string; description?: string; isPublic?: boolean }[]
}

export interface BulkCreateSubjectsResponseI {
  Value: SubjectItem[]
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface CreateSubjectPayloadI {
  description?: string | null
  isPublic?: boolean
  schoolId: string
  name: string
}

export interface CreateSubjectResponseI {
  Value: SubjectItem
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface UpdateSubjectPayloadI {
  description?: string | null
  isPublic?: boolean
  id: string
  name: string
}

export interface UpdateSubjectResponseI {
  Value: SubjectItem
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface DeleteSubjectPayloadI {
  id: string
}

export interface DeleteSubjectResponseI {
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface GetSubjectByIdResponseI {
  Value: SubjectItem
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface GetAllSubjectsResponseI {
  Value: SubjectItem[]
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface GetAllSubjectsParams {
  schoolId: string
  search?: string
  pageNumber?: number
  pageSize?: number
}

export interface SubjectListItemI {
  description?: string | null
  isPublic?: boolean
  id: string
  schoolId: string
  name: string
}

export interface PaginatedSubjectsValueI {
  items: SubjectListItemI[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface GetAllSubjectsPaginatedResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: PaginatedSubjectsValueI
}

export interface ClassItem {
  Id: string
  ClsName: string
  CategoryId: string
  CategoryName: string
  SchoolId: string
  SchoolName: string
  DateCreated: string
  ClassType?: number | string
}

export interface ClassArmItem {
  Id: string
  SchoolId: string
  ArmName: string
  Description: string
}

export interface CreateClassPayloadI {
  clsName: string
  categoryId: string
  schoolId: string
  classType: number
  armIds?: string[]
}

export interface CreateClassResponseI {
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface UpdateClassPayloadI {
  id: string
  clsName: string
  categoryId: string
  schoolId: string
  classType: number
}

export interface UpdateClassResponseI {
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface DeleteClassResponseI {
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface GetClassArmsResponseI {
  Value: ClassArmItem[]
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface AssignClassArmsPayloadI {
  classId: string
  armIds: string[]
  schoolId: string
}

export interface AssignClassArmsResponseI {
  isSuccess: boolean
  error: string
  timestamp: string
  isFailure: boolean
}

export interface GetAllClassesParams {
  schoolId?: string
  categoryId?: string
  keyword?: string
  pageNumber?: number
  pageSize?: number
}

export interface PaginatedClassesValue {
  Items: ClassItem[]
  PageNumber: number
  PageSize: number
  TotalItems: number
  TotalPages: number
}

export interface GetAllClassesResponseI {
  Value: PaginatedClassesValue
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface GetClassByIdResponseI {
  Value: ClassItem
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface SecondaryClassItemI {
  id: string
  clsName: string
  categoryId: string
  categoryName: string
  schoolId: string
  schoolName: string
  classType: number | string
  classTypeName: string
  dateCreated: string
}

export interface GetSecondaryClassesResponseI {
  isSuccess: boolean
  message?: string
  error?: string
  isFailure?: boolean
  statusCode?: number
  value: SecondaryClassItemI[]
}

export interface CategoryItem {
  Id: string
  SchoolId: string
  SchoolName: string
  CatName: string
  DateCreated: string
}

export interface CreateCategoryPayloadI {
  schoolId: string
  catName: string
}

export interface CreateCategoryResponseI {
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface UpdateCategoryPayloadI {
  id: string
  schoolId: string
  catName: string
}

export interface UpdateCategoryResponseI {
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface DeleteCategoryResponseI {
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface GetAllCategoriesParams {
  schoolId?: string
  keyword?: string
  pageNumber?: number
  pageSize?: number
}

export interface PaginatedCategoriesValue {
  Items: CategoryItem[]
  PageNumber: number
  PageSize: number
  TotalItems: number
  TotalPages: number
}

export interface GetAllCategoriesResponseI {
  Value: PaginatedCategoriesValue
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface GetCategoryByIdResponseI {
  Value: CategoryItem
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface SchoolArmItem {
  Id: string
  SchoolId: string
  ArmName: string
  Description: string
}

export interface CreateSchoolArmPayloadI {
  schoolId: string
  armName: string
  description: string
}

export interface CreateSchoolArmResponseI {
  Value: SchoolArmItem
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface UpdateSchoolArmPayloadI {
  id: string
  armName: string
  description: string
}

export interface UpdateSchoolArmResponseI {
  Value: SchoolArmItem
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface DeleteSchoolArmPayloadI {
  id: string
}

export interface DeleteSchoolArmResponseI {
  Value: SchoolArmItem
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface GetSchoolArmByIdResponseI {
  Value: SchoolArmItem
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface GetAllSchoolArmsResponseI {
  Value: SchoolArmItem[]
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface DepartmentItem {
  Id: string
  Name: string
  Description: string
  SchoolId: string
  SchoolName: string
  Status: number
  StatusName: string
  DateCreated: string
  DateModified: string
}

export interface CreateDepartmentPayloadI {
  name: string
  description: string
  schoolId: string
}

export interface CreateDepartmentResponseI {
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface UpdateDepartmentPayloadI {
  id: string
  name: string
  description: string
  status: number
}

export interface UpdateDepartmentResponseI {
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface DeleteDepartmentResponseI {
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface GetDepartmentsBySchoolResponseI {
  Value: DepartmentItem[]
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface GetDepartmentsBySchoolPaginatedParams {
  schoolId: string
  pageNumber?: number
  pageSize?: number
  keyword?: string
}

export interface PaginatedDepartmentsValue {
  Items: DepartmentItem[]
  PageNumber: number
  PageSize: number
  TotalItems: number
  TotalPages: number
}

export interface GetDepartmentsBySchoolPaginatedResponseI {
  Value: PaginatedDepartmentsValue
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface GetDepartmentByIdResponseI {
  Value: DepartmentItem
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface SchoolGradeItem {
  Id: string
  Grade: string
  Description: string
  MinScore: number
  MaxScore: number
  SchoolId: string
  SchoolName: string
  DateCreated: string
  DateModified: string
}

export interface CreateSchoolGradePayloadI {
  grade: string
  description: string
  minScore: number
  maxScore: number
  schoolId: string
}

export interface CreateSchoolGradeResponseI {
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface UpdateSchoolGradePayloadI {
  id: string
  grade: string
  description: string
  minScore: number
  maxScore: number
}

export interface UpdateSchoolGradeResponseI {
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface DeleteSchoolGradeResponseI {
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface GetSchoolGradesBySchoolResponseI {
  Value: SchoolGradeItem[]
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface GetSchoolGradesBySchoolPaginatedParams {
  schoolId: string
  pageNumber?: number
  pageSize?: number
  keyword?: string
}

export interface PaginatedSchoolGradesValue {
  Items: SchoolGradeItem[]
  PageNumber: number
  PageSize: number
  TotalItems: number
  TotalPages: number
}

export interface GetSchoolGradesBySchoolPaginatedResponseI {
  Value: PaginatedSchoolGradesValue
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface GetSchoolGradeByIdResponseI {
  Value: SchoolGradeItem
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

// ─── SchoolAssessment ─────────────────────────────────────────────────────────

export interface AssessmentComponentPayload {
  assessmentName: string
  weightPercentage: number
}

export interface AssessmentComponentItem {
  Id: string
  AssessmentName: string
  WeightPercentage: number
}

export interface SchoolAssessmentItem {
  Id: string
  SchoolId: string
  SchoolName: string
  StructureName: string
  SchoolSessionId: string
  SchoolSessionName: string
  DateCreated: string
  DateModified: string
  Components: AssessmentComponentItem[]
}

export interface CreateSchoolAssessmentPayloadI {
  schoolId: string
  structureName: string
  schoolSessionId: string
  components: AssessmentComponentPayload[]
}

export interface CreateSchoolAssessmentResponseI {
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface UpdateSchoolAssessmentPayloadI {
  id: string
  structureName: string
  schoolSessionId: string
  components: AssessmentComponentPayload[]
}

export interface UpdateSchoolAssessmentResponseI {
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface DeleteSchoolAssessmentResponseI {
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface GetSchoolAssessmentsBySchoolParams {
  schoolId: string
  schoolSessionId?: string
}

export interface GetSchoolAssessmentsBySchoolResponseI {
  Value: SchoolAssessmentItem[]
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface GetSchoolAssessmentsBySchoolPaginatedParams {
  schoolId: string
  schoolSessionId?: string
  pageNumber?: number
  pageSize?: number
  keyword?: string
}

export interface PaginatedSchoolAssessmentsValue {
  Items: SchoolAssessmentItem[]
  PageNumber: number
  PageSize: number
  TotalItems: number
  TotalPages: number
}

export interface GetSchoolAssessmentsBySchoolPaginatedResponseI {
  Value: PaginatedSchoolAssessmentsValue
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface GetSchoolAssessmentByIdResponseI {
  Value: SchoolAssessmentItem
  IsSuccess: boolean
  Error: string
  Timestamp: any
  IsFailure: boolean
}

export interface ClassSubjectItem {
  id: string
  classId: string
  className: string
  subjectId: string
  subjectName: string
  schoolId: string
  status: string
  dateCreated: string
  requirement?: number | string
}

export interface AssignClassSubjectPayloadI {
  classIds: string[]
  subjectId: string
  schoolId: string
  requirement: number
}

export interface AssignClassSubjectResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}

export interface RemoveClassSubjectResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}

export interface GetSubjectsByClassParams {
  classId: string
  schoolId: string
}

export interface GetSubjectsByClassResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: ClassSubjectItem[]
}

export interface GetClassesBySubjectParams {
  subjectId: string
  schoolId: string
}

export interface GetClassesBySubjectResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: ClassSubjectItem[]
}

export interface GradeMyClassItemI {
  classId: string
  className: string
}

export interface GetGradeMyClassesParamsI {
  schoolId: string
}

export interface GetGradeMyClassesResponseI {
  isSuccess: boolean
  error: string
  timestamp: string
  isFailure: boolean
  value: GradeMyClassItemI[]
}

export interface GradeMySubjectItemI {
  subjectId: string
  subjectName: string
}

export interface GetGradeMySubjectsParamsI {
  classId: string
  schoolId: string
}

export interface GetGradeMySubjectsResponseI {
  isSuccess: boolean
  error: string
  timestamp: string
  isFailure: boolean
  value: GradeMySubjectItemI[]
}

export interface GradeWorksheetStudentScoreI {
  score: number
  manualScore: number
  automatedScore: number
  studentId: string
}

export interface GradeWorksheetAssessmentI {
  id: string
  name: string
  weightPercentage: number
  studentScores: GradeWorksheetStudentScoreI[]
}

export interface GradeWorksheetI {
  schoolId: string
  sessionId: string
  termId: string
  classId: string
  subjectId: string
  status: string
  assessment: GradeWorksheetAssessmentI[]
}

export interface GetGradeWorksheetParamsI {
  schoolId: string
  sessionId: string
  schoolSessionTermId: string
  classId: string
  subjectId: string
}

export interface GetGradeWorksheetResponseI {
  isSuccess: boolean
  error: string
  timestamp: string
  isFailure: boolean
  value: GradeWorksheetI
}

export interface SubmitGradeWorksheetAssessmentScoreI {
  score: number
  studentId: string
}

export interface SubmitGradeWorksheetAssessmentI {
  id: string
  studentScores: SubmitGradeWorksheetAssessmentScoreI[]
}

export interface SubmitGradeWorksheetPayloadI {
  schoolId: string
  sessionId: string
  termId: string
  classId: string
  subjectId: string
  assessment: SubmitGradeWorksheetAssessmentI[]
}

export interface SubmitGradeWorksheetResponseI {
  isSuccess: boolean
  error: string
  timestamp: string
  isFailure: boolean
}

export interface SaveGradeWorksheetDraftResponseI {
  isSuccess: boolean
  error: string
  timestamp: string
  isFailure: boolean
}

export interface GradeWorksheetSummaryI {
  worksheetId: string
  subjectName: string
  className: string
  sessionName: string
  termName: string
  totalStudents: number
  gradeDistribution: string
  status: string
  submittedBy: string
  dateModified: string
}

export interface GetAllGradeWorksheetsParamsI {
  schoolId: string
  sessionId?: string
  status?: number
}

export interface GetAllGradeWorksheetsResponseI {
  isSuccess: boolean
  error: string
  timestamp: string
  isFailure: boolean
  value: GradeWorksheetSummaryI[]
}

export interface GradeWorksheetTopPerformerI {
  studentId: string
  studentName: string
  score: number
}

export interface GradeWorksheetStudentResultI {
  position: number
  studentId: string
  studentName: string
  scores: Record<string, number>
  total: number
  grade: string
}

export interface GradeWorksheetDetailI {
  worksheetId: string
  className: string
  subjectName: string
  sessionName: string
  termName: string
  submittedOn: string
  submittedBy?: string
  status: string
  totalStudents: number
  averageScore: number
  highestScore: number
  lowestScore: number
  gradeA: number
  gradeB: number
  gradeC: number
  belowC: number
  topPerformer: GradeWorksheetTopPerformerI
  students: GradeWorksheetStudentResultI[]
}

export interface GetGradeWorksheetByIdResponseI {
  isSuccess: boolean
  error: string
  timestamp: string
  isFailure: boolean
  value: GradeWorksheetDetailI
}

export interface ApproveGradeWorksheetResponseI {
  isSuccess: boolean
  error: string
  timestamp: string
  isFailure: boolean
}

export interface RejectGradeWorksheetPayloadI {
  worksheetId: string
  reason: string
}

export interface RejectGradeWorksheetResponseI {
  isSuccess: boolean
  error: string
  timestamp: string
  isFailure: boolean
}

export interface LookupStudentResultPayloadI {
  studentNumber: string
  schoolClassId: string
  schoolSessionId: string
  schoolSessionTermId: string
}

export interface LookupResultStudentInfoI {
  studentName: string
  admissionNumber: string
  className: string
  sessionName: string
  termName: string
}

export interface LookupResultAcademicSummaryI {
  totalScore: number
  averageScore: number
  position: number
  gpa: number
  subjectCount: number
}

export interface LookupResultAssessmentI {
  assessmentName: string
  score: number
}

export interface LookupResultSubjectBreakdownI {
  subjectName: string
  totalScore: number
  grade: string
  assessments: LookupResultAssessmentI[]
}

export interface LookupResultPerformanceSummaryI {
  highestSubject: string
  lowestSubject: string
  bestGrade: string
  weakestGrade: string
  passRate: number
}

export interface LookupResultAnalysisSummaryI {
  totalSubjects: number
  passedSubjects: number
  failedSubjects: number
  averageScore: number
  gradeDistribution: Record<string, number>
}

export interface LookupResultTrendDataI {
  session: string
  term: string
  gpa: number
  averageScore: number
  position: number
}

export interface LookupStudentResultValueI {
  studentInfo: LookupResultStudentInfoI
  academicSummary: LookupResultAcademicSummaryI
  subjectBreakdown: LookupResultSubjectBreakdownI[]
  performanceSummary: LookupResultPerformanceSummaryI
  analysisSummary: LookupResultAnalysisSummaryI
  trendData: LookupResultTrendDataI[]
}

export interface LookupStudentResultResponseI {
  isSuccess: boolean
  error: string
  timestamp: string
  isFailure: boolean
  value: LookupStudentResultValueI
}

export interface SubUserClassItemI {
  id: string
  subUserId: string
  subUserName: string
  subUserEmail: string
  classId: string
  className: string
  status: number
  statusName: string
  dateCreated: string
  dateModified: string
}

export interface AssignSubUserClassPayloadI {
  subUserId: string
  classIds: string[]
  schoolId: string
}

export interface AssignSubUserClassResponseI {
  isSuccess: boolean
  error: string
  timestamp: string
  isFailure: boolean
}

export interface RemoveSubUserClassResponseI {
  isSuccess: boolean
  error: string
  timestamp: string
  isFailure: boolean
}

export interface GetSubUserClassesBySubUserResponseI {
  isSuccess: boolean
  error: string
  timestamp: string
  isFailure: boolean
  value: SubUserClassItemI[]
}

export interface GetSubUserClassesByClassParamsI {
  classId: string
  schoolId: string
}

export interface GetSubUserClassesByClassResponseI {
  isSuccess: boolean
  error: string
  timestamp: string
  isFailure: boolean
  value: SubUserClassItemI[]
}

export interface SubUserSubjectItemI {
  id: string
  subUserId: string
  subUserName: string
  subUserEmail: string
  subjectId: string
  subjectName: string
  classId: string | null
  className: string | null
  status: number
  statusName: string
  dateCreated: string
  dateModified: string
}

export interface GetSubUserSubjectsBySubUserResponseI {
  isSuccess: boolean
  error: string
  timestamp: string
  isFailure: boolean
  value: SubUserSubjectItemI[]
}

export interface TeacherAssignedArmI {
  armId: string
  armName: string
}

export interface TeacherAssignedClassI {
  classId: string
  className: string
  categoryName: string
  arms: TeacherAssignedArmI[]
}

export interface TeacherDetailsValueI {
  subUserId: string
  productUserSubUserId: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string
  status: string
  qualification: string
  employmentType: string
  dateCreated: string
  assignedClasses: TeacherAssignedClassI[]
}

export interface TeacherDetailsResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: TeacherDetailsValueI
}

export interface GetTeacherDetailsParamsI {
  subUserId: string
  schoolId: string
}

export interface TeacherSubjectAssignmentI {
  classId: string
  subjectId: string
}

export interface AssignSubUserSubjectPayloadI {
  subUserId: string
  schoolId: string
  assignments?: TeacherSubjectAssignmentI[]
  subjectIds?: string[]
}

export interface AssignSubUserSubjectResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}

export interface RemoveSubUserSubjectResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}

export interface GetSubUserSubjectsBySubjectParamsI {
  subjectId: string
  schoolId: string
}

export interface GetSubUserSubjectsBySubjectResponseI {
  isSuccess: boolean
  error: string
  isFailure: boolean
  value: SubUserSubjectItemI[]
}

export interface SubUserDepartmentItemI {
  id: string
  subUserId: string
  subUserName: string
  subUserEmail: string
  departmentId: string
  departmentName: string
  status: number
  statusName: string
  dateCreated: string
  dateModified: string
}

export interface AssignSubUserDepartmentPayloadI {
  subUserId: string
  departmentId: string
}

export interface AssignSubUserDepartmentResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}

export interface RemoveSubUserDepartmentResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
}

export interface GetSubUserDepartmentsByDepartmentResponseI {
  isSuccess: boolean
  error: string
  isFailure: boolean
  value: SubUserDepartmentItemI[]
}

export interface GetSubUserDepartmentsBySubUserResponseI {
  isSuccess: boolean
  error: string
  isFailure: boolean
  value: SubUserDepartmentItemI[]
}

export interface PaginatedListI<T> {
  items: T[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface ClassDashboardParamsI {
  schoolId?: string
  classId?: string
  sessionId?: string
  termId?: string
  pageNumber?: number
  pageSize?: number
}

export interface ClassDashboardResultItemI {
  id: string
  schoolClassId: string
  className: string
  schoolSessionId: string
  sessionName: string
  schoolSessionTermId: string
  termName: string
  status: string
  totalStudents: number
  averageScore: number
  highestAverage: number
  lowestAverage: number
  passCount: number
  failedCount: number
  subjectCount: number
}

export interface ClassDashboardValueI {
  totalClasses: number
  submittedCount: number
  publishedCount: number
  results: PaginatedListI<ClassDashboardResultItemI>
}

export interface ClassDashboardResponseI {
  isSuccess: boolean
  error: string
  isFailure: boolean
  statusCode: number
  value: ClassDashboardValueI
}

export interface ClassResultDetailsParamsI {
  classCummaltiveResultId: string
  search?: string
  pageNumber?: number
  pageSize?: number
}

export interface ClassResultDetailsHeaderI {
  classCummaltiveResultId: string
  className: string
  sessionName: string
  termName: string
  status: string
  totalStudents: number
  averageScore: number
  highestAverage: number
  lowestAverage: number
  passCount: number
  failedCount: number
}

export interface ClassResultStudentItemI {
  studentCummulativeResultId: string
  studentId: string
  studentName: string
  admissionNumber: string
  position: number
  totalScore: number
  averageScore: number
  subjectCount: number
  remark: string
  isPublished: boolean
  status: string
  datePublished: string | null
}

export interface ClassResultDetailsValueI {
  header: ClassResultDetailsHeaderI
  students: PaginatedListI<ClassResultStudentItemI>
}

export interface ClassResultDetailsResponseI {
  isSuccess: boolean
  error: string
  isFailure: boolean
  statusCode: number
  value: ClassResultDetailsValueI
}

export interface StudentResultDetailsHeaderI {
  studentCummulativeResultId: string
  studentId: string
  studentName: string
  admissionNumber: string
  className: string
  sessionName: string
  termName: string
  position: number
  totalScore: number
  averageScore: number
  subjectCount: number
  remark: string
  isPublished: boolean
  status: string
  datePublished: string | null
}

export interface StudentSubjectAssessmentI {
  assessmentName: string
  score: number
}

export interface StudentSubjectResultI {
  subjectId: string
  subjectName: string
  totalScore: number
  grade: string
  assessments: StudentSubjectAssessmentI[]
}

export interface StudentPerformanceBreakdownI {
  subjectName: string
  caScore: number
  examScore: number
}

export interface StudentResultDetailsValueI {
  header: StudentResultDetailsHeaderI
  subjectResults: StudentSubjectResultI[]
  performanceBreakdown: StudentPerformanceBreakdownI[]
  teacherRemark: string
}

export interface StudentResultDetailsResponseI {
  isSuccess: boolean
  error: string
  isFailure: boolean
  statusCode: number
  value: StudentResultDetailsValueI
}

export interface PublishClassResultResponseI {
  isSuccess: boolean
  error: string
  isFailure: boolean
  statusCode: number
}

export interface PublishStudentResultResponseI {
  isSuccess: boolean
  message?: string
  error: string
  isFailure: boolean
  statusCode: number
}

export interface PublishStudentResultResponseI {
  isSuccess: boolean
  message?: string
  error: string
  isFailure: boolean
  statusCode: number
}

export interface PublishStudentResultResponseI {
  isSuccess: boolean
  message?: string
  error: string
  isFailure: boolean
  statusCode: number
}

export interface ExamRecordsOverviewParamsI {
  schoolId: string
  sessionId?: string
  termId?: string
}

export interface ExamRecordsOverviewResponse {
  isSuccess: boolean
  error?: string
  isFailure?: boolean
  statusCode: number
  message: string
  value: ExamRecordsOverviewDto
}

export interface ExamRecordsOverviewDto {
  currentSessionId: string
  currentTermId: string
  currentSessionName: string
  currentTermName: string
  availableSessions: {
    id: string
    sessionName: string
    isCurrent: boolean
    terms: {
      id: string
      termName: string
      status: string
      isCurrent: boolean
    }[]
  }[]
  examsConducted: number
  examsConductedChange: number
  overallPassRate: number
  overallPassRateChange: number
  studentsPassed: number
  studentsPassedTotal: number
  studentsPassedChange: number
  atRiskStudents: number
  atRiskStudentsChange: number
  totalClasses: number
  totalCategories: number
  totalSubjects: number
  totalDepartments: number
  totalStudents: number
  gradeDistribution: {
    grade: string
    scoreRange: string
    label: string
    count: number
    percentage: number
  }[]

  performanceByClass: {
    classId: string
    className: string
    avgScore: number
    passRate: number
  }[]

  performanceBySubject: {
    subjectId: string
    subjectName: string
    avgScore: number
    passRate: number
  }[]

  recentActivities: {
    id: string
    title: string
    subtitle: string
    activityType: string
    occurredAt: string
    timeAgo: string
  }[]
}

export type ExamRecordsOverviewResponseI = ExamRecordsOverviewResponse
export type ExamRecordsOverviewValueI = ExamRecordsOverviewDto

export interface StudentGradingSelectItemI {
  studentId: string
  studentName: string
  admissionNumber: string
  gender: string
}

export interface GetClassStudentsForGradingParamsI {
  schoolId: string
  classId: string
  sessionId: string
  schoolSessionTermId: string
}

export interface GetClassStudentsForGradingResponseI {
  isSuccess: boolean
  error: string
  isFailure: boolean
  statusCode: number
  value: StudentGradingSelectItemI[]
}

export interface AssessmentComponentInfoI {
  id: string
  name: string
  weightPercentage: number
}

export interface ComponentScoreI {
  assessmentComponentId: string
  assessmentComponentName: string
  weightPercentage: number
  score: number
  manualScore: number
  automatedScore: number
}

export interface AutomatedScoreContributionAuditParamsI {
  schoolId: string
  schoolSessionId?: string
  schoolSessionTermId?: string
  schoolClassId?: string
  schoolCourseId?: string
  assessmentComponentId?: string
  search?: string
  includeInactive?: boolean
  pageNumber?: number
  pageSize?: number
}

export interface AutomatedScoreContributionAuditItemI {
  id: string
  assignmentId: string
  assignmentTitle: string
  attemptId: string
  attemptNumber: number
  studentId: string
  studentName: string
  schoolSessionId: string
  sessionName: string
  schoolSessionTermId: string
  termName: string
  schoolClassId: string
  className: string
  schoolCourseId: string
  subjectName: string
  assessmentComponentId: string
  assessmentComponentName: string
  rawPoints: number
  availablePoints: number
  percentageScore: number
  contributionPoints: number
  isActive: boolean
  approvedByUserId: string
  approvedBy: string
  approvedAtUtc: string
}

export interface AutomatedScoreContributionAuditValueI {
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
  activeContributionTotal: number
  items: AutomatedScoreContributionAuditItemI[]
}

export interface AutomatedScoreContributionAuditResponseI {
  isSuccess: boolean
  message?: string
  error?: string
  isFailure: boolean
  statusCode: number
  value: AutomatedScoreContributionAuditValueI
}

export type WorksheetStatus =
  "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | null

export interface StudentSubjectScoreItemI {
  subjectId: string
  subjectName: string
  isMandatory: boolean
  worksheetId: string | null
  worksheetStatus: WorksheetStatus
  canEdit: boolean
  isLocked: boolean
  lockReason: string | null
  scores: ComponentScoreI[]
  totalScore: number
  grade: string
  remark: string
}

export interface StudentSubjectScoresStudentI {
  studentId: string
  studentName: string
  admissionNumber: string
  schoolClassId: string
  className: string
  schoolSessionId: string
  sessionName: string
  schoolSessionTermId: string
  termName: string
}

export interface StudentSubjectScoresSummaryI {
  totalSubjects: number
  totalScore: number
  averageScore: number
}

export interface StudentSubjectScoresValueI {
  studentInfo: StudentSubjectScoresStudentI
  assessmentComponents: AssessmentComponentInfoI[]
  subjects: StudentSubjectScoreItemI[]
  summary: StudentSubjectScoresSummaryI
}

export interface GetStudentSubjectScoresParamsI {
  schoolId: string
  sessionId: string
  schoolSessionTermId: string
  classId: string
  studentId: string
}

export interface GetStudentSubjectScoresResponseI {
  isSuccess: boolean
  error: string
  isFailure: boolean
  statusCode: number
  value: StudentSubjectScoresValueI
}

export interface SaveStudentScoresDraftSubjectScoreI {
  assessmentComponentId: string
  score: number
}

export interface SaveStudentScoresDraftSubjectI {
  subjectId: string
  scores: SaveStudentScoresDraftSubjectScoreI[]
}

export interface SaveStudentScoresDraftPayloadI {
  schoolId: string
  sessionId: string
  schoolSessionTermId: string
  classId: string
  studentId: string
  subjects: SaveStudentScoresDraftSubjectI[]
}

export interface SaveStudentScoresDraftResponseI {
  isSuccess: boolean
  message?: string
  error?: string
  isFailure: boolean
  statusCode: number
}

export interface AssessmentComponentInfo {
  id: string
  name: string
  weightPercentage: number
}

export interface BroadsheetSubjectHeader {
  subjectId: string
  subjectName: string
  isMandatory: boolean
  worksheetId: string | null
  worksheetStatus: "NOT_STARTED" | "DRAFT" | "PENDING" | "APPROVED" | "REJECTED"
  isApproved: boolean
  canEdit: boolean
  isComplete: boolean
  canSubmit: boolean
  missingScoresCount: number
  enrolledStudentsCount: number
}

export interface BroadsheetStudentRow {
  studentId: string
  studentName: string
  admissionNumber: string
  gender: string
  subjectScores: BroadsheetStudentSubjectScore[]
}

export interface BroadsheetStudentSubjectScore {
  subjectId: string
  subjectName: string
  isOffering: boolean
  scores: ComponentScore[]
  totalScore: number
}

export interface ComponentScore {
  assessmentComponentId: string
  assessmentComponentName: string
  weightPercentage: number
  score: number
  manualScore: number
  automatedScore: number
}

export interface BroadsheetResponseDto {
  schoolId: string
  schoolName: string
  schoolClassId: string
  className: string
  schoolSessionId: string
  sessionName: string
  schoolSessionTermId: string
  termName: string
  allSubjectsApproved: boolean
  canEditAny: boolean
  canSubmitAny: boolean
  gradingScale: {
    grade: string
    description: string
    minScore: number
    maxScore: number
  }[]
  isAdmin: boolean
  assessmentComponents: AssessmentComponentInfo[]
  subjects: BroadsheetSubjectHeader[]
  students: BroadsheetStudentRow[]
}

export interface SaveBroadsheetDraftCommand {
  schoolId: string
  classId: string
  sessionId: string
  schoolSessionTermId: string
  subjects: {
    subjectId: string
    studentScores: {
      studentId: string
      componentScores: {
        assessmentComponentId: string
        score: number
      }[]
    }[]
  }[]
}

export interface SubmitBroadsheetCommand {
  schoolId: string
  classId: string
  sessionId: string
  schoolSessionTermId: string
  subjects?: BroadsheetSubjectDraftDto[]
}

export interface BroadsheetSubjectDraftDto {
  subjectId: string
  studentScores: {
    studentId: string
    componentScores: {
      assessmentComponentId: string
      score: number
    }[]
  }[]
}

export interface SaveBroadsheetDraftResponseI {
  isSuccess: boolean
  message?: string
  error?: string
  isFailure?: boolean
  statusCode?: number
}

export interface SubmitBroadsheetResponseDto {
  schoolClassId: string
  submittedSubjectCount: number
  submittedSubjects: string[]
  skippedSubjectCount: number
  skippedSubjects: {
    subjectId: string
    subjectName: string
    missingScoresCount: number
    reason: string
  }[]
  message: string
}
