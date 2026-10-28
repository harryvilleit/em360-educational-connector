import apiClient from "../api"
import { normalizeResponse } from "@/utils/apiResponse"
import type {
  GetAttendanceDashboardParamsI,
  GetAttendanceDashboardResponseI,
  GetClassAttendanceRosterParamsI,
  GetClassAttendanceRosterResponseI,
  SaveStudentAttendancePayloadI,
  SaveStudentAttendanceResponseI,
  GetStudentAttendanceHistoryParamsI,
  GetStudentAttendanceHistoryResponseI,
} from "./types"

export const getAttendanceDashboardApi = async ({
  schoolId,
  attendanceDate,
  schoolSessionId,
  schoolSessionTermId,
}: GetAttendanceDashboardParamsI): Promise<GetAttendanceDashboardResponseI> => {
  const res = await apiClient.get(`/StudentAttendance/Dashboard/${schoolId}`, {
    // axios omits params whose value is undefined, so unset filters never
    // reach the query string.
    params: { attendanceDate, schoolSessionId, schoolSessionTermId },
  })
  return normalizeResponse<GetAttendanceDashboardResponseI>(res)
}

export const getClassAttendanceRosterApi = async ({
  schoolClassId,
  schoolId,
  attendanceDate,
  schoolSessionId,
  schoolSessionTermId,
}: GetClassAttendanceRosterParamsI): Promise<GetClassAttendanceRosterResponseI> => {
  const res = await apiClient.get(`/StudentAttendance/Roster/${schoolClassId}`, {
    params: { schoolId, attendanceDate, schoolSessionId, schoolSessionTermId },
  })
  return normalizeResponse<GetClassAttendanceRosterResponseI>(res)
}

export const saveStudentAttendanceApi = async (
  payload: SaveStudentAttendancePayloadI
): Promise<SaveStudentAttendanceResponseI> => {
  const res = await apiClient.post("/StudentAttendance/Save", payload)
  return normalizeResponse<SaveStudentAttendanceResponseI>(res)
}

export const getStudentAttendanceHistoryApi = async (
  params: GetStudentAttendanceHistoryParamsI
): Promise<GetStudentAttendanceHistoryResponseI> => {
  const res = await apiClient.get(
    "/StudentAttendance/GuardianStudentAttendance",
    { params }
  )
  return normalizeResponse<GetStudentAttendanceHistoryResponseI>(res)
}
