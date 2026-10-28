import apiClient from "../api"
import { normalizeResponse } from "@/utils/apiResponse"
import type {
  CreateStudentPayloadI,
  CreateStudentResponseI,
  UpdateStudentPayloadI,
  UpdateStudentResponseI,
  DeleteStudentParamsI,
  DeleteStudentResponseI,
  EnrollStudentPayloadI,
  EnrollStudentResponseI,
  EnrollToAdditionalClassPayloadI,
  EnrollToAdditionalClassResponseI,
  SearchStudentsParamsI,
  SearchStudentsResponseI,
  GetSchoolStudentsParamsI,
  GetSchoolStudentsResponseI,
  GetStudentByIdParamsI,
  GetStudentByIdResponseI,
  GetStudentDashboardOverviewResponseI,
  AdminResetStudentPasswordPayloadI,
  AdminResetStudentPasswordResponseI,
  GetStudentPortalOverviewParamsI,
  GetStudentPortalOverviewResponseI,
  GetStudentPortalTimetableParamsI,
  GetStudentPortalTimetableResponseI,
  GetStudentPortalResultsParamsI,
  GetStudentPortalResultsResponseI,
  GetStudentPortalHostelParamsI,
  GetStudentPortalHostelResponseI,
  GetStudentPortalHealthRecordParamsI,
  GetStudentPortalHealthRecordResponseI,
  GetStudentPortalLaunchParamsI,
  GetStudentPortalLaunchResponseI,
  GetStudentPortalTimetableByWeekParamsI,
  GetStudentPortalTimetableByWeekResponseI,
  GetStudentDetailResponseI,
  StudentDetailDataI,
  GetMyAttendanceParamsI,
  GetMyAttendanceResponseI,
} from "./types"

export const createStudentApi = async (
  payload: CreateStudentPayloadI
): Promise<CreateStudentResponseI> => {
  const res = await apiClient.post("/Student/Create", payload)
  return normalizeResponse<CreateStudentResponseI>(res)
}

export const updateStudentApi = async (
  payload: UpdateStudentPayloadI
): Promise<UpdateStudentResponseI> => {
  const res = await apiClient.put("/Student/Update", payload)
  return normalizeResponse<UpdateStudentResponseI>(res)
}

export const deleteStudentApi = async ({
  studentId,
  schoolId,
}: DeleteStudentParamsI): Promise<DeleteStudentResponseI> => {
  const res = await apiClient.delete(`/Student/Delete/${studentId}/${schoolId}`)
  return normalizeResponse<DeleteStudentResponseI>(res)
}

export const enrollStudentApi = async (
  payload: EnrollStudentPayloadI
): Promise<EnrollStudentResponseI> => {
  const res = await apiClient.post("/Student/Enroll", payload)
  return normalizeResponse<EnrollStudentResponseI>(res)
}

export const enrollToAdditionalClassApi = async (
  payload: EnrollToAdditionalClassPayloadI
): Promise<EnrollToAdditionalClassResponseI> => {
  const res = await apiClient.post("/Student/EnrollToAdditionalClass", payload)
  return normalizeResponse<EnrollToAdditionalClassResponseI>(res)
}

// Only returns students who exist on the platform, are outside the current
// school, and aren't currently active anywhere — eligible for transfer or
// re-enrollment. Replaces the old /Student/Search, which returned every
// platform student regardless of school/active status.
export const searchStudentsApi = async (
  params: SearchStudentsParamsI
): Promise<SearchStudentsResponseI> => {
  const res = await apiClient.get("/Student/SearchInactivePlatformStudents", {
    params,
  })
  return normalizeResponse<SearchStudentsResponseI>(res)
}

export const getSchoolStudentsApi = async ({
  schoolId,
  ...params
}: GetSchoolStudentsParamsI): Promise<GetSchoolStudentsResponseI> => {
  const res = await apiClient.get(`/Student/GetSchoolStudents/${schoolId}`, {
    params,
  })
  return normalizeResponse<GetSchoolStudentsResponseI>(res)
}

export const getStudentByIdApi = async ({
  studentId,
  schoolId,
}: GetStudentByIdParamsI): Promise<GetStudentByIdResponseI> => {
  const res = await apiClient.get(`/Student/GetById/${studentId}/${schoolId}`)
  return normalizeResponse<GetStudentByIdResponseI>(res)
}

// Admin Student Details page — same URL and envelope as getStudentByIdApi
// above, but `value` carries the richer profile (guardians, feeStatus,
// subjects, classTimetable, medicalInformation) that the details page needs.
// Kept as its own function rather than changing getStudentByIdApi's return
// type, since that one is relied on by many other pages expecting the
// narrower, flatter StudentDetailI.
export const getStudentDetailApi = async ({
  studentId,
  schoolId,
}: GetStudentByIdParamsI): Promise<StudentDetailDataI> => {
  const res = await apiClient.get(`/Student/GetById/${studentId}/${schoolId}`)
  const normalized = normalizeResponse<GetStudentDetailResponseI>(res)
  if (!normalized?.value) {
    throw new Error("Student not found")
  }
  return normalized.value
}

export const getStudentDashboardOverviewApi = async (
  schoolId: string
): Promise<GetStudentDashboardOverviewResponseI> => {
  const res = await apiClient.get(`/Student/DashboardOverview/${schoolId}`)
  return normalizeResponse<GetStudentDashboardOverviewResponseI>(res)
}

export const adminResetStudentPasswordApi = async (
  payload: AdminResetStudentPasswordPayloadI
): Promise<AdminResetStudentPasswordResponseI> => {
  const res = await apiClient.post("/Users/AdminResetStudentPassword", payload)
  return normalizeResponse<AdminResetStudentPasswordResponseI>(res)
}

// ─── Student courses (E-Learning) ─────────────────────────────────────────────

export interface StudentCourseDtoI {
  id: string
  subjectId: string
  subjectName: string
  classId: string
  className: string
  teacherName?: string | null
}

export interface GetStudentCoursesResponseI {
  isSuccess: boolean
  error?: string
  isFailure?: boolean
  value: StudentCourseDtoI[]
}

export const getStudentCoursesApi = async (
  studentId: string,
  schoolId: string
): Promise<GetStudentCoursesResponseI> => {
  const res = await apiClient.get(
    `/StudentPortal/Courses/${studentId}/${schoolId}`
  )
  return normalizeResponse<GetStudentCoursesResponseI>(res)
}

// ─── Student Self-Service Portal (StudentPortalController) ──────────────────

export const getStudentPortalOverviewApi = async ({
  studentId,
  schoolId,
}: GetStudentPortalOverviewParamsI): Promise<GetStudentPortalOverviewResponseI> => {
  const res = await apiClient.get(
    `/StudentPortal/Overview/${studentId}/${schoolId}`
  )
  return normalizeResponse<GetStudentPortalOverviewResponseI>(res)
}

export const getStudentPortalTimetableApi = async ({
  studentId,
  schoolId,
  ...params
}: GetStudentPortalTimetableParamsI): Promise<GetStudentPortalTimetableResponseI> => {
  const res = await apiClient.get(
    `/StudentPortal/Timetable/${studentId}/${schoolId}`,
    { params }
  )
  return normalizeResponse<GetStudentPortalTimetableResponseI>(res)
}

export const getStudentPortalResultsApi = async ({
  studentId,
  schoolId,
  ...params
}: GetStudentPortalResultsParamsI): Promise<GetStudentPortalResultsResponseI> => {
  const res = await apiClient.get(
    `/StudentPortal/Results/${studentId}/${schoolId}`,
    { params }
  )
  return normalizeResponse<GetStudentPortalResultsResponseI>(res)
}

export const getStudentPortalHostelApi = async ({
  studentId,
  schoolId,
}: GetStudentPortalHostelParamsI): Promise<GetStudentPortalHostelResponseI> => {
  const res = await apiClient.get(
    `/StudentPortal/Hostel/${studentId}/${schoolId}`
  )
  return normalizeResponse<GetStudentPortalHostelResponseI>(res)
}

export const getStudentPortalHealthRecordApi = async ({
  studentId,
  schoolId,
}: GetStudentPortalHealthRecordParamsI): Promise<GetStudentPortalHealthRecordResponseI> => {
  const res = await apiClient.get(
    `/StudentPortal/HealthRecord/${studentId}/${schoolId}`
  )
  return normalizeResponse<GetStudentPortalHealthRecordResponseI>(res)
}

// Bootstrap endpoint for the Student Portal — returns the student's identity,
// school, and full session/term/class enrollment tree in one call, so pages
// don't each fetch sessions/terms/classes independently.
export const getStudentPortalLaunchApi = async ({
  studentId,
  schoolId,
}: GetStudentPortalLaunchParamsI): Promise<GetStudentPortalLaunchResponseI> => {
  const res = await apiClient.get(
    `/StudentPortal/LaunchSchool/${studentId}/${schoolId}`
  )
  return normalizeResponse<GetStudentPortalLaunchResponseI>(res)
}

// axios omits params whose value is undefined, so unselected filters
// (class/session/term/date range) never reach the query string.
export const getMyAttendanceApi = async (
  params: GetMyAttendanceParamsI
): Promise<GetMyAttendanceResponseI> => {
  const res = await apiClient.get("/Student/GetMyAttendance", { params })
  return normalizeResponse<GetMyAttendanceResponseI>(res)
}

export const getStudentPortalTimetableByWeekApi = async ({
  studentId,
  schoolId,
  schoolClassId,
  weekStartDate,
}: GetStudentPortalTimetableByWeekParamsI): Promise<GetStudentPortalTimetableByWeekResponseI> => {
  const res = await apiClient.get(
    `/StudentPortal/TimetableByWeek/${studentId}/${schoolId}`,
    { params: { schoolClassId, weekStartDate } }
  )
  return normalizeResponse<GetStudentPortalTimetableByWeekResponseI>(res)
}
