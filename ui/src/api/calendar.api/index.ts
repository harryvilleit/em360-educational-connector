import apiClient from "../api"
import { normalizeResponse } from "@/utils/apiResponse"
import type {
  CreateCalendarEventPayloadI,
  CreateCalendarEventResponseI,
  UpdateCalendarEventPayloadI,
  UpdateCalendarEventResponseI,
  DeleteCalendarEventResponseI,
  GetCalendarEventsParamsI,
  GetCalendarEventsResponseI,
} from "./types"

export const createCalendarEventApi = async (
  payload: CreateCalendarEventPayloadI
): Promise<CreateCalendarEventResponseI> => {
  const res = await apiClient.post("/Calendar/Create", payload)
  return normalizeResponse<CreateCalendarEventResponseI>(res)
}

export const updateCalendarEventApi = async (
  payload: UpdateCalendarEventPayloadI
): Promise<UpdateCalendarEventResponseI> => {
  const res = await apiClient.put("/Calendar/Update", payload)
  return normalizeResponse<UpdateCalendarEventResponseI>(res)
}

export const deleteCalendarEventApi = async (
  id: string
): Promise<DeleteCalendarEventResponseI> => {
  const res = await apiClient.delete(`/Calendar/Delete/${id}`)
  return normalizeResponse<DeleteCalendarEventResponseI>(res)
}

export const getCalendarEventsApi = async (
  params: GetCalendarEventsParamsI
): Promise<GetCalendarEventsResponseI> => {
  const res = await apiClient.get("/Calendar/GetEvents", { params })
  return normalizeResponse<GetCalendarEventsResponseI>(res)
}
