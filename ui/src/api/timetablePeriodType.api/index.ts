import apiClient from "../api"
import { normalizeResponse } from "@/utils/apiResponse"
import type {
  CreatePeriodTypePayloadI,
  CreatePeriodTypeResponseI,
  GetPeriodTypesBySchoolParamsI,
  GetPeriodTypesBySchoolResponseI,
  UpdatePeriodTypePayloadI,
  UpdatePeriodTypeResponseI,
  PeriodTypeIdPayloadI,
  TogglePeriodTypeStatusResponseI,
  DeletePeriodTypeResponseI,
} from "./types"

export const createPeriodTypeApi = async (
  payload: CreatePeriodTypePayloadI
): Promise<CreatePeriodTypeResponseI> => {
  const res = await apiClient.post("/TimetablePeriodType/Create", payload)
  return normalizeResponse<CreatePeriodTypeResponseI>(res)
}

export const getPeriodTypesBySchoolApi = async ({
  schoolId,
  ...params
}: GetPeriodTypesBySchoolParamsI): Promise<GetPeriodTypesBySchoolResponseI> => {
  const res = await apiClient.get(
    `/TimetablePeriodType/GetBySchool/${schoolId}`,
    { params }
  )
  return normalizeResponse<GetPeriodTypesBySchoolResponseI>(res)
}

export const updatePeriodTypeApi = async (
  payload: UpdatePeriodTypePayloadI
): Promise<UpdatePeriodTypeResponseI> => {
  const res = await apiClient.put("/TimetablePeriodType/Update", payload)
  return normalizeResponse<UpdatePeriodTypeResponseI>(res)
}

export const togglePeriodTypeStatusApi = async (
  payload: PeriodTypeIdPayloadI
): Promise<TogglePeriodTypeStatusResponseI> => {
  const res = await apiClient.patch("/TimetablePeriodType/ToggleStatus", payload)
  return normalizeResponse<TogglePeriodTypeStatusResponseI>(res)
}

export const deletePeriodTypeApi = async (
  payload: PeriodTypeIdPayloadI
): Promise<DeletePeriodTypeResponseI> => {
  const res = await apiClient.delete("/TimetablePeriodType/Delete", {
    data: payload,
  })
  return normalizeResponse<DeletePeriodTypeResponseI>(res)
}
