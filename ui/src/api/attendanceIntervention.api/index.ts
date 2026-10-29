import apiClient from "../api"
import { normalizeResponse } from "@/utils/apiResponse"
import type {
  AddAttendanceActivityPayloadI,
  ApiResult,
  AttendanceEarlyInterventionDashboardI,
  AttendanceInterventionAccessI,
  AttendanceInterventionActivityI,
  AttendanceInterventionCaseI,
  AttendanceRiskSettingsI,
  AttendanceStudentRiskProfileI,
  CloseAttendanceInterventionPayloadI,
  CompleteAttendanceActivityPayloadI,
  GetAttendanceRisksParamsI,
  OpenAttendanceInterventionPayloadI,
  PaginatedAttendanceRisksI,
  RecordAttendanceReviewPayloadI,
  ReferAttendanceInterventionPayloadI,
  UpdateAttendanceRiskSettingsPayloadI,
} from "./types"

const root = (schoolId: string) => `/AttendanceIntervention/schools/${schoolId}`

export async function getAttendanceInterventionAccessApi(schoolId: string) {
  const response = await apiClient.get(`${root(schoolId)}/access/me`)
  return normalizeResponse<ApiResult<AttendanceInterventionAccessI>>(response)
}

export async function getAttendanceInterventionDashboardApi(
  schoolId: string,
  schoolSessionId?: string,
  schoolSessionTermId?: string
) {
  const response = await apiClient.get(`${root(schoolId)}/overview`, {
    params: { schoolSessionId, schoolSessionTermId },
  })
  return normalizeResponse<ApiResult<AttendanceEarlyInterventionDashboardI>>(response)
}

export async function getAttendanceRiskQueueApi(params: GetAttendanceRisksParamsI) {
  const { schoolId, ...query } = params
  const response = await apiClient.get(`${root(schoolId)}/risk-queue`, { params: query })
  return normalizeResponse<ApiResult<PaginatedAttendanceRisksI>>(response)
}

export async function getAttendanceStudentRiskProfileApi(
  schoolId: string,
  studentId: string,
  schoolSessionId?: string,
  schoolSessionTermId?: string
) {
  const response = await apiClient.get(`${root(schoolId)}/students/${studentId}`, {
    params: { schoolSessionId, schoolSessionTermId },
  })
  return normalizeResponse<ApiResult<AttendanceStudentRiskProfileI>>(response)
}

export async function getAttendanceRiskSettingsApi(schoolId: string) {
  const response = await apiClient.get(`${root(schoolId)}/settings`)
  return normalizeResponse<ApiResult<AttendanceRiskSettingsI>>(response)
}

export async function updateAttendanceRiskSettingsApi(
  payload: UpdateAttendanceRiskSettingsPayloadI
) {
  const { schoolId, ...body } = payload
  const response = await apiClient.put(`${root(schoolId)}/settings`, body)
  return normalizeResponse<ApiResult<AttendanceRiskSettingsI>>(response)
}

export async function openAttendanceInterventionApi(
  payload: OpenAttendanceInterventionPayloadI
) {
  const { schoolId, ...body } = payload
  const response = await apiClient.post(`${root(schoolId)}/interventions`, body)
  return normalizeResponse<ApiResult<AttendanceInterventionCaseI>>(response)
}

export async function addAttendanceActivityApi(payload: AddAttendanceActivityPayloadI) {
  const { schoolId, caseId, ...body } = payload
  const response = await apiClient.post(`${root(schoolId)}/cases/${caseId}/activities`, body)
  return normalizeResponse<ApiResult<AttendanceInterventionActivityI>>(response)
}

export async function completeAttendanceActivityApi(
  payload: CompleteAttendanceActivityPayloadI
) {
  const { schoolId, activityId, ...body } = payload
  const response = await apiClient.put(
    `${root(schoolId)}/activities/${activityId}/complete`,
    body
  )
  return normalizeResponse<ApiResult<AttendanceInterventionActivityI>>(response)
}

export async function recordAttendanceReviewApi(payload: RecordAttendanceReviewPayloadI) {
  const { schoolId, caseId, ...body } = payload
  const response = await apiClient.post(`${root(schoolId)}/cases/${caseId}/reviews`, body)
  return normalizeResponse<ApiResult<AttendanceInterventionCaseI>>(response)
}

export async function referAttendanceInterventionApi(
  payload: ReferAttendanceInterventionPayloadI
) {
  const { schoolId, caseId, ...body } = payload
  const response = await apiClient.post(`${root(schoolId)}/cases/${caseId}/referrals`, body)
  return normalizeResponse<ApiResult<AttendanceInterventionActivityI>>(response)
}

export async function closeAttendanceInterventionApi(
  payload: CloseAttendanceInterventionPayloadI
) {
  const { schoolId, caseId, ...body } = payload
  const response = await apiClient.put(`${root(schoolId)}/cases/${caseId}/close`, body)
  return normalizeResponse<ApiResult<AttendanceInterventionCaseI>>(response)
}

export type * from "./types"
