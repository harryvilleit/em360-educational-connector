import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { queryKeys } from "@/utils/queryKeys"
import {
  addSafeguardingActionApi,
  addSafeguardingReferralApi,
  closeSafeguardingCaseApi,
  completeSafeguardingActionApi,
  getSafeguardingAccessApi,
  getSafeguardingAccessAuditApi,
  getSafeguardingAccessGrantsApi,
  getSafeguardingActionsApi,
  getSafeguardingCaseApi,
  getSafeguardingCasesApi,
  getSafeguardingDashboardApi,
  getSafeguardingEligibleUsersApi,
  grantSafeguardingAccessApi,
  reportSafeguardingConcernApi,
  revokeSafeguardingAccessApi,
  saveSafeguardingSafetyPlanApi,
  triageSafeguardingCaseApi,
  uploadSafeguardingDocumentApi,
} from "@/api/safeguarding.api"
import type {
  AddSafeguardingActionPayloadI,
  AddSafeguardingReferralPayloadI,
  CloseSafeguardingCasePayloadI,
  CompleteSafeguardingActionPayloadI,
  GetSafeguardingCasesParamsI,
  GrantSafeguardingAccessPayloadI,
  ReportConcernPayloadI,
  SaveSafeguardingSafetyPlanPayloadI,
  TriageSafeguardingPayloadI,
  UploadSafeguardingDocumentPayloadI,
} from "@/api/safeguarding.api"

const FRESH_FOR = 60_000

export function useSafeguardingAccess(schoolId: string) {
  const query = useQuery({
    queryKey: [queryKeys.safeguardingAccess, schoolId],
    queryFn: () => getSafeguardingAccessApi(schoolId),
    enabled: !!schoolId,
    staleTime: FRESH_FOR,
  })
  return { ...query, access: query.data?.value }
}

export function useSafeguardingDashboard(schoolId: string, enabled = true) {
  const query = useQuery({
    queryKey: [queryKeys.safeguardingDashboard, schoolId],
    queryFn: () => getSafeguardingDashboardApi(schoolId),
    enabled: !!schoolId && enabled,
    staleTime: FRESH_FOR,
  })
  return { ...query, dashboard: query.data?.value }
}

export function useSafeguardingCases(
  params: GetSafeguardingCasesParamsI,
  enabled = true
) {
  const query = useQuery({
    queryKey: [queryKeys.safeguardingCases, params],
    queryFn: () => getSafeguardingCasesApi(params),
    enabled: !!params.schoolId && enabled,
    staleTime: FRESH_FOR,
  })
  return {
    ...query,
    cases: query.data?.value?.items ?? [],
    pagination: query.data?.value,
  }
}

export function useSafeguardingCase(
  schoolId: string,
  caseId: string,
  enabled = true
) {
  const query = useQuery({
    queryKey: [queryKeys.safeguardingCase, schoolId, caseId],
    queryFn: () => getSafeguardingCaseApi(schoolId, caseId),
    enabled: !!schoolId && !!caseId && enabled,
  })
  return { ...query, safeguardingCase: query.data?.value }
}

export function useSafeguardingActions(
  schoolId: string,
  includeCompleted: boolean,
  enabled = true
) {
  const query = useQuery({
    queryKey: [queryKeys.safeguardingActions, schoolId, includeCompleted],
    queryFn: () => getSafeguardingActionsApi(schoolId, includeCompleted),
    enabled: !!schoolId && enabled,
  })
  return { ...query, actions: query.data?.value ?? [] }
}

export function useSafeguardingAccessGrants(schoolId: string, enabled = true) {
  const query = useQuery({
    queryKey: [queryKeys.safeguardingAccessGrants, schoolId],
    queryFn: () => getSafeguardingAccessGrantsApi(schoolId),
    enabled: !!schoolId && enabled,
  })
  return { ...query, grants: query.data?.value ?? [] }
}

export function useSafeguardingEligibleUsers(schoolId: string, enabled = true) {
  const query = useQuery({
    queryKey: [queryKeys.safeguardingEligibleUsers, schoolId],
    queryFn: () => getSafeguardingEligibleUsersApi(schoolId),
    enabled: !!schoolId && enabled,
  })
  return { ...query, users: query.data?.value ?? [] }
}

export function useSafeguardingAccessAudit(schoolId: string, enabled = true) {
  const query = useQuery({
    queryKey: [queryKeys.safeguardingAccessAudit, schoolId],
    queryFn: () => getSafeguardingAccessAuditApi(schoolId),
    enabled: !!schoolId && enabled,
  })
  return { ...query, audit: query.data?.value ?? [] }
}

function useSafeguardingMutation<TPayload>(
  mutationFn: (payload: TPayload) => Promise<unknown>,
  successMessage: string
) {
  const client = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: [queryKeys.safeguardingDashboard] })
      client.invalidateQueries({ queryKey: [queryKeys.safeguardingCases] })
      client.invalidateQueries({ queryKey: [queryKeys.safeguardingCase] })
      client.invalidateQueries({ queryKey: [queryKeys.safeguardingActions] })
      client.invalidateQueries({
        queryKey: [queryKeys.safeguardingAccessGrants],
      })
      client.invalidateQueries({
        queryKey: [queryKeys.safeguardingEligibleUsers],
      })
      client.invalidateQueries({
        queryKey: [queryKeys.safeguardingAccessAudit],
      })
      client.invalidateQueries({ queryKey: [queryKeys.safeguardingAccess] })
      client.invalidateQueries({ queryKey: [queryKeys.userDashboard] })
      toast.success(successMessage)
    },
    onError: (error: Error) =>
      toast.error(error.message || "The change could not be saved"),
  })
}

export const useReportSafeguardingConcern = () =>
  useSafeguardingMutation<ReportConcernPayloadI>(
    reportSafeguardingConcernApi,
    "Concern submitted securely"
  )
export const useTriageSafeguardingCase = () =>
  useSafeguardingMutation<TriageSafeguardingPayloadI>(
    triageSafeguardingCaseApi,
    "Triage decision saved"
  )
export const useAddSafeguardingAction = () =>
  useSafeguardingMutation<AddSafeguardingActionPayloadI>(
    addSafeguardingActionApi,
    "Action added"
  )
export const useCompleteSafeguardingAction = () =>
  useSafeguardingMutation<CompleteSafeguardingActionPayloadI>(
    completeSafeguardingActionApi,
    "Action updated"
  )
export const useAddSafeguardingReferral = () =>
  useSafeguardingMutation<AddSafeguardingReferralPayloadI>(
    addSafeguardingReferralApi,
    "External referral recorded"
  )
export const useSaveSafeguardingSafetyPlan = () =>
  useSafeguardingMutation<SaveSafeguardingSafetyPlanPayloadI>(
    saveSafeguardingSafetyPlanApi,
    "Safety plan saved"
  )
export const useUploadSafeguardingDocument = () =>
  useSafeguardingMutation<UploadSafeguardingDocumentPayloadI>(
    uploadSafeguardingDocumentApi,
    "Document uploaded"
  )
export const useCloseSafeguardingCase = () =>
  useSafeguardingMutation<CloseSafeguardingCasePayloadI>(
    closeSafeguardingCaseApi,
    "Case closed"
  )
export const useGrantSafeguardingAccess = () =>
  useSafeguardingMutation<GrantSafeguardingAccessPayloadI>(
    grantSafeguardingAccessApi,
    "Safeguarding access updated"
  )

export function useRevokeSafeguardingAccess() {
  return useSafeguardingMutation<{ schoolId: string; accessGrantId: string }>(
    ({ schoolId, accessGrantId }) =>
      revokeSafeguardingAccessApi(schoolId, accessGrantId),
    "Safeguarding access revoked"
  )
}
