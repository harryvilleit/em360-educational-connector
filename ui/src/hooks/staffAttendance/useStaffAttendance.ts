import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/store/auth.store"
import {
  getDailyStaffAttendanceApi,
  getMyStaffAttendanceApi,
  getStaffAttendanceSettingsApi,
  getStaffAttendanceTermApi,
  punchStaffAttendanceApi,
  updateStaffAttendanceSettingsApi,
  upsertManualStaffAttendanceApi,
} from "@/api/staffAttendance.api"
import type {
  ManualStaffAttendancePayloadI,
  StaffAttendancePunchPayloadI,
  StaffAttendanceSettingsPayloadI,
} from "@/types/staffAttendance"

const keys = {
  settings: (schoolId: string) => ["staff-attendance", schoolId, "settings"],
  mine: (schoolId: string, userId?: string) => [
    "staff-attendance",
    schoolId,
    "mine",
    userId,
  ],
  daily: (schoolId: string, date: string) => [
    "staff-attendance",
    schoolId,
    "daily",
    date,
  ],
  term: (schoolId: string, staffId: string, termId: string) => [
    "staff-attendance",
    schoolId,
    "staff",
    staffId,
    "term",
    termId,
  ],
}

export function usePersistedAttendanceSettings(schoolId: string) {
  return useQuery({
    queryKey: keys.settings(schoolId),
    queryFn: () => getStaffAttendanceSettingsApi(schoolId),
    enabled: Boolean(schoolId),
    select: (response) => response.value,
  })
}

export function useMyPersistedAttendance(schoolId: string) {
  const userId = useAuthStore((state) => state.user?.id)
  return useQuery({
    queryKey: keys.mine(schoolId, userId),
    queryFn: () => getMyStaffAttendanceApi(schoolId),
    enabled: Boolean(schoolId && userId),
    select: (response) => response.value,
    refetchInterval: 60_000,
  })
}

export function useAttendancePunch(
  schoolId: string,
  action: "SignIn" | "SignOut"
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: StaffAttendancePunchPayloadI) =>
      punchStaffAttendanceApi(schoolId, action, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["staff-attendance", schoolId],
      })
    },
  })
}

export function useUpdatePersistedAttendanceSettings(schoolId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: StaffAttendanceSettingsPayloadI) =>
      updateStaffAttendanceSettingsApi(schoolId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["staff-attendance", schoolId],
      })
    },
  })
}

export function useDailyPersistedStaffAttendance(
  schoolId: string,
  date: string
) {
  return useQuery({
    queryKey: keys.daily(schoolId, date),
    queryFn: () => getDailyStaffAttendanceApi(schoolId, date),
    enabled: Boolean(schoolId && date),
    select: (response) => response.value,
  })
}

export function useStaffAttendanceTerm(
  schoolId: string,
  staffId: string,
  termId: string
) {
  return useQuery({
    queryKey: keys.term(schoolId, staffId, termId),
    queryFn: () => getStaffAttendanceTermApi(schoolId, staffId, termId),
    enabled: Boolean(schoolId && staffId && termId),
    select: (response) => response.value,
  })
}

export function useUpsertManualStaffAttendance(
  schoolId: string,
  staffId: string,
  termId: string
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: ManualStaffAttendancePayloadI) =>
      upsertManualStaffAttendanceApi(schoolId, staffId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: keys.term(schoolId, staffId, termId),
      })
      queryClient.invalidateQueries({
        queryKey: ["staff-attendance", schoolId, "daily"],
      })
    },
  })
}
