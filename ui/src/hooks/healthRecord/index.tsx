import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { queryKeys } from "@/utils/queryKeys"
import {
  getHealthRecordOverviewApi,
  getAllSickBayLogsApi,
  getSickBayLogByIdApi,
  logSickBayVisitApi,
  updateSickBayLogApi,
  voidSickBayLogApi,
  getAllStudentHealthRecordsApi,
  getStudentHealthRecordByIdApi,
  upsertStudentHealthRecordApi,
  getStudentHealthWorkspaceApi,
  saveHealthCarePlanApi,
  recordHealthConsentApi,
  createMedicationAuthorisationApi,
  recordMedicationAdministrationApi,
  recordHealthIncidentApi,
  getMyHealthAccessApi,
  getHealthAccessGrantsApi,
  grantHealthAccessApi,
  activateEmergencyHealthAccessApi,
  getHealthSecurityAlertsApi,
  acknowledgeHealthSecurityAlertApi,
} from "@/api/healthRecord.api"
import type {
  GetHealthRecordOverviewParamsI,
  GetHealthRecordOverviewResponseI,
  GetAllSickBayLogsParamsI,
  GetAllSickBayLogsResponseI,
  GetSickBayLogByIdResponseI,
  LogSickBayVisitPayloadI,
  LogSickBayVisitResponseI,
  UpdateSickBayLogPayloadI,
  UpdateSickBayLogResponseI,
  VoidSickBayLogPayloadI,
  VoidSickBayLogResponseI,
  GetAllStudentHealthRecordsParamsI,
  GetAllStudentHealthRecordsResponseI,
  GetStudentHealthRecordByIdResponseI,
  UpsertStudentHealthRecordPayloadI,
  UpsertStudentHealthRecordResponseI,
  GetStudentHealthWorkspaceResponseI,
  SaveHealthCarePlanPayloadI,
  RecordHealthConsentPayloadI,
  CreateMedicationAuthorisationPayloadI,
  RecordMedicationAdministrationPayloadI,
  RecordHealthIncidentPayloadI,
  GetHealthAccessResponseI,
  GetHealthAccessGrantsResponseI,
  GrantHealthAccessPayloadI,
  ActivateEmergencyHealthAccessPayloadI,
  ActivateEmergencyHealthAccessResponseI,
  GetHealthSecurityAlertsResponseI,
} from "@/api/healthRecord.api/types"

export const useGetHealthRecordOverview = (
  params: GetHealthRecordOverviewParamsI
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetHealthRecordOverviewResponseI>({
      queryKey: [queryKeys.healthRecordOverview, params],
      queryFn: () => getHealthRecordOverviewApi(params),
      enabled: !!params.schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    overview: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetAllSickBayLogs = (params: GetAllSickBayLogsParamsI) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetAllSickBayLogsResponseI>({
      queryKey: [queryKeys.sickBayLogs, params],
      queryFn: () => getAllSickBayLogsApi(params),
      enabled: !!params.schoolId,
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    })

  return {
    logs: data?.value?.items ?? [],
    pagination: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetSickBayLogById = (id: string, schoolId: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetSickBayLogByIdResponseI>({
      queryKey: [queryKeys.sickBayLogById, schoolId, id],
      queryFn: () => getSickBayLogByIdApi(id, schoolId),
      enabled: Boolean(id && schoolId),
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    })

  return {
    log: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

interface UseLogSickBayVisitOptions {
  onSuccess?: (data: LogSickBayVisitResponseI) => void
  onError?: (error: Error) => void
}

export const useLogSickBayVisit = ({
  onSuccess,
  onError,
}: UseLogSickBayVisitOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<LogSickBayVisitResponseI, Error, LogSickBayVisitPayloadI>({
      mutationFn: logSickBayVisitApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.sickBayLogs] })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.healthRecordOverview],
        })
        toast.success("Sick bay visit logged successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to log sick bay visit")
        onError?.(err)
      },
    })

  return {
    logSickBayVisit: mutate,
    logSickBayVisitAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseUpdateSickBayLogOptions {
  onSuccess?: (data: UpdateSickBayLogResponseI) => void
  onError?: (error: Error) => void
}

export const useUpdateSickBayLog = ({
  onSuccess,
  onError,
}: UseUpdateSickBayLogOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<UpdateSickBayLogResponseI, Error, UpdateSickBayLogPayloadI>({
      mutationFn: updateSickBayLogApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.sickBayLogs] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.sickBayLogById] })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.healthRecordOverview],
        })
        toast.success("Sick bay log updated successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to update sick bay log")
        onError?.(err)
      },
    })

  return {
    updateSickBayLog: mutate,
    updateSickBayLogAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseVoidSickBayLogOptions {
  onSuccess?: (data: VoidSickBayLogResponseI) => void
  onError?: (error: Error) => void
}

export const useVoidSickBayLog = ({
  onSuccess,
  onError,
}: UseVoidSickBayLogOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<VoidSickBayLogResponseI, Error, VoidSickBayLogPayloadI>({
      mutationFn: voidSickBayLogApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.sickBayLogs] })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.healthRecordOverview],
        })
        toast.success("Sick bay record voided")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to void sick bay record")
        onError?.(err)
      },
    })

  return {
    voidSickBayLog: mutate,
    voidSickBayLogAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetAllStudentHealthRecords = (
  params: GetAllStudentHealthRecordsParamsI
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetAllStudentHealthRecordsResponseI>({
      queryKey: [queryKeys.studentHealthRecords, params],
      queryFn: () => getAllStudentHealthRecordsApi(params),
      enabled: !!params.schoolId,
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    })

  return {
    records: data?.value?.items ?? [],
    pagination: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetStudentHealthRecordById = (
  studentSchoolId: string,
  schoolId: string
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetStudentHealthRecordByIdResponseI>({
      queryKey: [queryKeys.studentHealthRecordById, schoolId, studentSchoolId],
      queryFn: () => getStudentHealthRecordByIdApi(studentSchoolId, schoolId),
      enabled: Boolean(studentSchoolId && schoolId),
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    })

  return {
    record: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

interface UseUpsertStudentHealthRecordOptions {
  onSuccess?: (data: UpsertStudentHealthRecordResponseI) => void
  onError?: (error: Error) => void
}

export const useUpsertStudentHealthRecord = ({
  onSuccess,
  onError,
}: UseUpsertStudentHealthRecordOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      UpsertStudentHealthRecordResponseI,
      Error,
      UpsertStudentHealthRecordPayloadI
    >({
      mutationFn: upsertStudentHealthRecordApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.studentHealthRecords],
        })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.studentHealthRecordById],
        })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.healthRecordOverview],
        })
        toast.success("Health record saved successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to save health record")
        onError?.(err)
      },
    })

  return {
    upsertStudentHealthRecord: mutate,
    upsertStudentHealthRecordAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetStudentHealthWorkspace = (
  schoolId?: string,
  studentSchoolId?: string
) => {
  const query = useQuery<GetStudentHealthWorkspaceResponseI>({
    queryKey: [queryKeys.studentHealthWorkspace, schoolId, studentSchoolId],
    queryFn: () => getStudentHealthWorkspaceApi(schoolId!, studentSchoolId!),
    enabled: Boolean(schoolId && studentSchoolId),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  })

  return {
    workspace: query.data?.value,
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export const useGetMyHealthAccess = (schoolId?: string) => {
  const query = useQuery<GetHealthAccessResponseI>({
    queryKey: [queryKeys.healthAccess, schoolId],
    queryFn: () => getMyHealthAccessApi(schoolId!),
    enabled: Boolean(schoolId),
    staleTime: 2 * 60 * 1000,
  })
  return { access: query.data?.value, ...query }
}

export const useGetHealthAccessGrants = (schoolId?: string, enabled = true) => {
  const query = useQuery<GetHealthAccessGrantsResponseI>({
    queryKey: [queryKeys.healthAccessGrants, schoolId],
    queryFn: () => getHealthAccessGrantsApi(schoolId!),
    enabled: Boolean(schoolId && enabled),
    staleTime: 30 * 1000,
  })
  return { grants: query.data?.value ?? [], ...query }
}

export const useGrantHealthAccess = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: GrantHealthAccessPayloadI) =>
      grantHealthAccessApi(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.healthAccessGrants],
      })
      toast.success(data.message || "Health access updated")
    },
    onError: (error: Error) =>
      toast.error(error.message || "Unable to update health access"),
  })
}

export const useActivateEmergencyHealthAccess = () => {
  const queryClient = useQueryClient()
  return useMutation<
    ActivateEmergencyHealthAccessResponseI,
    Error,
    ActivateEmergencyHealthAccessPayloadI
  >({
    mutationFn: activateEmergencyHealthAccessApi,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.studentHealthWorkspace],
      })
      toast.warning(data.message || "Emergency access activated")
    },
    onError: (error: Error) =>
      toast.error(error.message || "Unable to activate emergency access"),
  })
}

export const useGetHealthSecurityAlerts = (
  schoolId?: string,
  enabled = true
) => {
  const query = useQuery<GetHealthSecurityAlertsResponseI>({
    queryKey: ["health-security-alerts", schoolId],
    queryFn: () => getHealthSecurityAlertsApi(schoolId!),
    enabled: Boolean(schoolId && enabled),
    staleTime: 30 * 1000,
  })
  return { alerts: query.data?.value ?? [], ...query }
}

export const useAcknowledgeHealthSecurityAlert = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      schoolId,
      alertId,
    }: {
      schoolId: string
      alertId: string
    }) => acknowledgeHealthSecurityAlertApi(schoolId, alertId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["health-security-alerts"] }),
    onError: (error: Error) =>
      toast.error(error.message || "Unable to acknowledge security alert"),
  })
}

function useHealthWorkspaceInvalidation() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({
      queryKey: [queryKeys.studentHealthWorkspace],
    })
    queryClient.invalidateQueries({
      queryKey: [queryKeys.studentHealthRecords],
    })
    queryClient.invalidateQueries({
      queryKey: [queryKeys.studentHealthRecordById],
    })
    queryClient.invalidateQueries({
      queryKey: [queryKeys.healthRecordOverview],
    })
  }
}

export const useSaveHealthCarePlan = () => {
  const invalidate = useHealthWorkspaceInvalidation()
  return useMutation({
    mutationFn: (payload: SaveHealthCarePlanPayloadI) =>
      saveHealthCarePlanApi(payload),
    onSuccess: (data) => {
      invalidate()
      toast.success(data.message || "Care plan saved")
    },
    onError: (error: Error) =>
      toast.error(error.message || "Unable to save care plan"),
  })
}

export const useRecordHealthConsent = () => {
  const invalidate = useHealthWorkspaceInvalidation()
  return useMutation({
    mutationFn: (payload: RecordHealthConsentPayloadI) =>
      recordHealthConsentApi(payload),
    onSuccess: (data) => {
      invalidate()
      toast.success(data.message || "Consent recorded")
    },
    onError: (error: Error) =>
      toast.error(error.message || "Unable to record consent"),
  })
}

export const useCreateMedicationAuthorisation = () => {
  const invalidate = useHealthWorkspaceInvalidation()
  return useMutation({
    mutationFn: (payload: CreateMedicationAuthorisationPayloadI) =>
      createMedicationAuthorisationApi(payload),
    onSuccess: (data) => {
      invalidate()
      toast.success(data.message || "Medication authorised")
    },
    onError: (error: Error) =>
      toast.error(error.message || "Unable to authorise medication"),
  })
}

export const useRecordMedicationAdministration = () => {
  const invalidate = useHealthWorkspaceInvalidation()
  return useMutation({
    mutationFn: (payload: RecordMedicationAdministrationPayloadI) =>
      recordMedicationAdministrationApi(payload),
    onSuccess: (data) => {
      invalidate()
      toast.success(data.message || "Administration recorded")
    },
    onError: (error: Error) =>
      toast.error(error.message || "Unable to record administration"),
  })
}

export const useRecordHealthIncident = () => {
  const invalidate = useHealthWorkspaceInvalidation()
  return useMutation({
    mutationFn: (payload: RecordHealthIncidentPayloadI) =>
      recordHealthIncidentApi(payload),
    onSuccess: (data) => {
      invalidate()
      toast.success(data.message || "Incident recorded")
    },
    onError: (error: Error) =>
      toast.error(error.message || "Unable to record incident"),
  })
}
