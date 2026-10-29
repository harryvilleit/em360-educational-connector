// WordPress version: intervention actions also need the matching menu permission.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { queryKeys } from "@/utils/queryKeys"
import { usePermissions } from "@/hooks/usePermissions"
import {
  addAttendanceActivityApi,
  closeAttendanceInterventionApi,
  completeAttendanceActivityApi,
  getAttendanceInterventionAccessApi,
  getAttendanceInterventionDashboardApi,
  getAttendanceRiskQueueApi,
  getAttendanceRiskSettingsApi,
  getAttendanceStudentRiskProfileApi,
  openAttendanceInterventionApi,
  recordAttendanceReviewApi,
  referAttendanceInterventionApi,
  updateAttendanceRiskSettingsApi,
} from "@/api/attendanceIntervention.api"
import type {
  AddAttendanceActivityPayloadI,
  CloseAttendanceInterventionPayloadI,
  CompleteAttendanceActivityPayloadI,
  GetAttendanceRisksParamsI,
  OpenAttendanceInterventionPayloadI,
  RecordAttendanceReviewPayloadI,
  ReferAttendanceInterventionPayloadI,
  UpdateAttendanceRiskSettingsPayloadI,
} from "@/api/attendanceIntervention.api"

const FRESH_FOR = 60_000

export function useAttendanceInterventionAccess(schoolId: string) {
  const permissions = usePermissions()
  const query = useQuery({
    queryKey: [queryKeys.attendanceInterventionAccess, schoolId],
    queryFn: () => getAttendanceInterventionAccessApi(schoolId),
    enabled: !!schoolId,
    staleTime: FRESH_FOR,
  })
  const access = query.data?.value
  // The school role must allow the action as well as the menu permission for the screen.
  return {
    ...query,
    access: access
      ? {
          ...access,
          canOpenInterventions:
            access.canManageInterventions && permissions.canCreate("/dashboard/attendance/early-intervention/risks"),
          canManageInterventions:
            access.canManageInterventions && permissions.canUpdate("/dashboard/attendance/early-intervention/risks"),
          canConfigureRules:
            access.canConfigureRules && permissions.canUpdate("/dashboard/attendance/early-intervention/settings"),
        }
      : undefined,
  }
}

export function useAttendanceInterventionDashboard(
  schoolId: string,
  schoolSessionId?: string,
  schoolSessionTermId?: string,
  enabled = true
) {
  const query = useQuery({
    queryKey: [
      queryKeys.attendanceInterventionDashboard,
      schoolId,
      schoolSessionId,
      schoolSessionTermId,
    ],
    queryFn: () =>
      getAttendanceInterventionDashboardApi(schoolId, schoolSessionId, schoolSessionTermId),
    enabled: !!schoolId && enabled,
    staleTime: FRESH_FOR,
  })
  return { ...query, dashboard: query.data?.value }
}

export function useAttendanceRiskQueue(params: GetAttendanceRisksParamsI, enabled = true) {
  const query = useQuery({
    queryKey: [queryKeys.attendanceRiskQueue, params],
    queryFn: () => getAttendanceRiskQueueApi(params),
    enabled: !!params.schoolId && enabled,
    staleTime: FRESH_FOR,
  })
  return { ...query, risks: query.data?.value?.items ?? [], pagination: query.data?.value }
}

export function useAttendanceStudentRiskProfile(
  schoolId: string,
  studentId: string,
  enabled = true
) {
  const query = useQuery({
    queryKey: [queryKeys.attendanceStudentRiskProfile, schoolId, studentId],
    queryFn: () => getAttendanceStudentRiskProfileApi(schoolId, studentId),
    enabled: !!schoolId && !!studentId && enabled,
  })
  return { ...query, profile: query.data?.value }
}

export function useAttendanceRiskSettings(schoolId: string, enabled = true) {
  const query = useQuery({
    queryKey: [queryKeys.attendanceRiskSettings, schoolId],
    queryFn: () => getAttendanceRiskSettingsApi(schoolId),
    enabled: !!schoolId && enabled,
  })
  return { ...query, settings: query.data?.value }
}

function useAttendanceMutation<TPayload>(
  mutationFn: (payload: TPayload) => Promise<unknown>,
  successMessage: string
) {
  const client = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: [queryKeys.attendanceInterventionDashboard] })
      client.invalidateQueries({ queryKey: [queryKeys.attendanceRiskQueue] })
      client.invalidateQueries({ queryKey: [queryKeys.attendanceStudentRiskProfile] })
      client.invalidateQueries({ queryKey: [queryKeys.attendanceRiskSettings] })
      toast.success(successMessage)
    },
    onError: (error: Error) => toast.error(error.message || "The change could not be saved"),
  })
}

export const useUpdateAttendanceRiskSettings = () =>
  useAttendanceMutation<UpdateAttendanceRiskSettingsPayloadI>(
    updateAttendanceRiskSettingsApi,
    "Attendance risk rules updated"
  )
export const useOpenAttendanceIntervention = () =>
  useAttendanceMutation<OpenAttendanceInterventionPayloadI>(
    openAttendanceInterventionApi,
    "Attendance intervention opened"
  )
export const useAddAttendanceActivity = () =>
  useAttendanceMutation<AddAttendanceActivityPayloadI>(
    addAttendanceActivityApi,
    "Intervention activity added"
  )
export const useCompleteAttendanceActivity = () =>
  useAttendanceMutation<CompleteAttendanceActivityPayloadI>(
    completeAttendanceActivityApi,
    "Intervention activity updated"
  )
export const useRecordAttendanceReview = () =>
  useAttendanceMutation<RecordAttendanceReviewPayloadI>(
    recordAttendanceReviewApi,
    "Attendance review recorded"
  )
export const useReferAttendanceIntervention = () =>
  useAttendanceMutation<ReferAttendanceInterventionPayloadI>(
    referAttendanceInterventionApi,
    "Referral submitted securely"
  )
export const useCloseAttendanceIntervention = () =>
  useAttendanceMutation<CloseAttendanceInterventionPayloadI>(
    closeAttendanceInterventionApi,
    "Attendance intervention closed"
  )
