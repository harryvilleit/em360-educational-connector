/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient, { ApiError } from "../api"
import { toCamelCase } from "@/utils/caseConversion"
import { normalizeResponse } from "@/utils/apiResponse"
import type {
  BulkCreateSubjectsPayloadI,
  CreateSubjectPayloadI,
  UpdateSubjectPayloadI,
  DeleteSubjectPayloadI,
  GetAllSubjectsParams,
  GetAllSubjectsPaginatedResponseI,
  CreateClassPayloadI,
  UpdateClassPayloadI,
  AssignClassArmsPayloadI,
  GetAllClassesParams,
  GetSecondaryClassesResponseI,
  CreateCategoryPayloadI,
  UpdateCategoryPayloadI,
  GetAllCategoriesParams,
  CreateSchoolArmPayloadI,
  UpdateSchoolArmPayloadI,
  DeleteSchoolArmPayloadI,
  CreateDepartmentPayloadI,
  UpdateDepartmentPayloadI,
  GetDepartmentsBySchoolPaginatedParams,
  CreateSchoolGradePayloadI,
  UpdateSchoolGradePayloadI,
  GetSchoolGradesBySchoolPaginatedParams,
  CreateSchoolAssessmentPayloadI,
  UpdateSchoolAssessmentPayloadI,
  GetSchoolAssessmentsBySchoolParams,
  GetSchoolAssessmentsBySchoolPaginatedParams,
  AssignClassSubjectPayloadI,
  AssignClassSubjectResponseI,
  RemoveClassSubjectResponseI,
  GetSubjectsByClassParams,
  GetSubjectsByClassResponseI,
  GetClassesBySubjectParams,
  GetClassesBySubjectResponseI,
  GetGradeMyClassesParamsI,
  GetGradeMyClassesResponseI,
  GetGradeMySubjectsParamsI,
  GetGradeMySubjectsResponseI,
  GetGradeWorksheetParamsI,
  GetGradeWorksheetResponseI,
  SubmitGradeWorksheetPayloadI,
  SubmitGradeWorksheetResponseI,
  SaveGradeWorksheetDraftResponseI,
  GetAllGradeWorksheetsParamsI,
  GetAllGradeWorksheetsResponseI,
  GetGradeWorksheetByIdResponseI,
  ApproveGradeWorksheetResponseI,
  RejectGradeWorksheetPayloadI,
  RejectGradeWorksheetResponseI,
  AssignSubUserClassPayloadI,
  AssignSubUserClassResponseI,
  RemoveSubUserClassResponseI,
  GetSubUserClassesBySubUserResponseI,
  GetSubUserClassesByClassParamsI,
  GetSubUserClassesByClassResponseI,
  LookupStudentResultPayloadI,
  LookupStudentResultResponseI,
  GetSubUserSubjectsBySubUserResponseI,
  GetTeacherDetailsParamsI,
  TeacherDetailsResponseI,
  AssignSubUserSubjectPayloadI,
  AssignSubUserSubjectResponseI,
  RemoveSubUserSubjectResponseI,
  GetSubUserSubjectsBySubjectParamsI,
  GetSubUserSubjectsBySubjectResponseI,
  AssignSubUserDepartmentPayloadI,
  AssignSubUserDepartmentResponseI,
  RemoveSubUserDepartmentResponseI,
  GetSubUserDepartmentsByDepartmentResponseI,
  GetSubUserDepartmentsBySubUserResponseI,
  ClassDashboardParamsI,
  ClassDashboardResponseI,
  ClassResultDetailsParamsI,
  ClassResultDetailsResponseI,
  StudentResultDetailsResponseI,
  PublishClassResultResponseI,
  PublishStudentResultResponseI,
  ExamRecordsOverviewParamsI,
  ExamRecordsOverviewResponseI,
  GetClassStudentsForGradingParamsI,
  GetClassStudentsForGradingResponseI,
  GetStudentSubjectScoresParamsI,
  GetStudentSubjectScoresResponseI,
  SaveStudentScoresDraftPayloadI,
  SaveStudentScoresDraftResponseI,
  AutomatedScoreContributionAuditParamsI,
  AutomatedScoreContributionAuditResponseI,
} from "./types"

export const bulkCreateSubjectsApi = async (
  payload: BulkCreateSubjectsPayloadI
): Promise<any> => {
  const res = await apiClient.post("/SchoolSubject/BulkCreate", payload)
  return res
}

export const createSubjectApi = async (
  payload: CreateSubjectPayloadI
): Promise<any> => {
  const res = await apiClient.post("/SchoolSubject/Create", payload)
  return res
}

export const updateSubjectApi = async (
  payload: UpdateSubjectPayloadI
): Promise<any> => {
  const res = await apiClient.put("/SchoolSubject/Update", payload)
  return res
}

export const deleteSubjectApi = async (
  payload: DeleteSubjectPayloadI
): Promise<any> => {
  const res = await apiClient.delete("/SchoolSubject/Delete", { data: payload })
  return res
}

export const getSubjectByIdApi = async (id: string): Promise<any> => {
  const res = await apiClient.get("/SchoolSubject/GetById", {
    params: { id },
  })
  return res
}

export const getAllSubjectsApi = async (
  params: GetAllSubjectsParams
): Promise<GetAllSubjectsPaginatedResponseI> => {
  const res = await apiClient.get("/SchoolSubject/GetAll", { params })
  return normalizeResponse<GetAllSubjectsPaginatedResponseI>(res)
}

export const createClassApi = async (
  payload: CreateClassPayloadI
): Promise<any> => {
  const res = await apiClient.post("/SchoolClass/Create", payload)
  return res
}

export const updateClassApi = async (
  payload: UpdateClassPayloadI
): Promise<any> => {
  const res = await apiClient.put("/SchoolClass/Update", payload)
  return res
}

export const deleteClassApi = async (id: string): Promise<any> => {
  const res = await apiClient.delete(`/SchoolClass/Delete/${id}`)
  return res
}

export const getClassArmsApi = async (classId: string): Promise<any> => {
  const res = await apiClient.get("/SchoolClass/GetClassArms", {
    params: { classId },
  })
  return res
}

export const assignClassArmsApi = async (
  payload: AssignClassArmsPayloadI
): Promise<any> => {
  const res = await apiClient.post("/SchoolArm/AssignToClass", payload)
  return normalizeResponse(res)
}

export const getAllClassesApi = async (
  params: GetAllClassesParams
): Promise<any> => {
  const res = await apiClient.get("/SchoolClass/GetAll", { params })
  return res
}

export const getClassByIdApi = async (id: string): Promise<any> => {
  const res = await apiClient.get(`/SchoolClass/GetById/${id}`)
  return res
}

export const getSecondaryClassesApi = async (
  schoolId: string
): Promise<GetSecondaryClassesResponseI> => {
  const res = await apiClient.get(
    `/SchoolClass/GetSecondaryClasses/${schoolId}`
  )
  return normalizeResponse<GetSecondaryClassesResponseI>(res)
}

export const createCategoryApi = async (
  payload: CreateCategoryPayloadI
): Promise<any> => {
  const res = await apiClient.post("/ClassCategory/Create", payload)
  return res
}

export const updateCategoryApi = async (
  payload: UpdateCategoryPayloadI
): Promise<any> => {
  const res = await apiClient.put("/ClassCategory/Update", payload)
  return res
}

export const deleteCategoryApi = async (id: string): Promise<any> => {
  const res = await apiClient.delete(`/ClassCategory/Delete/${id}`)
  return res
}

export const getAllCategoriesApi = async (
  params: GetAllCategoriesParams
): Promise<any> => {
  const res = await apiClient.get("/ClassCategory/GetAll", { params })
  return res
}

export const getCategoryByIdApi = async (id: string): Promise<any> => {
  const res = await apiClient.get(`/ClassCategory/GetById/${id}`)
  return res
}

export const createSchoolArmApi = async (
  payload: CreateSchoolArmPayloadI
): Promise<any> => {
  const res = await apiClient.post("/SchoolArm/Create", payload)
  return res
}

export const updateSchoolArmApi = async (
  payload: UpdateSchoolArmPayloadI
): Promise<any> => {
  const res = await apiClient.put("/SchoolArm/Update", payload)
  return res
}

export const deleteSchoolArmApi = async (
  payload: DeleteSchoolArmPayloadI
): Promise<any> => {
  const res = await apiClient.delete("/SchoolArm/Delete", { data: payload })
  return res
}

export const getSchoolArmByIdApi = async (id: string): Promise<any> => {
  const res = await apiClient.get("/SchoolArm/GetById", { params: { id } })
  return res
}

export const getAllSchoolArmsApi = async (schoolId: string): Promise<any> => {
  const res = await apiClient.get("/SchoolArm/GetAll", { params: { schoolId } })
  return res
}

export const createDepartmentApi = async (
  payload: CreateDepartmentPayloadI
): Promise<any> => {
  const res = await apiClient.post("/SchoolDepartment/Create", payload)
  return res
}

export const updateDepartmentApi = async (
  payload: UpdateDepartmentPayloadI
): Promise<any> => {
  const res = await apiClient.put("/SchoolDepartment/Update", payload)
  return res
}

export const deleteDepartmentApi = async (id: string): Promise<any> => {
  const res = await apiClient.delete(`/SchoolDepartment/Delete/${id}`)
  return res
}

export const getDepartmentsBySchoolApi = async (
  schoolId: string
): Promise<any> => {
  const res = await apiClient.get(`/SchoolDepartment/GetBySchool/${schoolId}`)
  return res
}

export const getDepartmentsBySchoolPaginatedApi = async ({
  schoolId,
  pageNumber,
  pageSize,
  keyword,
}: GetDepartmentsBySchoolPaginatedParams): Promise<any> => {
  const res = await apiClient.get(
    `/SchoolDepartment/GetBySchoolPaginated/${schoolId}`,
    { params: { pageNumber, pageSize, keyword } }
  )
  return res
}

export const getDepartmentByIdApi = async (id: string): Promise<any> => {
  const res = await apiClient.get(`/SchoolDepartment/GetById/${id}`)
  return res
}

export const createSchoolGradeApi = async (
  payload: CreateSchoolGradePayloadI
): Promise<any> => {
  const res = await apiClient.post("/SchoolGrade/Create", payload)
  return res
}

export const updateSchoolGradeApi = async (
  payload: UpdateSchoolGradePayloadI
): Promise<any> => {
  const res = await apiClient.put("/SchoolGrade/Update", payload)
  return res
}

export const deleteSchoolGradeApi = async (id: string): Promise<any> => {
  const res = await apiClient.delete(`/SchoolGrade/Delete/${id}`)
  return res
}

export const getSchoolGradesBySchoolApi = async (
  schoolId: string
): Promise<any> => {
  const res = await apiClient.get(`/SchoolGrade/GetBySchool/${schoolId}`)
  return res
}

export const getSchoolGradesBySchoolPaginatedApi = async ({
  schoolId,
  pageNumber,
  pageSize,
  keyword,
}: GetSchoolGradesBySchoolPaginatedParams): Promise<any> => {
  const res = await apiClient.get(
    `/SchoolGrade/GetBySchoolPaginated/${schoolId}`,
    { params: { pageNumber, pageSize, keyword } }
  )
  return res
}

export const getSchoolGradeByIdApi = async (id: string): Promise<any> => {
  const res = await apiClient.get(`/SchoolGrade/GetById/${id}`)
  return res
}


export const createSchoolAssessmentApi = async (
  payload: CreateSchoolAssessmentPayloadI
): Promise<any> => {
  const res = await apiClient.post("/SchoolAssessment/Create", payload)
  return res
}

export const updateSchoolAssessmentApi = async (
  payload: UpdateSchoolAssessmentPayloadI
): Promise<any> => {
  const res = await apiClient.put("/SchoolAssessment/Update", payload)
  return res
}

export const deleteSchoolAssessmentApi = async (id: string): Promise<any> => {
  const res = await apiClient.delete(`/SchoolAssessment/Delete/${id}`)
  return res
}

export const getSchoolAssessmentsBySchoolApi = async ({
  schoolId,
  schoolSessionId,
}: GetSchoolAssessmentsBySchoolParams): Promise<any> => {
  const res = await apiClient.get(`/SchoolAssessment/GetBySchool/${schoolId}`, {
    params: schoolSessionId ? { schoolSessionId } : undefined,
  })
  return res
}

export const getSchoolAssessmentsBySchoolPaginatedApi = async ({
  schoolId,
  schoolSessionId,
  pageNumber,
  pageSize,
  keyword,
}: GetSchoolAssessmentsBySchoolPaginatedParams): Promise<any> => {
  const res = await apiClient.get(
    `/SchoolAssessment/GetBySchoolPaginated/${schoolId}`,
    { params: { schoolSessionId, pageNumber, pageSize, keyword } }
  )
  return res
}

export const getSchoolAssessmentByIdApi = async (id: string): Promise<any> => {
  const res = await apiClient.get(`/SchoolAssessment/GetById/${id}`)
  return res
}


export const assignClassSubjectApi = async (
  payload: AssignClassSubjectPayloadI
): Promise<AssignClassSubjectResponseI> => {
  const res = await apiClient.post("/ClassSubject/Assign", payload)
  return normalizeResponse<AssignClassSubjectResponseI>(res)
}

export interface SyncClassSubjectsResult {
  missingSubjectEnrollmentsCreated: number
  inactiveSubjectEnrollmentsRestored: number
}

export const syncClassSubjectsApi = async (schoolId: string, classId: string) => {
  const res = await apiClient.post(
    `/Student/ResolveStudentDefaultSubjectEnrollments/${encodeURIComponent(schoolId)}`,
    undefined,
    { params: { classId } }
  )
  return normalizeResponse<{ isSuccess: boolean; value: SyncClassSubjectsResult }>(res)
}

export const removeClassSubjectApi = async (
  id: string
): Promise<RemoveClassSubjectResponseI> => {
  const res = await apiClient.delete(`/ClassSubject/Remove/${id}`)
  return normalizeResponse<RemoveClassSubjectResponseI>(res)
}

export const getSubjectsByClassApi = async ({
  classId,
  schoolId,
}: GetSubjectsByClassParams): Promise<GetSubjectsByClassResponseI> => {
  const res = await apiClient.get("/ClassSubject/GetByClass", {
    params: { classId, schoolId },
  })
  return normalizeResponse<GetSubjectsByClassResponseI>(res)
}

export const getClassesBySubjectApi = async ({
  subjectId,
  schoolId,
}: GetClassesBySubjectParams): Promise<GetClassesBySubjectResponseI> => {
  const res = await apiClient.get("/ClassSubject/GetBySubject", {
    params: { subjectId, schoolId },
  })
  return normalizeResponse<GetClassesBySubjectResponseI>(res)
}



export const getMyGradeClassesApi = async (
  params: GetGradeMyClassesParamsI
): Promise<GetGradeMyClassesResponseI> => {
  const res = await apiClient.get("/Grade/MyClasses", { params })
  return normalizeResponse<GetGradeMyClassesResponseI>(res)
}

export const getMyGradeSubjectsApi = async (
  params: GetGradeMySubjectsParamsI
): Promise<GetGradeMySubjectsResponseI> => {
  const res = await apiClient.get("/Grade/MySubjects", { params })
  return normalizeResponse<GetGradeMySubjectsResponseI>(res)
}

export const getGradeWorksheetApi = async (
  params: GetGradeWorksheetParamsI
): Promise<GetGradeWorksheetResponseI> => {
  const res = await apiClient.get("/Grade/GetWorksheet", { params })
  return normalizeResponse<GetGradeWorksheetResponseI>(res)
}

export const submitGradeWorksheetApi = async (
  payload: SubmitGradeWorksheetPayloadI
): Promise<SubmitGradeWorksheetResponseI> => {
  const res = await apiClient.post("/Grade/SubmitWorksheet", payload)
  return normalizeResponse<SubmitGradeWorksheetResponseI>(res)
}

export const saveGradeWorksheetDraftApi = async (
  payload: SubmitGradeWorksheetPayloadI
): Promise<SaveGradeWorksheetDraftResponseI> => {
  const res = await apiClient.post("/Grade/SaveWorksheetDraft", payload)
  return normalizeResponse<SaveGradeWorksheetDraftResponseI>(res)
}

export const getAutomatedScoreContributionsApi = async (
  params: AutomatedScoreContributionAuditParamsI
): Promise<AutomatedScoreContributionAuditResponseI> => {
  const res = await apiClient.get("/Grade/AutomatedScoreContributions", {
    params,
  })
  return normalizeResponse<AutomatedScoreContributionAuditResponseI>(res)
}

export const getAllGradeWorksheetsApi = async (
  params: GetAllGradeWorksheetsParamsI
): Promise<GetAllGradeWorksheetsResponseI> => {
  const res = await apiClient.get("/Grade/AllWorksheets", { params })
  return normalizeResponse<GetAllGradeWorksheetsResponseI>(res)
}

export const getGradeWorksheetByIdApi = async (
  worksheetId: string
): Promise<GetGradeWorksheetByIdResponseI> => {
  const res = await apiClient.get(`/Grade/GetWorksheetById/${worksheetId}`)
  return normalizeResponse<GetGradeWorksheetByIdResponseI>(res)
}

export const approveGradeWorksheetApi = async (
  worksheetId: string
): Promise<ApproveGradeWorksheetResponseI> => {
  const res = await apiClient.post(`/Grade/ApproveWorksheet/${worksheetId}`)
  return normalizeResponse<ApproveGradeWorksheetResponseI>(res)
}

export const rejectGradeWorksheetApi = async (
  payload: RejectGradeWorksheetPayloadI
): Promise<RejectGradeWorksheetResponseI> => {
  const res = await apiClient.post(
    `/Grade/RejectWorksheet/${payload.worksheetId}`,
    payload
  )
  return normalizeResponse<RejectGradeWorksheetResponseI>(res)
}

export const lookupStudentResultApi = async (
  payload: LookupStudentResultPayloadI
): Promise<LookupStudentResultResponseI> => {
  const res = await apiClient.post("/Grade/LookupResult", payload)
  return normalizeResponse<LookupStudentResultResponseI>(res)
}


export const assignSubUserClassApi = async (
  payload: AssignSubUserClassPayloadI
): Promise<AssignSubUserClassResponseI> => {
  const res = await apiClient.post("/SubUserClass/Assign", payload)
  return normalizeResponse<AssignSubUserClassResponseI>(res)
}

export const removeSubUserClassApi = async (
  id: string
): Promise<RemoveSubUserClassResponseI> => {
  const res = await apiClient.delete(`/SubUserClass/Remove/${id}`)
  return normalizeResponse<RemoveSubUserClassResponseI>(res)
}

export const getSubUserClassesBySubUserApi = async (
  subUserId: string
): Promise<GetSubUserClassesBySubUserResponseI> => {
  const res = await apiClient.get(`/SubUserClass/GetBySubUser/${subUserId}`)
  return normalizeResponse<GetSubUserClassesBySubUserResponseI>(res)
}

export const getSubUserClassesByClassApi = async (
  params: GetSubUserClassesByClassParamsI
): Promise<GetSubUserClassesByClassResponseI> => {
  const res = await apiClient.get("/SubUserClass/GetByClass", { params })
  return normalizeResponse<GetSubUserClassesByClassResponseI>(res)
}

export const getSubUserSubjectsBySubUserApi = async (
  subUserId: string
): Promise<GetSubUserSubjectsBySubUserResponseI> => {
  const res = await apiClient.get(`/SubUserSubject/GetBySubUser/${subUserId}`)
  return normalizeResponse<GetSubUserSubjectsBySubUserResponseI>(res)
}

export const getTeacherDetailsApi = async (
  params: GetTeacherDetailsParamsI
): Promise<TeacherDetailsResponseI> => {
  const res = await apiClient.get("/SubUser/TeacherDetails", { params })
  return normalizeResponse<TeacherDetailsResponseI>(res)
}

export const assignSubUserSubjectApi = async (
  payload: AssignSubUserSubjectPayloadI
): Promise<AssignSubUserSubjectResponseI> => {
  const res = await apiClient.post("/SubUserSubject/Assign", payload)
  return normalizeResponse<AssignSubUserSubjectResponseI>(res)
}

export const removeSubUserSubjectApi = async (
  id: string
): Promise<RemoveSubUserSubjectResponseI> => {
  const res = await apiClient.delete(`/SubUserSubject/Remove/${id}`)
  return normalizeResponse<RemoveSubUserSubjectResponseI>(res)
}

export const getSubUserSubjectsBySubjectApi = async (
  params: GetSubUserSubjectsBySubjectParamsI
): Promise<GetSubUserSubjectsBySubjectResponseI> => {
  const res = await apiClient.get("/SubUserSubject/GetBySubject", { params })
  return normalizeResponse<GetSubUserSubjectsBySubjectResponseI>(res)
}

export const assignSubUserDepartmentApi = async (
  payload: AssignSubUserDepartmentPayloadI
): Promise<AssignSubUserDepartmentResponseI> => {
  const res = await apiClient.post("/SubUserDepartment/Assign", payload)
  return normalizeResponse<AssignSubUserDepartmentResponseI>(res)
}

export const removeSubUserDepartmentApi = async (
  id: string
): Promise<RemoveSubUserDepartmentResponseI> => {
  const res = await apiClient.delete(`/SubUserDepartment/Remove/${id}`)
  return normalizeResponse<RemoveSubUserDepartmentResponseI>(res)
}

export const getSubUserDepartmentsByDepartmentApi = async (
  departmentId: string
): Promise<GetSubUserDepartmentsByDepartmentResponseI> => {
  const res = await apiClient.get(
    `/SubUserDepartment/GetByDepartment/${departmentId}`
  )
  return normalizeResponse<GetSubUserDepartmentsByDepartmentResponseI>(res)
}

export const getSubUserDepartmentsBySubUserApi = async (
  subUserId: string
): Promise<GetSubUserDepartmentsBySubUserResponseI> => {
  const res = await apiClient.get(
    `/SubUserDepartment/GetBySubUser/${subUserId}`
  )
  return normalizeResponse<GetSubUserDepartmentsBySubUserResponseI>(res)
}

export const getClassDashboardApi = async (
  params: ClassDashboardParamsI
): Promise<ClassDashboardResponseI> => {
  const res = await apiClient.get("/Grade/ClassDashboard", { params })
  return normalizeResponse<ClassDashboardResponseI>(res)
}

export const getClassResultDetailsApi = async ({
  classCummaltiveResultId,
  ...params
}: ClassResultDetailsParamsI): Promise<ClassResultDetailsResponseI> => {
  const res = await apiClient.get(
    `/Grade/ClassResultDetails/${classCummaltiveResultId}`,
    { params }
  )
  return normalizeResponse<ClassResultDetailsResponseI>(res)
}

export const getStudentResultDetailsApi = async (
  studentCummulativeResultId: string
): Promise<StudentResultDetailsResponseI> => {
  const res = await apiClient.get(
    `/Grade/StudentResultDetails/${studentCummulativeResultId}`
  )
  return normalizeResponse<StudentResultDetailsResponseI>(res)
}

export const publishClassResultApi = async (
  classCummaltiveResultId: string
): Promise<PublishClassResultResponseI> => {
  const res = await apiClient.post(
    `/Grade/PublishClassResult/${classCummaltiveResultId}`
  )
  return normalizeResponse<PublishClassResultResponseI>(res)
}

export const publishStudentResultApi = async (
  studentCummulativeResultId: string
): Promise<PublishStudentResultResponseI> => {
  const res = await apiClient.post(
    `/Grade/PublishStudentResult/${studentCummulativeResultId}`
  )
  return normalizeResponse<PublishStudentResultResponseI>(res)
}

export const getExamRecordsOverviewApi = async (
  { schoolId, sessionId, termId }: ExamRecordsOverviewParamsI,
  signal?: AbortSignal
): Promise<ExamRecordsOverviewResponseI> => {
  if (!schoolId?.trim() || ["undefined", "null"].includes(schoolId.trim())) {
    throw new ApiError(400, "School context is not available.")
  }
  const res = await apiClient.get("/Grade/ExamRecordsOverview", {
    params: { schoolId, ...(sessionId ? { sessionId } : {}), ...(termId ? { termId } : {}) },
    signal,
    headers: { Accept: "application/json" },
  })
  const response = toCamelCase<ExamRecordsOverviewResponseI>(res)
  if (!response.isSuccess || response.isFailure || response.statusCode >= 400 || !response.value) {
    throw new ApiError(response.statusCode >= 400 ? response.statusCode : 422, response.message || "Unable to load exam records overview.")
  }
  return response
}

export const getClassStudentsForGradingApi = async (
  params: GetClassStudentsForGradingParamsI
): Promise<GetClassStudentsForGradingResponseI> => {
  const res = await apiClient.get("/Grade/ClassStudentsForGrading", { params })
  return normalizeResponse<GetClassStudentsForGradingResponseI>(res)
}

export const getStudentSubjectScoresApi = async (
  params: GetStudentSubjectScoresParamsI
): Promise<GetStudentSubjectScoresResponseI> => {
  const res = await apiClient.get("/Grade/StudentSubjectScores", { params })
  return normalizeResponse<GetStudentSubjectScoresResponseI>(res)
}

export const saveStudentScoresDraftApi = async (
  payload: SaveStudentScoresDraftPayloadI
): Promise<SaveStudentScoresDraftResponseI> => {
  const res = await apiClient.post("/Grade/SaveStudentScoresDraft", payload)
  return normalizeResponse<SaveStudentScoresDraftResponseI>(res)
}
