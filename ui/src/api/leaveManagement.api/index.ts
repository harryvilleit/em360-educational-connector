import apiClient from "../api"
import { toCamelCase } from "@/utils/caseConversion"
import type {
  AdjustLeaveBalanceCommand,
  AdminLeaveRequestsParamsI,
  CalculateLeaveDurationQuery,
  CancelLeaveRequestCommand,
  LeaveAuditLedgerParamsI,
  LeaveCalendarItemDto,
  LeaveCalendarParamsI,
  LeaveDurationCalculationResult,
  LeaveOverviewDto,
  LeavePaginatedI,
  LeavePolicyDto,
  LeaveRequestDetailDto,
  LeaveRequestDto,
  LeaveResultI,
  LeaveTypeDto,
  LeaveWorkingDaysConfigDto,
  MyLeaveRequestsParamsI,
  ReviewLeaveRequestCommand,
  SaveLeavePolicyCommand,
  SaveLeaveTypeCommand,
  StaffLeaveBalanceDto,
  StaffLeaveBalanceTransactionDto,
  SubmitLeaveRequestCommand,
} from "./types"

const BASE = "/LeaveManagement"

async function unwrap<T>(request: Promise<unknown>): Promise<T> {
  const body = toCamelCase<LeaveResultI<T>>(await request)
  if (body?.isSuccess === false) {
    throw new Error(body.message || body.error || "Request failed")
  }
  return body.value
}

export const getMyLeaveBalancesApi = (schoolId: string) =>
  unwrap<StaffLeaveBalanceDto[]>(
    apiClient.get(`${BASE}/balances/me`, { params: { schoolId } })
  )

export const getMyLeaveRequestsApi = (params: MyLeaveRequestsParamsI) =>
  unwrap<LeaveRequestDto[]>(apiClient.get(`${BASE}/requests/me`, { params }))

export const calculateLeaveDurationApi = (
  payload: CalculateLeaveDurationQuery
) =>
  unwrap<LeaveDurationCalculationResult>(
    apiClient.post(`${BASE}/calculate-duration`, payload)
  )

export const submitLeaveRequestApi = (payload: SubmitLeaveRequestCommand) =>
  unwrap<LeaveRequestDto>(apiClient.post(`${BASE}/requests`, payload))

export const cancelLeaveRequestApi = ({
  leaveRequestId,
  ...payload
}: CancelLeaveRequestCommand) =>
  unwrap<string>(
    apiClient.put(`${BASE}/requests/${leaveRequestId}/cancel`, payload)
  )

export const getLeaveOverviewApi = (schoolId: string) =>
  unwrap<LeaveOverviewDto>(
    apiClient.get(`${BASE}/admin/overview`, { params: { schoolId } })
  )

export const getAdminLeaveRequestsApi = (params: AdminLeaveRequestsParamsI) =>
  unwrap<LeavePaginatedI<LeaveRequestDto>>(
    apiClient.get(`${BASE}/admin/requests`, { params })
  )

export const getAdminLeaveRequestApi = (schoolId: string, id: string) =>
  unwrap<LeaveRequestDetailDto>(
    apiClient.get(`${BASE}/admin/requests/${id}`, { params: { schoolId } })
  )

export const reviewLeaveRequestApi = ({
  leaveRequestId,
  ...payload
}: ReviewLeaveRequestCommand) =>
  unwrap<string>(
    apiClient.post(`${BASE}/admin/requests/${leaveRequestId}/review`, payload)
  )

export const getLeaveCalendarApi = (params: LeaveCalendarParamsI) =>
  unwrap<LeaveCalendarItemDto[]>(apiClient.get(`${BASE}/calendar`, { params }))

export const getLeaveAuditLedgerApi = (params: LeaveAuditLedgerParamsI) =>
  unwrap<LeavePaginatedI<StaffLeaveBalanceTransactionDto>>(
    apiClient.get(`${BASE}/audit-ledger`, { params })
  )

export const adjustLeaveBalanceApi = (payload: AdjustLeaveBalanceCommand) =>
  unwrap<string>(apiClient.post(`${BASE}/balance-adjustment`, payload))

export const getLeaveTypesApi = (schoolId: string, includeInactive = false) =>
  unwrap<LeaveTypeDto[]>(
    apiClient.get(`${BASE}/settings/types`, {
      params: { schoolId, includeInactive },
    })
  )

export const saveLeaveTypeApi = (payload: SaveLeaveTypeCommand) =>
  unwrap<LeaveTypeDto>(apiClient.post(`${BASE}/settings/types`, payload))

export const deleteLeaveTypeApi = ({
  id,
  schoolId,
}: {
  id: string
  schoolId: string
}) =>
  unwrap<string>(
    apiClient.delete(`${BASE}/settings/types/${id}`, { params: { schoolId } })
  )

export const getLeavePoliciesApi = (
  schoolId: string,
  schoolSessionId?: string
) =>
  unwrap<LeavePolicyDto[]>(
    apiClient.get(`${BASE}/settings/policies`, {
      params: { schoolId, schoolSessionId },
    })
  )

export const saveLeavePolicyApi = (payload: SaveLeavePolicyCommand) =>
  unwrap<LeavePolicyDto>(apiClient.post(`${BASE}/settings/policies`, payload))

export const getLeaveWorkingDaysApi = (schoolId: string) =>
  unwrap<LeaveWorkingDaysConfigDto>(
    apiClient.get(`${BASE}/settings/working-days`, { params: { schoolId } })
  )

export const saveLeaveWorkingDaysApi = (payload: LeaveWorkingDaysConfigDto) =>
  unwrap<LeaveWorkingDaysConfigDto>(
    apiClient.put(`${BASE}/settings/working-days`, payload)
  )
