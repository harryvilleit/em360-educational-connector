import apiClient from "../api"
import { normalizeResponse } from "@/utils/apiResponse"
import type {
  CreateConsentRequestPayloadI,
  CreateConsentRequestResponseI,
  GetConsentRequestsParamsI,
  GetConsentRequestsResponseI,
  GetConsentResponsesParamsI,
  GetConsentResponsesResponseI,
} from "./types"

export const createConsentRequestApi = async (
  payload: CreateConsentRequestPayloadI
): Promise<CreateConsentRequestResponseI> => {
  const res = await apiClient.post("/Consent/Create", payload)
  return normalizeResponse<CreateConsentRequestResponseI>(res)
}

export const getConsentRequestsApi = async (
  params: GetConsentRequestsParamsI
): Promise<GetConsentRequestsResponseI> => {
  const res = await apiClient.get("/Consent/GetRequests", { params })
  return normalizeResponse<GetConsentRequestsResponseI>(res)
}

export const getConsentResponsesApi = async ({
  consentRequestId,
  ...params
}: GetConsentResponsesParamsI): Promise<GetConsentResponsesResponseI> => {
  const res = await apiClient.get(
    `/Consent/GetResponses/${consentRequestId}`,
    { params }
  )
  return normalizeResponse<GetConsentResponsesResponseI>(res)
}
