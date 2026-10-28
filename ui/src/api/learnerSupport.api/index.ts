import apiClient from "../api"
import { normalizeResponse } from "@/utils/apiResponse"
import type {
  AddContributionPayloadI,
  ApiResult,
  CompleteReviewPayloadI,
  CreateReferralPayloadI,
  GetLearnerSupportCasesParamsI,
  LearnerSupportAdjustmentI,
  LearnerSupportCaseDetailI,
  LearnerSupportContributionI,
  LearnerSupportDashboardI,
  LearnerSupportDocumentI,
  LearnerSupportPlanI,
  LearnerSupportReviewI,
  LearnerSupportTeacherSummaryI,
  LogProvisionPayloadI,
  PaginatedLearnerSupportCasesI,
  PassportPayloadI,
  ProvisionLogI,
  SavePlanPayloadI,
  TriagePayloadI,
  UpsertAdjustmentPayloadI,
  UploadDocumentPayloadI,
} from "./types"

const root = (schoolId: string) => `/LearnerSupport/schools/${schoolId}`

export async function getLearnerSupportDashboardApi(schoolId: string) {
  const response = await apiClient.get(`${root(schoolId)}/overview`)
  return normalizeResponse<ApiResult<LearnerSupportDashboardI>>(response)
}

export async function getLearnerSupportCasesApi(params: GetLearnerSupportCasesParamsI) {
  const { schoolId, ...query } = params
  const response = await apiClient.get(`${root(schoolId)}/cases`, { params: query })
  return normalizeResponse<ApiResult<PaginatedLearnerSupportCasesI>>(response)
}

export async function getLearnerSupportCaseApi(schoolId: string, caseId: string) {
  const response = await apiClient.get(`${root(schoolId)}/cases/${caseId}`)
  return normalizeResponse<ApiResult<LearnerSupportCaseDetailI>>(response)
}

export async function getMyLearnerSupportApi(schoolId: string, studentId: string) {
  const response = await apiClient.get(`${root(schoolId)}/students/${studentId}/my-support`)
  return normalizeResponse<ApiResult<LearnerSupportCaseDetailI | null>>(response)
}

export async function getLearnerSupportTeacherSummaryApi(schoolId: string, studentId: string) {
  const response = await apiClient.get(`${root(schoolId)}/students/${studentId}/teacher-summary`)
  return normalizeResponse<ApiResult<LearnerSupportTeacherSummaryI | null>>(response)
}

export async function createLearnerSupportReferralApi(payload: CreateReferralPayloadI) {
  const { schoolId, ...body } = payload
  const response = await apiClient.post(`${root(schoolId)}/referrals`, body)
  return normalizeResponse<ApiResult<LearnerSupportCaseDetailI>>(response)
}

export async function triageLearnerSupportCaseApi(payload: TriagePayloadI) {
  const { schoolId, caseId, ...body } = payload
  const response = await apiClient.put(`${root(schoolId)}/cases/${caseId}/triage`, body)
  return normalizeResponse<ApiResult<LearnerSupportCaseDetailI>>(response)
}

export async function updateLearnerSupportPassportApi(payload: PassportPayloadI) {
  const { schoolId, caseId, ...body } = payload
  const response = await apiClient.put(`${root(schoolId)}/cases/${caseId}/passport`, body)
  return normalizeResponse<ApiResult<LearnerSupportCaseDetailI>>(response)
}

export async function saveLearnerSupportPlanApi(payload: SavePlanPayloadI) {
  const { schoolId, caseId, ...body } = payload
  const response = await apiClient.post(`${root(schoolId)}/cases/${caseId}/plans`, body)
  return normalizeResponse<ApiResult<LearnerSupportPlanI>>(response)
}

export async function logLearnerSupportProvisionApi(payload: LogProvisionPayloadI) {
  const { schoolId, provisionId, ...body } = payload
  const response = await apiClient.post(`${root(schoolId)}/provisions/${provisionId}/logs`, body)
  return normalizeResponse<ApiResult<ProvisionLogI>>(response)
}

export async function upsertLearnerSupportAdjustmentApi(payload: UpsertAdjustmentPayloadI) {
  const { schoolId, caseId, ...body } = payload
  const response = await apiClient.post(`${root(schoolId)}/cases/${caseId}/adjustments`, body)
  return normalizeResponse<ApiResult<LearnerSupportAdjustmentI>>(response)
}

export async function completeLearnerSupportReviewApi(payload: CompleteReviewPayloadI) {
  const { schoolId, caseId, ...body } = payload
  const response = await apiClient.post(`${root(schoolId)}/cases/${caseId}/reviews`, body)
  return normalizeResponse<ApiResult<LearnerSupportReviewI>>(response)
}

export async function addLearnerSupportContributionApi(payload: AddContributionPayloadI) {
  const { schoolId, caseId, ...body } = payload
  const response = await apiClient.post(`${root(schoolId)}/cases/${caseId}/contributions`, body)
  return normalizeResponse<ApiResult<LearnerSupportContributionI>>(response)
}

export async function uploadLearnerSupportDocumentApi(payload: UploadDocumentPayloadI) {
  const form = new FormData()
  form.append("category", payload.category)
  form.append("title", payload.title)
  form.append("isVisibleToFamily", String(payload.isVisibleToFamily))
  form.append("file", payload.file)
  const response = await apiClient.post(
    `${root(payload.schoolId)}/cases/${payload.caseId}/documents`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  )
  return normalizeResponse<ApiResult<LearnerSupportDocumentI>>(response)
}

export type * from "./types"
