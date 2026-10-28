import apiClient from "../api"
import { normalizeResponse } from "@/utils/apiResponse"
import type { ResultI } from "@/api/liveClass.api/types"
import type {
  ManualStaffAttendancePayloadI,
  MyStaffAttendanceI,
  StaffAttendanceDailyI,
  StaffAttendancePunchPayloadI,
  StaffAttendanceRecordI,
  StaffAttendanceSettingsI,
  StaffAttendanceSettingsPayloadI,
  StaffAttendanceTermI,
} from "@/types/staffAttendance"

export async function getStaffAttendanceSettingsApi(
  schoolId: string
): Promise<ResultI<StaffAttendanceSettingsI>> {
  const response = await apiClient.get("/StaffAttendance/Settings", {
    params: { schoolId },
  })
  return normalizeResponse<ResultI<StaffAttendanceSettingsI>>(response)
}

export async function updateStaffAttendanceSettingsApi(
  schoolId: string,
  payload: StaffAttendanceSettingsPayloadI
): Promise<ResultI<StaffAttendanceSettingsI>> {
  const response = await apiClient.put("/StaffAttendance/Settings", payload, {
    params: { schoolId },
  })
  return normalizeResponse<ResultI<StaffAttendanceSettingsI>>(response)
}

export async function getMyStaffAttendanceApi(
  schoolId: string
): Promise<ResultI<MyStaffAttendanceI>> {
  const response = await apiClient.get("/StaffAttendance/MyToday", {
    params: { schoolId },
  })
  return normalizeResponse<ResultI<MyStaffAttendanceI>>(response)
}

export async function punchStaffAttendanceApi(
  schoolId: string,
  action: "SignIn" | "SignOut",
  payload: StaffAttendancePunchPayloadI
): Promise<ResultI<StaffAttendanceRecordI>> {
  const response = await apiClient.post(
    `/StaffAttendance/${action}`,
    {
      latitude: payload.latitude,
      longitude: payload.longitude,
      accuracyMetres: payload.accuracy,
      earlyLeaveReason: payload.earlyLeaveReason,
    },
    { params: { schoolId } }
  )
  return normalizeResponse<ResultI<StaffAttendanceRecordI>>(response)
}

export async function getDailyStaffAttendanceApi(
  schoolId: string,
  date: string
): Promise<ResultI<StaffAttendanceDailyI>> {
  const response = await apiClient.get("/StaffAttendance/Daily", {
    params: { schoolId, date },
  })
  return normalizeResponse<ResultI<StaffAttendanceDailyI>>(response)
}

export async function getStaffAttendanceTermApi(
  schoolId: string,
  staffSubUserId: string,
  schoolSessionTermId: string
): Promise<ResultI<StaffAttendanceTermI>> {
  const response = await apiClient.get(
    `/StaffAttendance/Staff/${encodeURIComponent(staffSubUserId)}/Term`,
    { params: { schoolId, schoolSessionTermId } }
  )
  return normalizeResponse<ResultI<StaffAttendanceTermI>>(response)
}

export async function upsertManualStaffAttendanceApi(
  schoolId: string,
  staffSubUserId: string,
  payload: ManualStaffAttendancePayloadI
): Promise<ResultI<StaffAttendanceRecordI>> {
  const response = await apiClient.put(
    `/StaffAttendance/Staff/${encodeURIComponent(staffSubUserId)}/Manual`,
    payload,
    { params: { schoolId } }
  )
  return normalizeResponse<ResultI<StaffAttendanceRecordI>>(response)
}
