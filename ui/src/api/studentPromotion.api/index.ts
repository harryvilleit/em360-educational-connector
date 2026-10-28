import apiClient from "../api"
import { normalizeResponse } from "@/utils/apiResponse"
import type {
  GetStudentsForPromotionParamsI,
  GetStudentsForPromotionResponseI,
  PromoteStudentsPayloadI,
  PromoteStudentsResponseI,
} from "./types"

export const getStudentsForPromotionApi = async (
  params: GetStudentsForPromotionParamsI
): Promise<GetStudentsForPromotionResponseI> => {
  const res = await apiClient.get("/StudentPromotion/GetStudentsForPromotion", {
    params,
  })
  return normalizeResponse<GetStudentsForPromotionResponseI>(res)
}

export const promoteStudentsApi = async (
  payload: PromoteStudentsPayloadI
): Promise<PromoteStudentsResponseI> => {
  const res = await apiClient.post("/StudentPromotion/Promote", payload)
  return normalizeResponse<PromoteStudentsResponseI>(res)
}
