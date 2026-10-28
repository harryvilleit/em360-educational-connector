import apiClient from "../api"
import { normalizeResponse } from "@/utils/apiResponse"
import type {
  AddSafeguardingActionPayloadI,
  AddSafeguardingReferralPayloadI,
  ApiResult,
  CloseSafeguardingCasePayloadI,
  CompleteSafeguardingActionPayloadI,
  GetSafeguardingCasesParamsI,
  GrantSafeguardingAccessPayloadI,
  PaginatedSafeguardingCasesI,
  ReportConcernPayloadI,
  SafeguardingAccessGrantI,
  SafeguardingAccessI,
  SafeguardingActionI,
  SafeguardingActionQueueItemI,
  SafeguardingAuditI,
  SafeguardingCaseDetailI,
  SafeguardingConcernReceiptI,
  SafeguardingDashboardI,
  SafeguardingDocumentDownloadI,
  SafeguardingDocumentI,
  SafeguardingEligibleUserI,
  SafeguardingReferralI,
  SafeguardingSafetyPlanI,
  SaveSafeguardingSafetyPlanPayloadI,
  TriageSafeguardingPayloadI,
  UploadSafeguardingDocumentPayloadI,
} from "./types"

const root = (schoolId: string) => `/Safeguarding/schools/${schoolId}`

export async function getSafeguardingAccessApi(schoolId: string) {
  const response = await apiClient.get(`${root(schoolId)}/access/me`)
  return normalizeResponse<ApiResult<SafeguardingAccessI>>(response)
}

export async function getSafeguardingDashboardApi(schoolId: string) {
  const response = await apiClient.get(`${root(schoolId)}/overview`)
  return normalizeResponse<ApiResult<SafeguardingDashboardI>>(response)
}

export async function getSafeguardingCasesApi(
  params: GetSafeguardingCasesParamsI
) {
  const { schoolId, ...query } = params
  const response = await apiClient.get(`${root(schoolId)}/cases`, {
    params: query,
  })
  return normalizeResponse<ApiResult<PaginatedSafeguardingCasesI>>(response)
}

export async function getSafeguardingCaseApi(schoolId: string, caseId: string) {
  const response = await apiClient.get(`${root(schoolId)}/cases/${caseId}`)
  return normalizeResponse<ApiResult<SafeguardingCaseDetailI>>(response)
}

export async function getSafeguardingDocumentDownloadApi(
  schoolId: string,
  documentId: string
) {
  const response = await apiClient.get(
    `${root(schoolId)}/documents/${documentId}/download`
  )
  return normalizeResponse<ApiResult<SafeguardingDocumentDownloadI>>(response)
}

export async function getSafeguardingActionsApi(
  schoolId: string,
  includeCompleted = false
) {
  const response = await apiClient.get(`${root(schoolId)}/actions`, {
    params: { includeCompleted },
  })
  return normalizeResponse<ApiResult<SafeguardingActionQueueItemI[]>>(response)
}

export async function getSafeguardingAccessGrantsApi(schoolId: string) {
  const response = await apiClient.get(`${root(schoolId)}/access-grants`)
  return normalizeResponse<ApiResult<SafeguardingAccessGrantI[]>>(response)
}

export async function getSafeguardingEligibleUsersApi(schoolId: string) {
  const response = await apiClient.get(
    `${root(schoolId)}/access-grants/eligible-users`
  )
  return normalizeResponse<ApiResult<SafeguardingEligibleUserI[]>>(response)
}

export async function getSafeguardingAccessAuditApi(schoolId: string) {
  const response = await apiClient.get(`${root(schoolId)}/access-audit`)
  return normalizeResponse<ApiResult<SafeguardingAuditI[]>>(response)
}

export async function reportSafeguardingConcernApi(
  payload: ReportConcernPayloadI
) {
  const { schoolId, ...body } = payload
  const response = await apiClient.post(`${root(schoolId)}/concerns`, body)
  return normalizeResponse<ApiResult<SafeguardingConcernReceiptI>>(response)
}

export async function triageSafeguardingCaseApi(
  payload: TriageSafeguardingPayloadI
) {
  const { schoolId, caseId, ...body } = payload
  const response = await apiClient.put(
    `${root(schoolId)}/cases/${caseId}/triage`,
    body
  )
  return normalizeResponse<ApiResult<SafeguardingCaseDetailI>>(response)
}

export async function addSafeguardingActionApi(
  payload: AddSafeguardingActionPayloadI
) {
  const { schoolId, caseId, ...body } = payload
  const response = await apiClient.post(
    `${root(schoolId)}/cases/${caseId}/actions`,
    body
  )
  return normalizeResponse<ApiResult<SafeguardingActionI>>(response)
}

export async function completeSafeguardingActionApi(
  payload: CompleteSafeguardingActionPayloadI
) {
  const { schoolId, actionId, ...body } = payload
  const response = await apiClient.put(
    `${root(schoolId)}/actions/${actionId}/complete`,
    body
  )
  return normalizeResponse<ApiResult<SafeguardingActionI>>(response)
}

export async function addSafeguardingReferralApi(
  payload: AddSafeguardingReferralPayloadI
) {
  const { schoolId, caseId, ...body } = payload
  const response = await apiClient.post(
    `${root(schoolId)}/cases/${caseId}/referrals`,
    body
  )
  return normalizeResponse<ApiResult<SafeguardingReferralI>>(response)
}

export async function saveSafeguardingSafetyPlanApi(
  payload: SaveSafeguardingSafetyPlanPayloadI
) {
  const { schoolId, caseId, ...body } = payload
  const response = await apiClient.post(
    `${root(schoolId)}/cases/${caseId}/safety-plans`,
    body
  )
  return normalizeResponse<ApiResult<SafeguardingSafetyPlanI>>(response)
}

export async function uploadSafeguardingDocumentApi(
  payload: UploadSafeguardingDocumentPayloadI
) {
  const form = new FormData()
  form.append("category", payload.category)
  form.append("title", payload.title)
  form.append("file", payload.file)
  const response = await apiClient.post(
    `${root(payload.schoolId)}/cases/${payload.caseId}/documents`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  )
  return normalizeResponse<ApiResult<SafeguardingDocumentI>>(response)
}

export async function closeSafeguardingCaseApi(
  payload: CloseSafeguardingCasePayloadI
) {
  const { schoolId, caseId, ...body } = payload
  const response = await apiClient.put(
    `${root(schoolId)}/cases/${caseId}/close`,
    body
  )
  return normalizeResponse<ApiResult<SafeguardingCaseDetailI>>(response)
}

export async function grantSafeguardingAccessApi(
  payload: GrantSafeguardingAccessPayloadI
) {
  const { schoolId, ...body } = payload
  const response = await apiClient.post(`${root(schoolId)}/access-grants`, body)
  return normalizeResponse<ApiResult<SafeguardingAccessGrantI>>(response)
}

export async function revokeSafeguardingAccessApi(
  schoolId: string,
  accessGrantId: string
) {
  const response = await apiClient.delete(
    `${root(schoolId)}/access-grants/${accessGrantId}`
  )
  return normalizeResponse(response)
}

export type * from "./types"
