import apiClient from "../api"
import { normalizeResponse } from "@/utils/apiResponse"
import type {
  GetStaffDirectoryParamsI,
  GetStaffDirectoryResponseI,
  GetStaffDetailsParamsI,
  GetStaffDetailsResponseI,
  GetStaffAssignedClassesParamsI,
  GetStaffAssignedClassesResponseI,
  GetStaffAssignedSubjectsParamsI,
  GetStaffAssignedSubjectsResponseI,
  GetStaffTimetableParamsI,
  GetStaffTimetableResponseI,
} from "./types"

export const getStaffDirectoryApi = async (
  params: GetStaffDirectoryParamsI
): Promise<GetStaffDirectoryResponseI> => {
  const res = await apiClient.get("/Staff/directory", { params })
  return normalizeResponse<GetStaffDirectoryResponseI>(res)
}

export const getStaffDetailsApi = async (
  params: GetStaffDetailsParamsI
): Promise<GetStaffDetailsResponseI> => {
  const res = await apiClient.get("/Staff/details", { params })
  return normalizeResponse<GetStaffDetailsResponseI>(res)
}

export const getStaffAssignedClassesApi = async (
  params: GetStaffAssignedClassesParamsI
): Promise<GetStaffAssignedClassesResponseI> => {
  const res = await apiClient.get("/Staff/assigned-classes", { params })
  return normalizeResponse<GetStaffAssignedClassesResponseI>(res)
}

export const getStaffAssignedSubjectsApi = async (
  params: GetStaffAssignedSubjectsParamsI
): Promise<GetStaffAssignedSubjectsResponseI> => {
  const res = await apiClient.get("/Staff/assigned-subjects", { params })
  return normalizeResponse<GetStaffAssignedSubjectsResponseI>(res)
}

export const getStaffTimetableApi = async (
  params: GetStaffTimetableParamsI
): Promise<GetStaffTimetableResponseI> => {
  const res = await apiClient.get("/Staff/timetable", { params })
  return normalizeResponse<GetStaffTimetableResponseI>(res)
}
