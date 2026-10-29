import { elearningApiClient, ApiError } from "../api"
import { normalizeResponse, type ApiResultI } from "@/utils/apiResponse"
import { toCamelCase } from "@/utils/caseConversion"
import type {
  CreateTutorProfilePayloadI,
  CreateTutorProfileResponseI,
  TutorMyProfileResponseI,
  PublicTutorSearchParamsI,
  PublicTutorSearchResponseI,
  PublicTutorResponseI,
} from "./types"

export const createTutorProfileApi = async (
  payload: CreateTutorProfilePayloadI
): Promise<CreateTutorProfileResponseI> => {
  const res = await elearningApiClient.post("/Tutor/CreateProfile", payload)
  return normalizeResponse<CreateTutorProfileResponseI>(res)
}

function isProfileNotCreatedMessage(message?: string | null) {
  if (!message) return false
  return /tutor profile has not been created/i.test(message)
}

function emptyMyProfileResponse(
  message = "Tutor profile has not been created yet."
): TutorMyProfileResponseI {
  return {
    isSuccess: false,
    isFailure: true,
    error: message,
    message,
    statusCode: 400,
    value: null,
  }
}

export const getTutorMyProfileApi =
  async (): Promise<TutorMyProfileResponseI> => {
    try {
      const res = await elearningApiClient.get("/Tutor/MyProfile")
      const data = toCamelCase<TutorMyProfileResponseI & ApiResultI>(res)

      if (data?.isSuccess === false || data?.value == null) {
        return emptyMyProfileResponse(
          data?.error || data?.message || undefined
        )
      }

      return normalizeResponse<TutorMyProfileResponseI>(res)
    } catch (err) {
      if (err instanceof ApiError) {
        const payload = toCamelCase<{
          error?: string
          message?: string
          value?: unknown
        }>(err.data)
        const message = payload?.error || payload?.message || err.message
        if (
          err.status === 400 ||
          err.status === 404 ||
          isProfileNotCreatedMessage(message)
        ) {
          return emptyMyProfileResponse(message)
        }
      }

      if (err instanceof Error && isProfileNotCreatedMessage(err.message)) {
        return emptyMyProfileResponse(err.message)
      }

      throw err
    }
  }

export const searchPublicTutorsApi = async (
  params: PublicTutorSearchParamsI = {}
): Promise<PublicTutorSearchResponseI> => {
  const res = await elearningApiClient.get("/Tutor/Search", { params })
  return normalizeResponse<PublicTutorSearchResponseI>(res)
}

export const getPublicTutorApi = async (
  id: string
): Promise<PublicTutorResponseI> => {
  const res = await elearningApiClient.get(`/Tutor/Public/${encodeURIComponent(id)}`)
  return normalizeResponse<PublicTutorResponseI>(res)
}

export type {
  CreateTutorProfilePayloadI,
  CreateTutorProfileResponseI,
  TutorCategorySelectionI,
  TutorMyProfileCategoryI,
  TutorMyProfileI,
  TutorMyProfileResponseI,
  TutorMyProfileSubCategoryI,
  PublicTutorI,
  PublicTutorPageI,
  PublicTutorResponseI,
  PublicTutorSearchParamsI,
  PublicTutorSearchResponseI,
} from "./types"
