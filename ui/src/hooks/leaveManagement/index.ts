import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import {
  calculateLeaveDurationApi,
  adjustLeaveBalanceApi,
  cancelLeaveRequestApi,
  deleteLeaveTypeApi,
  getAdminLeaveRequestApi,
  getAdminLeaveRequestsApi,
  getLeaveOverviewApi,
  getLeaveAuditLedgerApi,
  getLeaveCalendarApi,
  getLeavePoliciesApi,
  getLeaveTypesApi,
  getLeaveWorkingDaysApi,
  getMyLeaveBalancesApi,
  getMyLeaveRequestsApi,
  reviewLeaveRequestApi,
  saveLeavePolicyApi,
  saveLeaveTypeApi,
  saveLeaveWorkingDaysApi,
  submitLeaveRequestApi,
} from "@/api/leaveManagement.api"
import type {
  AdminLeaveRequestsParamsI,
  CalculateLeaveDurationQuery,
  LeaveAuditLedgerParamsI,
  LeaveCalendarParamsI,
  MyLeaveRequestsParamsI,
} from "@/api/leaveManagement.api/types"

const root = (schoolId: string) => ["leave", schoolId] as const

const STALE = 60 * 1000

export const useMyLeaveBalances = (schoolId: string) =>
  useQuery({
    queryKey: [...root(schoolId), "balances", "me"],
    queryFn: () => getMyLeaveBalancesApi(schoolId),
    enabled: !!schoolId,
    staleTime: STALE,
  })

export const useMyLeaveRequests = (params: MyLeaveRequestsParamsI) =>
  useQuery({
    queryKey: [...root(params.schoolId), "requests", "me", params],
    queryFn: () => getMyLeaveRequestsApi(params),
    enabled: !!params.schoolId,
    placeholderData: keepPreviousData,
  })

export const useCalculateLeaveDuration = (
  query: CalculateLeaveDurationQuery,
  enabled: boolean
) =>
  useQuery({
    queryKey: [...root(query.schoolId), "calculate", query],
    queryFn: () => calculateLeaveDurationApi(query),
    enabled,
    retry: false,
    placeholderData: keepPreviousData,
  })

export const useLeaveAdminOverview = (schoolId: string, enabled = true) =>
  useQuery({
    queryKey: [...root(schoolId), "admin", "overview"],
    queryFn: () => getLeaveOverviewApi(schoolId),
    enabled: !!schoolId && enabled,
    staleTime: STALE,
  })

export const useAdminLeaveRequests = (
  params: AdminLeaveRequestsParamsI,
  enabled = true
) =>
  useQuery({
    queryKey: [...root(params.schoolId), "admin", "requests", params],
    queryFn: () => getAdminLeaveRequestsApi(params),
    enabled: !!params.schoolId && enabled,
    placeholderData: keepPreviousData,
  })

export const useAdminLeaveRequest = (schoolId: string, id: string) =>
  useQuery({
    queryKey: [...root(schoolId), "admin", "request", id],
    queryFn: () => getAdminLeaveRequestApi(schoolId, id),
    enabled: !!schoolId && !!id,
  })

export const useLeaveCalendar = (
  params: LeaveCalendarParamsI,
  enabled = true
) =>
  useQuery({
    queryKey: [...root(params.schoolId), "calendar", params],
    queryFn: () => getLeaveCalendarApi(params),
    enabled: !!params.schoolId && enabled,
    placeholderData: keepPreviousData,
  })

export const useLeaveAuditLedger = (
  params: LeaveAuditLedgerParamsI,
  enabled = true
) =>
  useQuery({
    queryKey: [...root(params.schoolId), "ledger", params],
    queryFn: () => getLeaveAuditLedgerApi(params),
    enabled: !!params.schoolId && enabled,
    placeholderData: keepPreviousData,
  })

export const useLeaveTypes = (
  schoolId: string,
  enabled = true,
  includeInactive = false
) =>
  useQuery({
    queryKey: [...root(schoolId), "settings", "types", includeInactive],
    queryFn: () => getLeaveTypesApi(schoolId, includeInactive),
    enabled: !!schoolId && enabled,
    staleTime: STALE,
  })

export const useLeavePolicies = (schoolId: string, enabled = true) =>
  useQuery({
    queryKey: [...root(schoolId), "settings", "policies"],
    queryFn: () => getLeavePoliciesApi(schoolId),
    enabled: !!schoolId && enabled,
    staleTime: STALE,
  })

export const useLeaveWorkingDays = (schoolId: string, enabled = true) =>
  useQuery({
    queryKey: [...root(schoolId), "settings", "working-days"],
    queryFn: () => getLeaveWorkingDaysApi(schoolId),
    enabled: !!schoolId && enabled,
    staleTime: STALE,
  })

function useLeaveMutation<TVars, TData>(
  schoolId: string,
  mutationFn: (vars: TVars) => Promise<TData>
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: root(schoolId) }),
  })
}

export const useSubmitLeaveRequest = (schoolId: string) =>
  useLeaveMutation(schoolId, submitLeaveRequestApi)

export const useCancelLeaveRequest = (schoolId: string) =>
  useLeaveMutation(schoolId, cancelLeaveRequestApi)

export const useReviewLeaveRequest = (schoolId: string) =>
  useLeaveMutation(schoolId, reviewLeaveRequestApi)

export const useAdjustLeaveBalance = (schoolId: string) =>
  useLeaveMutation(schoolId, adjustLeaveBalanceApi)

export const useDeleteLeaveType = (schoolId: string) =>
  useLeaveMutation(schoolId, deleteLeaveTypeApi)

export const useSaveLeaveType = (schoolId: string) =>
  useLeaveMutation(schoolId, saveLeaveTypeApi)

export const useSaveLeavePolicy = (schoolId: string) =>
  useLeaveMutation(schoolId, saveLeavePolicyApi)

export const useSaveLeaveWorkingDays = (schoolId: string) =>
  useLeaveMutation(schoolId, saveLeaveWorkingDaysApi)
