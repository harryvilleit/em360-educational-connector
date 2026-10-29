import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"
import { queryKeys } from "@/utils/queryKeys"
import { isValidEmail } from "@/utils"
import {
  createGuardianApi,
  updateGuardianApi,
  deleteGuardianApi,
  getAllGuardiansApi,
  getGuardianByIdApi,
  getGuardianByEmailApi,
  getSchoolParentsApi,
  getGuardianDetailsApi,
  getLaunchSchoolPortalApi,
  getGuardianChildrenApi,
  getGuardianFeeManagementApi,
  getStudentFeeBreakdownApi,
  subscribeToPaymentItemApi,
  getStudentEnrolledClassesApi,
  subscribeToOptionalSubjectApi,
  getGuardianStudentResultApi,
  getGuardianStudentAttendanceApi,
  adminResetGuardianPasswordApi,
  assignGuardiansToStudentApi,
} from "@/api/guardian.api"
import type {
  CreateGuardianPayloadI,
  CreateGuardianResponseI,
  UpdateGuardianPayloadI,
  UpdateGuardianResponseI,
  DeleteGuardianParamsI,
  DeleteGuardianResponseI,
  GetAllGuardiansParamsI,
  GetAllGuardiansResponseI,
  GetGuardianByIdParamsI,
  GetGuardianByIdResponseI,
  GetGuardianByEmailResponseI,
  GetSchoolParentsParamsI,
  GetSchoolParentsResponseI,
  GetGuardianDetailsParamsI,
  GetGuardianDetailsResponseI,
  LaunchSchoolPortalResponseI,
  GetGuardianChildrenParamsI,
  GetGuardianChildrenResponseI,
  GetGuardianFeeManagementParamsI,
  GetGuardianFeeManagementResponseI,
  GetStudentFeeBreakdownParamsI,
  GetStudentFeeBreakdownResponseI,
  SubscribeToPaymentItemPayloadI,
  SubscribeToPaymentItemResponseI,
  GetStudentEnrolledClassesParamsI,
  GetStudentEnrolledClassesResponseI,
  SubscribeToOptionalSubjectPayloadI,
  SubscribeToOptionalSubjectResponseI,
  GetGuardianStudentResultParamsI,
  GetGuardianStudentResultResponseI,
  GetGuardianStudentAttendanceParamsI,
  GetGuardianStudentAttendanceResponseI,
  AdminResetGuardianPasswordPayloadI,
  AdminResetGuardianPasswordResponseI,
  AssignGuardiansToStudentPayloadI,
  AssignGuardiansToStudentResponseI,
} from "@/api/guardian.api/types"

import { useSchoolId } from "@/contexts/SchoolContext"

interface UseCreateGuardianOptions {
  onSuccess?: (data: CreateGuardianResponseI) => void
  onError?: (error: Error) => void
}

export const useCreateGuardian = ({
  onSuccess,
  onError,
}: UseCreateGuardianOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<CreateGuardianResponseI, Error, CreateGuardianPayloadI>({
      mutationFn: createGuardianApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.guardians] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.schoolParents] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.guardianDetails] })
        queryClient.invalidateQueries({ queryKey: ["parent-overview"] })
        toast.success("Guardian created successfully")
        onSuccess?.(data)
      },
      onError,
    })

  return {
    createGuardian: mutate,
    createGuardianAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseUpdateGuardianOptions {
  onSuccess?: (data: UpdateGuardianResponseI) => void
  onError?: (error: Error) => void
}

export const useUpdateGuardian = ({
  onSuccess,
  onError,
}: UseUpdateGuardianOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<UpdateGuardianResponseI, Error, UpdateGuardianPayloadI>({
      mutationFn: updateGuardianApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.guardians] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.guardianById] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.schoolParents] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.guardianDetails] })
        queryClient.invalidateQueries({ queryKey: ["parent-overview"] })
        toast.success("Guardian updated successfully")
        onSuccess?.(data)
      },
      onError,
    })

  return {
    updateGuardian: mutate,
    updateGuardianAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseDeleteGuardianOptions {
  onSuccess?: (data: DeleteGuardianResponseI) => void
  onError?: (error: Error) => void
}

export const useDeleteGuardian = ({
  onSuccess,
  onError,
}: UseDeleteGuardianOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<DeleteGuardianResponseI, Error, DeleteGuardianParamsI>({
      mutationFn: deleteGuardianApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.guardians] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.schoolParents] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.guardianDetails] })
        queryClient.invalidateQueries({ queryKey: ["parent-overview"] })
        toast.success("Guardian removed successfully")
        onSuccess?.(data)
      },
      onError,
    })

  return {
    deleteGuardian: mutate,
    deleteGuardianAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetAllGuardians = (params: GetAllGuardiansParamsI = {}) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetAllGuardiansResponseI>({
      queryKey: [queryKeys.guardians, params],
      queryFn: () => getAllGuardiansApi(params),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    guardians: data?.value?.items ?? [],
    pagination: {
      pageNumber: data?.value?.pageNumber ?? 1,
      pageSize: data?.value?.pageSize ?? 10,
      totalItems: data?.value?.totalItems ?? 0,
      totalPages: data?.value?.totalPages ?? 0,
    },
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetGuardianByEmail = (email: string) => {
  const trimmedEmail = email.trim()
  const enabled = isValidEmail(trimmedEmail)

  const { data, isFetching, isError, error, isSuccess } =
    useQuery<GetGuardianByEmailResponseI>({
      queryKey: [queryKeys.guardianByEmail, trimmedEmail],
      queryFn: () => getGuardianByEmailApi({ email: trimmedEmail }),
      enabled,
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    })

  return {
    guardian: data?.value ?? null,
    isLoading: enabled && isFetching,
    isError,
    error,
    isSuccess,
  }
}

export const useGetSchoolParents = (params: GetSchoolParentsParamsI) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetSchoolParentsResponseI>({
      queryKey: [queryKeys.schoolParents, params],
      queryFn: () => getSchoolParentsApi(params),
      enabled: !!params.schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    parents: data?.value?.items ?? [],
    pagination: {
      pageNumber: data?.value?.pageNumber ?? 1,
      pageSize: data?.value?.pageSize ?? 10,
      totalItems: data?.value?.totalItems ?? 0,
      totalPages: data?.value?.totalPages ?? 0,
    },
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetGuardianById = (params: GetGuardianByIdParamsI) => {
  const schoolId = useSchoolId()
  params = { ...params, schoolId: params.schoolId || schoolId || undefined }
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetGuardianByIdResponseI>({
      queryKey: [queryKeys.guardianById, params],
      queryFn: () => getGuardianByIdApi(params),
      enabled: !!params.id,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    guardian: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetGuardianChildren = (params: GetGuardianChildrenParamsI) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetGuardianChildrenResponseI>({
      queryKey: [queryKeys.guardianChildren, params],
      queryFn: () => getGuardianChildrenApi(params),
      enabled: !!params.guardianId && !!params.schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    children: data?.value ?? [],
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetGuardianFeeManagement = (
  params: GetGuardianFeeManagementParamsI
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetGuardianFeeManagementResponseI>({
      queryKey: [queryKeys.guardianFeeManagement, params],
      queryFn: () => getGuardianFeeManagementApi(params),
      enabled:
        !!params.guardianId &&
        !!params.schoolId &&
        !!params.studentId &&
        !!params.schoolSessionId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    feeManagement: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetStudentFeeBreakdown = (
  params: GetStudentFeeBreakdownParamsI,
  enabled: boolean = true
) => {
  const { data, isPending, isFetching, isError, error, isSuccess, refetch } =
    useQuery<GetStudentFeeBreakdownResponseI>({
      queryKey: [queryKeys.studentFeeBreakdown, params],
      queryFn: () => getStudentFeeBreakdownApi(params),
      enabled:
        enabled &&
        !!params.guardianId &&
        !!params.schoolId &&
        !!params.studentId &&
        !!params.schoolSessionId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    feeBreakdown: data?.value,
    isLoading: isPending,
    isFetching,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useSubscribeToPaymentItem = () => {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useMutation<
    SubscribeToPaymentItemResponseI,
    Error,
    SubscribeToPaymentItemPayloadI
  >({
    mutationFn: subscribeToPaymentItemApi,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.guardianFeeManagement],
      })

      queryClient.invalidateQueries({
        queryKey: [queryKeys.studentFeeBreakdown],
      })
      queryClient.invalidateQueries({
        queryKey: [queryKeys.launchSchoolPortal],
      })
      toast.success("Optional fee added to the student's bill.")
    },
    onError: (error) => {
      toast.error(error.message || "Unable to add the optional fee.")
    },
  })

  return { subscribeToPaymentItemAsync: mutateAsync, isPending }
}

export const useGetStudentEnrolledClasses = (
  params: GetStudentEnrolledClassesParamsI
) => {
  const { data, isPending, isFetching, isError, error, isSuccess, refetch } =
    useQuery<GetStudentEnrolledClassesResponseI>({
      queryKey: [queryKeys.studentEnrolledClasses, params],
      queryFn: () => getStudentEnrolledClassesApi(params),
      enabled: !!params.studentId && !!params.schoolId,
      staleTime: 2 * 60 * 1000,
      gcTime: 5 * 60 * 1000,
    })

  return {
    studentName: data?.value?.studentName,
    session: data?.value?.session ?? null,
    term: data?.value?.term ?? null,
    enrolledClasses: data?.value?.enrolledClasses ?? [],
    isLoading: isPending,
    isFetching,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useSubscribeToOptionalSubject = () => {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useMutation<
    SubscribeToOptionalSubjectResponseI,
    Error,
    SubscribeToOptionalSubjectPayloadI & { subjectName?: string }
  >({
    mutationFn: ({ guardianId, studentId, schoolId, classSubjectId }) =>
      subscribeToOptionalSubjectApi({
        guardianId,
        studentId,
        schoolId,
        classSubjectId,
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.studentEnrolledClasses],
      })
      toast.success(
        variables.subjectName
          ? `Successfully subscribed to ${variables.subjectName}!`
          : "Successfully subscribed child to optional subject!"
      )
    },
    onError: (error) => {
      toast.error(error.message || "Unable to subscribe to this subject.")
    },
  })

  return { subscribeToOptionalSubjectAsync: mutateAsync, isPending }
}

export const useGetGuardianStudentResult = (
  params: GetGuardianStudentResultParamsI
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetGuardianStudentResultResponseI>({
      queryKey: [queryKeys.guardianStudentResult, params],
      queryFn: () => getGuardianStudentResultApi(params),
      enabled:
        !!params.guardianId &&
        !!params.schoolId &&
        !!params.studentId &&
        !!params.schoolSessionId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      // "Not published yet" (404 + a clear message) is a well-defined
      // outcome, not a transient failure — retrying it just repeats the
      // same response.
      retry: false,
    })

  return {
    result: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetGuardianStudentAttendance = (
  params: GetGuardianStudentAttendanceParamsI
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetGuardianStudentAttendanceResponseI>({
      // Student, class, session, term and date range all live in the key so
      // a stale filter combination's cached response can never be shown.
      queryKey: [queryKeys.guardianStudentAttendance, params],
      queryFn: () => getGuardianStudentAttendanceApi(params),
      enabled:
        !!params.studentId &&
        !!params.schoolId &&
        // Never fire with an invalid range — validated once here rather
        // than by every caller.
        !(
          params.startDate &&
          params.endDate &&
          params.startDate > params.endDate
        ),
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    })

  return {
    attendance: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

interface UseAdminResetGuardianPasswordOptions {
  onSuccess?: (data: AdminResetGuardianPasswordResponseI) => void
  onError?: (error: Error) => void
}

export const useAdminResetGuardianPassword = ({
  onSuccess,
  onError,
}: UseAdminResetGuardianPasswordOptions = {}) => {
  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      AdminResetGuardianPasswordResponseI,
      Error,
      AdminResetGuardianPasswordPayloadI
    >({
      mutationFn: adminResetGuardianPasswordApi,
      onSuccess: (data) => {
        toast.success("Guardian password reset successfully.")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to reset guardian password")
        onError?.(err)
      },
    })

  return {
    adminResetGuardianPassword: mutate,
    adminResetGuardianPasswordAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetGuardianDetails = (params: GetGuardianDetailsParamsI) => {
  const schoolId = useSchoolId()
  params = { ...params, schoolId: params.schoolId || schoolId || undefined }
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetGuardianDetailsResponseI>({
      queryKey: [queryKeys.guardianDetails, params],
      queryFn: () => getGuardianDetailsApi(params),
      enabled: !!params.guardianId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    guardian: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useLaunchSchoolPortal = (
  schoolId: string,
  guardianId?: string
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<LaunchSchoolPortalResponseI>({
      queryKey: [queryKeys.launchSchoolPortal, schoolId, guardianId],
      queryFn: () => getLaunchSchoolPortalApi({ schoolId, guardianId }),
      enabled: !!schoolId && !!guardianId,
      placeholderData: keepPreviousData,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    portal: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

// ─── Guardian ↔ Student ───────────────────────────────────────────────────────

interface UseAssignGuardiansToStudentOptions {
  onSuccess?: (data: AssignGuardiansToStudentResponseI) => void
  onError?: (error: Error) => void
}

export const useAssignGuardiansToStudent = ({
  onSuccess,
  onError,
}: UseAssignGuardiansToStudentOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      AssignGuardiansToStudentResponseI,
      Error,
      AssignGuardiansToStudentPayloadI
    >({
      mutationFn: assignGuardiansToStudentApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.schoolStudents] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.studentById] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.studentDetail] })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.studentDashboardOverview],
        })
        queryClient.invalidateQueries({ queryKey: [queryKeys.guardians] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.schoolParents] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.guardianDetails] })
        queryClient.invalidateQueries({ queryKey: ["parent-overview"] })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.guardianChildren],
        })
        toast.success("Guardian(s) assigned to student successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to assign guardian(s) to student")
        onError?.(err)
      },
    })

  return {
    assignGuardiansToStudent: mutate,
    assignGuardiansToStudentAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}
