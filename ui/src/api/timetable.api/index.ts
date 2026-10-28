import apiClient from "../api"
import { normalizeResponse } from "@/utils/apiResponse"
import type {
  CreateTimetablePayloadI,
  CreateTimetableResponseI,
  UpdateTimetableSlotPayloadI,
  UpdateTimetableSlotResponseI,
  DeleteTimetableSlotResponseI,
  GetTimetableByWeekParamsI,
  GetTimetableByWeekResponseI,
  GetTeacherTimetableWeekParamsI,
GetTeacherTimetableRangeParamsI,
GetTeacherTimetableRangeResponseI,
  GetAllTimetablesParamsI,
  GetAllTimetablesResponseI,
  GetTimetableOverviewParamsI,
  GetTimetableOverviewResponseI,
} from "./types"

export const createTimetableApi = async (
  payload: CreateTimetablePayloadI
): Promise<CreateTimetableResponseI> => {
  const res = await apiClient.post("/Timetable/CreateTimetable", payload)
  return normalizeResponse<CreateTimetableResponseI>(res)
}

export const getTimetableByWeekApi = async (
  params: GetTimetableByWeekParamsI
): Promise<GetTimetableByWeekResponseI> => {
  const res = await apiClient.get("/Timetable/GetTimetableByWeek", { params })
  return normalizeResponse<GetTimetableByWeekResponseI>(res)
}

/**
 * Teacher-scoped weekly timetable. Returns the same TimetableWeekI shape as the
 * admin view, but only the authenticated teacher's assigned slots — this is the
 * source of the teacher's virtual (Online/Hybrid) E-Learning classes.
 */
export const getTeacherTimetableWeekApi = async (
  params: GetTeacherTimetableWeekParamsI
): Promise<GetTimetableByWeekResponseI> => {
  const { schoolId, ...query } = params
  const res = await apiClient.get(`/TeacherPortal/Timetable/Week/${schoolId}`, {
    params: query,
  })
  return normalizeResponse<GetTimetableByWeekResponseI>(res)
}

export const getAllTimetablesApi = async (
  params: GetAllTimetablesParamsI
): Promise<GetAllTimetablesResponseI> => {
  const res = await apiClient.get("/Timetable/GetAllTimetables", { params })
  return normalizeResponse<GetAllTimetablesResponseI>(res)
}

export const updateTimetableSlotApi = async (
  payload: UpdateTimetableSlotPayloadI
): Promise<UpdateTimetableSlotResponseI> => {
  const res = await apiClient.patch(
    `/Timetable/UpdateTimetable/${payload.id}`,
    payload
  )
  return normalizeResponse<UpdateTimetableSlotResponseI>(res)
}

export const deleteTimetableSlotApi = async (
  id: string
): Promise<DeleteTimetableSlotResponseI> => {
  const res = await apiClient.delete(`/Timetable/DeleteTimetable/${id}`)
  return normalizeResponse<DeleteTimetableSlotResponseI>(res)
}

export const getTimetableOverviewApi = async (
  params: GetTimetableOverviewParamsI
): Promise<GetTimetableOverviewResponseI> => {
  const res = await apiClient.get("/Timetable/GetTimetableOverview", {
    params,
  })
  return normalizeResponse<GetTimetableOverviewResponseI>(res)
}

export const getTeacherTimetableRangeApi = async (
  payload: GetTeacherTimetableRangeParamsI
): Promise<GetTeacherTimetableRangeResponseI> => {

  const { schoolId, ...body } = payload

  const res = await apiClient.post(

    `/TeacherPortal/Timetable/Range/${schoolId}`,

    body

  )

  return normalizeResponse<GetTeacherTimetableRangeResponseI>(res)

}