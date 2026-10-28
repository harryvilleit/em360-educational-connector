import apiClient from "../api"
import { normalizeResponse } from "@/utils/apiResponse"
import type { ApiResultI } from "@/utils/apiResponse"
import type {
  BroadsheetResponseDto,
  SaveBroadsheetDraftCommand,
  SaveBroadsheetDraftResponseI,
  SubmitBroadsheetCommand,
  SubmitBroadsheetResponseDto,
} from "./types"

interface ApiEnvelope<T> extends ApiResultI {
  message?: string
  value: T
}

export const getBroadsheetApi = async (
  schoolId: string,
  classId: string,
  sessionId: string,
  schoolSessionTermId: string
): Promise<BroadsheetResponseDto> => {
  const res = await apiClient.get("/Grade/Broadsheet", {
    params: { schoolId, classId, sessionId, schoolSessionTermId },
  })
  return normalizeResponse<ApiEnvelope<BroadsheetResponseDto>>(res).value
}

export const saveBroadsheetDraftApi = async (
  payload: SaveBroadsheetDraftCommand
): Promise<SaveBroadsheetDraftResponseI> => {
  const res = await apiClient.post("/Grade/SaveBroadsheetDraft", payload)
  return normalizeResponse<SaveBroadsheetDraftResponseI>(res)
}

export const submitBroadsheetApi = async (
  payload: SubmitBroadsheetCommand
): Promise<SubmitBroadsheetResponseDto> => {
  const res = await apiClient.post("/Grade/SubmitBroadsheet", payload)
  const envelope = normalizeResponse<ApiEnvelope<Omit<SubmitBroadsheetResponseDto, "message">>>(res)
  return { ...envelope.value, message: envelope.message ?? "" }
}
