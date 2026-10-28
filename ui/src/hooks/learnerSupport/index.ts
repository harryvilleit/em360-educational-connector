import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { queryKeys } from "@/utils/queryKeys"
import {
  addLearnerSupportContributionApi,
  completeLearnerSupportReviewApi,
  createLearnerSupportReferralApi,
  getLearnerSupportCaseApi,
  getLearnerSupportCasesApi,
  getLearnerSupportDashboardApi,
  getLearnerSupportTeacherSummaryApi,
  getMyLearnerSupportApi,
  logLearnerSupportProvisionApi,
  saveLearnerSupportPlanApi,
  triageLearnerSupportCaseApi,
  updateLearnerSupportPassportApi,
  uploadLearnerSupportDocumentApi,
  upsertLearnerSupportAdjustmentApi,
} from "@/api/learnerSupport.api"
import type {
  AddContributionPayloadI,
  CompleteReviewPayloadI,
  CreateReferralPayloadI,
  GetLearnerSupportCasesParamsI,
  LogProvisionPayloadI,
  PassportPayloadI,
  SavePlanPayloadI,
  TriagePayloadI,
  UpsertAdjustmentPayloadI,
  UploadDocumentPayloadI,
} from "@/api/learnerSupport.api"

const FRESH_FOR = 60_000

export function useLearnerSupportDashboard(schoolId: string) {
  const query = useQuery({
    queryKey: [queryKeys.learnerSupportDashboard, schoolId],
    queryFn: () => getLearnerSupportDashboardApi(schoolId),
    enabled: !!schoolId,
    staleTime: FRESH_FOR,
  })
  return { ...query, dashboard: query.data?.value }
}

export function useLearnerSupportCases(params: GetLearnerSupportCasesParamsI) {
  const query = useQuery({
    queryKey: [queryKeys.learnerSupportCases, params],
    queryFn: () => getLearnerSupportCasesApi(params),
    enabled: !!params.schoolId,
    staleTime: FRESH_FOR,
  })
  return {
    ...query,
    cases: query.data?.value?.items ?? [],
    pagination: query.data?.value,
  }
}

export function useLearnerSupportCase(schoolId: string, caseId: string) {
  const query = useQuery({
    queryKey: [queryKeys.learnerSupportCase, schoolId, caseId],
    queryFn: () => getLearnerSupportCaseApi(schoolId, caseId),
    enabled: !!schoolId && !!caseId,
  })
  return { ...query, supportCase: query.data?.value }
}

export function useMyLearnerSupport(schoolId: string, studentId: string) {
  const query = useQuery({
    queryKey: [queryKeys.learnerSupportMySupport, schoolId, studentId],
    queryFn: () => getMyLearnerSupportApi(schoolId, studentId),
    enabled: !!schoolId && !!studentId,
  })
  return { ...query, support: query.data?.value }
}

export function useLearnerSupportTeacherSummary(schoolId: string, studentId: string) {
  const query = useQuery({
    queryKey: [queryKeys.learnerSupportTeacherSummary, schoolId, studentId],
    queryFn: () => getLearnerSupportTeacherSummaryApi(schoolId, studentId),
    enabled: !!schoolId && !!studentId,
  })
  return { ...query, summary: query.data?.value }
}

function useSupportMutation<TPayload>(
  mutationFn: (payload: TPayload) => Promise<unknown>,
  successMessage: string
) {
  const client = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: [queryKeys.learnerSupportDashboard] })
      client.invalidateQueries({ queryKey: [queryKeys.learnerSupportCases] })
      client.invalidateQueries({ queryKey: [queryKeys.learnerSupportCase] })
      client.invalidateQueries({ queryKey: [queryKeys.learnerSupportMySupport] })
      client.invalidateQueries({ queryKey: [queryKeys.learnerSupportTeacherSummary] })
      toast.success(successMessage)
    },
    onError: (error: Error) => toast.error(error.message || "The change could not be saved"),
  })
}

export const useCreateLearnerSupportReferral = () =>
  useSupportMutation<CreateReferralPayloadI>(createLearnerSupportReferralApi, "Referral submitted")
export const useTriageLearnerSupportCase = () =>
  useSupportMutation<TriagePayloadI>(triageLearnerSupportCaseApi, "Triage decision saved")
export const useUpdateLearnerSupportPassport = () =>
  useSupportMutation<PassportPayloadI>(updateLearnerSupportPassportApi, "Learner passport updated")
export const useSaveLearnerSupportPlan = () =>
  useSupportMutation<SavePlanPayloadI>(saveLearnerSupportPlanApi, "Support plan saved")
export const useLogLearnerSupportProvision = () =>
  useSupportMutation<LogProvisionPayloadI>(logLearnerSupportProvisionApi, "Provision delivery logged")
export const useUpsertLearnerSupportAdjustment = () =>
  useSupportMutation<UpsertAdjustmentPayloadI>(upsertLearnerSupportAdjustmentApi, "Adjustment saved")
export const useCompleteLearnerSupportReview = () =>
  useSupportMutation<CompleteReviewPayloadI>(completeLearnerSupportReviewApi, "Review completed")
export const useAddLearnerSupportContribution = () =>
  useSupportMutation<AddContributionPayloadI>(addLearnerSupportContributionApi, "Contribution added")
export const useUploadLearnerSupportDocument = () =>
  useSupportMutation<UploadDocumentPayloadI>(uploadLearnerSupportDocumentApi, "Document uploaded")
