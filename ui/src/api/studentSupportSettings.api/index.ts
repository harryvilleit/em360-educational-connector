import apiClient from "../api"
import { normalizeResponse } from "@/utils/apiResponse"
import type {
  ApiResult,
  SchoolStudentSupportSettingsI,
  UpdateSchoolStudentSupportSettingsPayloadI,
} from "./types"

const root = (schoolId: string) =>
  `/StudentSupportSettings/schools/${schoolId}`

export async function getStudentSupportSettingsApi(schoolId: string) {
  const response = await apiClient.get(root(schoolId))
  return normalizeResponse<ApiResult<SchoolStudentSupportSettingsI>>(response)
}

export async function updateStudentSupportSettingsApi(
  payload: UpdateSchoolStudentSupportSettingsPayloadI
) {
  const { schoolId, ...body } = payload
  const response = await apiClient.put(root(schoolId), body)
  return normalizeResponse<ApiResult<SchoolStudentSupportSettingsI>>(response)
}

export type * from "./types"
