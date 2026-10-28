import apiClient from "../api"
import { normalizeResponse, type ApiResultI } from "@/utils/apiResponse"

interface EmailChangePayload {
  studentId: string
  newEmail: string
}

export async function requestStudentEmailChange(payload: EmailChangePayload) {
  return normalizeResponse<ApiResultI>(
    await apiClient.post("/Student/request-email-change", payload)
  )
}

export async function verifyStudentEmailChange(
  payload: EmailChangePayload & { otpCode: string }
) {
  return normalizeResponse<ApiResultI>(
    await apiClient.post("/Student/verify-email-change", payload)
  )
}
