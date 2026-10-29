import apiClient from "../api"
import { normalizeResponse } from "@/utils/apiResponse"

export interface AvailabilityWindow {
  dayOfWeek: number
  startTime: string
  endTime: string
}

export interface StaffAvailabilityWeek {
  staffSubUserId: string
  staffName: string
  weekStartDate: string
  submittedAtUtc: string | null
  windows: AvailabilityWindow[]
}

interface Response<T> {
  isSuccess: boolean
  message?: string
  error?: string
  value: T
}

const path = (schoolId: string, weekStart: string) =>
  `/staff-availability/${encodeURIComponent(schoolId)}/mine/${weekStart}`

export async function getMyAvailability(schoolId: string, weekStart: string) {
  const result = await apiClient.get(path(schoolId, weekStart))
  return normalizeResponse<Response<StaffAvailabilityWeek>>(result).value
}

export async function saveMyAvailability(
  schoolId: string,
  weekStart: string,
  windows: AvailabilityWindow[]
) {
  const result = await apiClient.put(path(schoolId, weekStart), { windows })
  return normalizeResponse<Response<StaffAvailabilityWeek>>(result).value
}

export async function getSchoolAvailability(
  schoolId: string,
  weekStart: string,
  classId: string,
  termId: string
) {
  const result = await apiClient.get(
    `/staff-availability/${encodeURIComponent(schoolId)}/classes/${encodeURIComponent(classId)}/terms/${encodeURIComponent(termId)}/week/${weekStart}`
  )
  return normalizeResponse<Response<StaffAvailabilityWeek[]>>(result).value
}
