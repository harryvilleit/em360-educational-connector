import { getErrorMessage } from "@/utils"
import {
  createJobRoleApi,
  createSubUserApi,
  deleteSingleJobRoleApi,
  deleteSubUserApi,
  getAllPaginatedJobRolesByIdApi,
  getAllSchoolJobRolesByIdApi,
  getMySubUsersApi,
  getSchoolModuleForSubUserApi,
  getRoleAccessApi,
  updateRoleAccessApi,
  backfillLegacyAccessApi,
  getSingleJobRoleByIdApi,
  getSubUserAccessApi,
  updateJobRoleApi,
  updateModulesApi,
  getSubUserAccessEditApi,
  updateSubUserAccessApi,
  deactivateSubUserApi,
  activateSubUserApi,
  getManagementDashboardApi,
  assignMultipleJobRolesApi,
  createSchoolSessionApi,
  updateSchoolSessionApi,
  deleteSchoolSessionApi,
  getAllSchoolSessionsApi,
  getSchoolSessionByIdApi,
  setCurrentSessionApi,
  setCurrentTermApi,
  createSchoolTermApi,
  updateSchoolTermApi,
  deleteSchoolTermApi,
  getAllSchoolTermsApi,
  getSchoolTermByIdApi,
  getManageTeachersApi,
  removeJobRolesApi,
  adminResetUserPasswordApi,
  resendRegistrationEmailApi,



} from "@/api/userMgt.api"
import type {
  GetRoleAccessResponseI,
  UpdateRoleAccessPayloadI,
  UpdateRoleAccessResponseI,
  BackfillLegacyAccessResponseI,
  CreateJobRoleI,
  CreateJobRoleResponseI,
  CreateSubUserPayloadI,
  CreateSubUserResponseI,
  DeleteSubUserPayloadI,
  GetAllJobRolesResponseI,
  GetMySubUsersParams,
  GetMySubUsersResponseI,
  GetPaginatedJobRolesParams,
  GetPaginatedJobRolesResponseI,
  GetSchoolModulesResponseI,
  GetSingleJobRoleResponseI,
  GetSubUserAccessParams,
  GetSubUserAccessResponseI,
  UpdateJobRoleI,
  UpdateModulesPayloadI,
  UpdateModulesResponseI,
  GetSubUserAccessEditParams,
  GetSubUserAccessEditResponseI,
  UpdateSubUserAccessPayloadI,
  UpdateSubUserAccessResponseI,
  ActivateDeactivatePayloadI,
  ActivateDeactivateResponseI,
  AdminResetUserPasswordPayloadI,
  AdminResetUserPasswordResponseI,
  ManagementDashboardParams,
  GetManagementDashboardResponseI,
  GetAllSchoolSessionsParams,
  GetAllSchoolSessionsResponseI,
  GetSchoolSessionByIdResponseI,
  SchoolSessionItem,
  SchoolSessionTermItem,
  CreateSchoolSessionPayloadI,
  UpdateSchoolSessionPayloadI,
  SetCurrentSessionPayloadI,
  SetCurrentTermPayloadI,
  CreateSchoolTermPayloadI,
  UpdateSchoolTermPayloadI,
  GetAllSchoolTermsParams,
  GetAllSchoolTermsResponseI,
  GetSchoolTermByIdResponseI,
  ManageTeachersParams,
  GetManageTeachersResponseI,
  RemoveJobRolesPayloadI,
  RemoveJobRolesResponseI,
  ResendRegistrationEmailPayloadI,
  ResendRegistrationEmailResponseI,
} from "@/api/userMgt.api/types"
import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/utils/queryKeys"
import { toast } from "sonner"
import { useCurrentAcademicStore } from "@/store/currentAcademic.store"

interface UseCreateJobRoleOptions {
  onSuccess?: (data: CreateJobRoleResponseI) => void
  onError?: (error: Error) => void
}

export const useCreateJobRole = ({
  onSuccess,
  onError,
}: UseCreateJobRoleOptions = {}) => {
  const queryClient = useQueryClient()

  const {
    mutate,
    mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    data,
    reset,
  } = useMutation<CreateJobRoleResponseI, Error, CreateJobRoleI>({
    mutationFn: createJobRoleApi,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.jobRoles] })
      toast.success(data?.Value)
      onSuccess?.(data)
    },
    onError,
  })

  return {
    createJobRole: mutate,
    createJobRoleAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    data,
    reset,
  }
}

export const useGetAllJobRolesById = (schoolId: string) => {
  const { data, isPending, isError, error, isLoading, isSuccess, refetch } =
    useQuery<GetAllJobRolesResponseI>({
      queryKey: [queryKeys.jobRoles, schoolId],
      queryFn: () => getAllSchoolJobRolesByIdApi(schoolId),
      enabled: !!schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })
  return {
    allJobRoles: data,
    isPending,
    isLoading,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useUpdateJobRole = ({
  onSuccess,
  onError,
}: UseCreateJobRoleOptions = {}) => {
  const queryClient = useQueryClient()

  const {
    mutate,
    mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    data,
    reset,
  } = useMutation<CreateJobRoleResponseI, Error, UpdateJobRoleI>({
    mutationFn: updateJobRoleApi,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.jobRoles] })
      onSuccess?.(data)
      toast.success(data?.Value)
    },
    onError,
  })

  return {
    updateJobRole: mutate,
    updateJobRoleAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    data,
    reset,
  }
}

export const useGetSingleJobRole = (id: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetSingleJobRoleResponseI>({
      queryKey: [queryKeys.jobRoles, id],
      queryFn: () => getSingleJobRoleByIdApi(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })
  return {
    jobRole: data?.Value,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetPaginatedJobRoles = (params: GetPaginatedJobRolesParams) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetPaginatedJobRolesResponseI>({
      queryKey: [queryKeys.jobRoles, "paginated", params],
      queryFn: () => getAllPaginatedJobRolesByIdApi(params),
      enabled: !!params.schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })
  return {
    paginatedJobRoles: data?.Value,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

interface UseDeleteJobRoleOptions {
  onSuccess?: (data: CreateJobRoleResponseI) => void
  onError?: (error: Error) => void
}

export const useDeleteJobRole = ({
  onSuccess,
  onError,
}: UseDeleteJobRoleOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<CreateJobRoleResponseI, Error, string>({
      mutationFn: deleteSingleJobRoleApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.jobRoles] })
        onSuccess?.(data)
        toast.success(data?.Value)
      },
      onError,
    })

  return {
    deleteJobRole: mutate,
    deleteJobRoleAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseCreateSubUserOptions {
  onSuccess?: (data: CreateSubUserResponseI) => void
  onError?: (error: Error) => void
}

export const useCreateSubUser = ({
  onSuccess,
  onError,
}: UseCreateSubUserOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<CreateSubUserResponseI, Error, CreateSubUserPayloadI>({
      mutationFn: createSubUserApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.mySubUsers] })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.managementDashboard],
        })
        toast.success(data?.message || "User created successfully")
        onSuccess?.(data)
      },
      onError,
    })

  return {
    createSubUser: mutate,
    createSubUserAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetSchoolModulesForSubUser = (schoolId: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetSchoolModulesResponseI>({
      queryKey: [queryKeys.schoolModules, schoolId],
      queryFn: () => getSchoolModuleForSubUserApi(schoolId),
      enabled: !!schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    schoolModules: data?.Value?.Modules ?? [],
    schoolData: data?.Value,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

interface UseDeleteSubUserOptions {
  onSuccess?: (data: CreateJobRoleResponseI) => void
  onError?: (error: Error) => void
}

export const useDeleteSubUser = ({
  onSuccess,
  onError,
}: UseDeleteSubUserOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<CreateJobRoleResponseI, Error, DeleteSubUserPayloadI>({
      mutationFn: deleteSubUserApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.mySubUsers] })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.managementDashboard],
        })
        toast.success(data?.Value)
        onSuccess?.(data)
      },
      onError,
    })

  return {
    deleteSubUser: mutate,
    deleteSubUserAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetSubUserAccess = (params: GetSubUserAccessParams) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetSubUserAccessResponseI>({
      queryKey: [queryKeys.subUserAccess, params],
      queryFn: () => getSubUserAccessApi(params),
      enabled: !!params.subUserId && !!params.productId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  const value = data?.Value
  return {
    subUserAccess: value?.moduleAccess ?? value?.ModuleAccess ?? [],
    email: value?.email || value?.Email || null,
    firstName: value?.firstName || value?.FirstName || "",
    lastName: value?.lastName || value?.LastName || "",
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetMySubUsers = (
  params: GetMySubUsersParams,
  enabled = true
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetMySubUsersResponseI>({
      queryKey: [queryKeys.mySubUsers, params],
      queryFn: () => getMySubUsersApi(params),
      enabled: enabled && !!params.schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    subUsers: data?.Value?.Items ?? [],
    pagination: data?.Value
      ? {
          totalItems: data.Value.TotalItems,
          pageNumber: data.Value.PageNumber,
          pageSize: data.Value.PageSize,
          totalPages: data.Value.TotalPages,
        }
      : null,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

interface UseUpdateModulesOptions {
  onSuccess?: (data: UpdateModulesResponseI) => void
  onError?: (error: Error) => void
}

export const useUpdateModules = ({
  onSuccess,
  onError,
}: UseUpdateModulesOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<UpdateModulesResponseI, Error, UpdateModulesPayloadI>({
      mutationFn: updateModulesApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.mySubUsers] })
        toast.success("Modules updated successfully")
        onSuccess?.(data)
      },
      onError,
    })

  return {
    updateModules: mutate,
    updateModulesAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetSubUserAccessEdit = (params: GetSubUserAccessEditParams) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetSubUserAccessEditResponseI>({
      queryKey: [queryKeys.subUserAccess, "edit", params],
      queryFn: () => getSubUserAccessEditApi(params),
      enabled: !!params.subUserId && !!params.schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    subUserAccessEdit: data?.Value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

interface UseUpdateSubUserAccessOptions {
  onSuccess?: (data: UpdateSubUserAccessResponseI) => void
  onError?: (error: Error) => void
}

export const useUpdateSubUserAccess = ({
  onSuccess,
  onError,
}: UseUpdateSubUserAccessOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      UpdateSubUserAccessResponseI,
      Error,
      UpdateSubUserAccessPayloadI
    >({
      mutationFn: updateSubUserAccessApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.mySubUsers] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.subUserAccess] })
        toast.success("Sub-user access updated successfully")
        onSuccess?.(data)
      },
      onError,
    })

  return {
    updateSubUserAccess: mutate,
    updateSubUserAccessAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseDeactivateSubUserOptions {
  onSuccess?: (data: ActivateDeactivateResponseI) => void
  onError?: (error: Error) => void
}

export const useDeactivateSubUser = ({
  onSuccess,
  onError,
}: UseDeactivateSubUserOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<ActivateDeactivateResponseI, Error, ActivateDeactivatePayloadI>(
      {
        mutationFn: deactivateSubUserApi,
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: [queryKeys.mySubUsers] })
          queryClient.invalidateQueries({
            queryKey: [queryKeys.managementDashboard],
          })
          toast.success("Sub-user deactivated successfully")
          onSuccess?.(data)
        },
        onError,
      }
    )

  return {
    deactivateSubUser: mutate,
    deactivateSubUserAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseActivateSubUserOptions {
  onSuccess?: (data: ActivateDeactivateResponseI) => void
  onError?: (error: Error) => void
}

export const useActivateSubUser = ({
  onSuccess,
  onError,
}: UseActivateSubUserOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<ActivateDeactivateResponseI, Error, ActivateDeactivatePayloadI>(
      {
        mutationFn: activateSubUserApi,
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: [queryKeys.mySubUsers] })
          queryClient.invalidateQueries({
            queryKey: [queryKeys.managementDashboard],
          })
          toast.success("Sub-user activated successfully")
          onSuccess?.(data)
        },
        onError,
      }
    )

  return {
    activateSubUser: mutate,
    activateSubUserAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseResendRegistrationEmailOptions {
  onSuccess?: (data: ResendRegistrationEmailResponseI) => void
  onError?: (error: Error) => void
}

export const useResendRegistrationEmail = ({
  onSuccess,
  onError,
}: UseResendRegistrationEmailOptions = {}) => {
  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      ResendRegistrationEmailResponseI,
      Error,
      ResendRegistrationEmailPayloadI
    >({
      mutationFn: resendRegistrationEmailApi,
      onSuccess: (data) => {
        toast.success(data.message || "Registration email queued successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err.message || "Failed to resend registration email")
        onError?.(err)
      },
    })

  return {
    resendRegistrationEmail: mutate,
    resendRegistrationEmailAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseAdminResetUserPasswordOptions {
  onSuccess?: (data: AdminResetUserPasswordResponseI) => void
  onError?: (error: Error) => void
}

export const useAdminResetUserPassword = ({
  onSuccess,
  onError,
}: UseAdminResetUserPasswordOptions = {}) => {
  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<AdminResetUserPasswordResponseI, Error, AdminResetUserPasswordPayloadI>({
      mutationFn: adminResetUserPasswordApi,
      onSuccess: (data) => {
        toast.success("Password reset — the new password has been emailed to the user")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to reset password")
        onError?.(err)
      },
    })

  return {
    adminResetUserPassword: mutate,
    adminResetUserPasswordAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetManagementDashboard = (
  params: ManagementDashboardParams
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetManagementDashboardResponseI>({
      queryKey: [queryKeys.managementDashboard, params],
      queryFn: () => getManagementDashboardApi(params),
      enabled: !!params.schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    dashboardData: data?.Value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useAssignMultipleRoles = () => {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useMutation({
    mutationFn: assignMultipleJobRolesApi,
    onSuccess: (data) => {
      if (!data?.IsSuccess) {
        toast.error(data?.Error ?? "Failed to assign roles")
        return
      }
      queryClient.invalidateQueries({ queryKey: [queryKeys.mySubUsers] })
    },
    onError: () => {
      toast.error("An unexpected error occurred")
    },
  })
  return { assignMultipleRolesAsync: mutateAsync, isLoading: isPending }
}

export const useGetAllSchoolSessions = (params: GetAllSchoolSessionsParams) => {
  const { data, isPending, isError, error, isLoading, isSuccess, refetch } =
    useQuery<GetAllSchoolSessionsResponseI>({
      queryKey: [queryKeys.schoolSessions, params],
      queryFn: () => getAllSchoolSessionsApi(params),
      enabled: !!params.schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })
  return {
    sessions: data?.Value?.Items ?? [],
    pagination: data?.Value,
    isPending,
    isLoading,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetSchoolSessionById = (id: string) => {
  const { data, isPending, isError, error, isLoading, isSuccess, refetch } =
    useQuery<GetSchoolSessionByIdResponseI>({
      queryKey: [queryKeys.schoolSessionById, id],
      queryFn: () => getSchoolSessionByIdApi(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })
  return {
    session: data?.Value,
    isPending,
    isLoading,
    isError,
    error,
    isSuccess,
    refetch,
  }
}


async function refetchAndPreserveCurrentState(queryClient: QueryClient) {
  // Snapshot the current session / term IDs before the refetch
  const cached = queryClient.getQueriesData<GetAllSchoolSessionsResponseI>(
    { queryKey: [queryKeys.schoolSessions], exact: false }
  )
  const allCachedSessions = cached.flatMap(
    ([, d]: [unknown, GetAllSchoolSessionsResponseI | undefined]) =>
      d?.Value?.Items ?? []
  )
  const currentSessionId = allCachedSessions.find(
    (s: SchoolSessionItem) => s.IsCurrent || s.Status === "Active"
  )?.Id
  const currentTermId = allCachedSessions
    .flatMap((s: SchoolSessionItem) => s.Terms)
    .find((t: SchoolSessionTermItem) => t.IsCurrent)?.Id

  // Pull fresh data from the server (new/deleted sessions will appear here)
  await queryClient.refetchQueries({
    queryKey: [queryKeys.schoolSessions],
    exact: false,
  })

  queryClient.setQueriesData<GetAllSchoolSessionsResponseI>(
    { queryKey: [queryKeys.schoolSessions], exact: false },
    (old) => {
      if (!old?.Value?.Items) return old
      return {
        ...old,
        Value: {
          ...old.Value,
          Items: old.Value.Items.map((s) => ({
            ...s,
            IsCurrent: currentSessionId ? s.Id === currentSessionId : s.IsCurrent,
            Status: currentSessionId
              ? s.Id === currentSessionId ? "Active" : undefined
              : s.Status,
            Terms: s.Terms.map((t) => ({
              ...t,
              IsCurrent: currentTermId ? t.Id === currentTermId : t.IsCurrent,
            })),
          })),
        },
      }
    }
  )
}

export const useCreateSchoolSession = () => {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: CreateSchoolSessionPayloadI) =>
      createSchoolSessionApi(payload),
    onSuccess: async (data) => {
      if (!data?.IsSuccess) {
        toast.error(data?.Error ?? "Failed to create session")
        return
      }
      await refetchAndPreserveCurrentState(queryClient)
      toast.success("Session created successfully")
    },
    onError: (err) => toast.error(getErrorMessage(err, "An unexpected error occurred")),
  })
  return { createSchoolSessionAsync: mutateAsync, isLoading: isPending }
}

export const useUpdateSchoolSession = () => {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: UpdateSchoolSessionPayloadI) =>
      updateSchoolSessionApi(payload),
    onSuccess: async (data) => {
      if (!data?.IsSuccess) {
        toast.error(data?.Error ?? "Failed to update session")
        return
      }
      await refetchAndPreserveCurrentState(queryClient)
      queryClient.invalidateQueries({ queryKey: [queryKeys.schoolSessionById] })
      toast.success("Session updated successfully")
    },
    onError: (err) => toast.error(getErrorMessage(err, "An unexpected error occurred")),
  })
  return { updateSchoolSessionAsync: mutateAsync, isLoading: isPending }
}

export const useDeleteSchoolSession = () => {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (id: string) => deleteSchoolSessionApi(id),
    onSuccess: async (data) => {
      if (!data?.IsSuccess) {
        toast.error(data?.Error ?? "Failed to delete session")
        return
      }
      await refetchAndPreserveCurrentState(queryClient)
      toast.success("Session deleted successfully")
    },
    onError: (err) => toast.error(getErrorMessage(err, "An unexpected error occurred")),
  })
  return { deleteSchoolSessionAsync: mutateAsync, isLoading: isPending }
}

export const useSetCurrentSchoolSession = () => {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: SetCurrentSessionPayloadI) =>
      setCurrentSessionApi(payload),
    onSuccess: (data, variables) => {
      if (!data?.IsSuccess) {
        toast.error(data?.Error ?? "Failed to set current session")
        return
      }

      // Persist to Zustand — this survives every cache refetch
      useCurrentAcademicStore.getState().setCurrentSessionId(
        variables.schoolSessionId
      )

      // Also stamp the React Query cache so components re-render immediately
      queryClient.setQueriesData<GetAllSchoolSessionsResponseI>(
        { queryKey: [queryKeys.schoolSessions], exact: false },
        (old) => {
          if (!old?.Value?.Items) return old
          return {
            ...old,
            Value: {
              ...old.Value,
              Items: old.Value.Items.map((s) => ({
                ...s,
                IsCurrent: s.Id === variables.schoolSessionId,
                Status: s.Id === variables.schoolSessionId ? "Active" : undefined,
              })),
            },
          }
        }
      )

      toast.success("Current session updated")
    },
    onError: (err) => toast.error(getErrorMessage(err, "An unexpected error occurred")),
  })
  return { setCurrentSchoolSessionAsync: mutateAsync, isLoading: isPending }
}

export const useSetCurrentSchoolTerm = () => {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: SetCurrentTermPayloadI) => setCurrentTermApi(payload),
    onSuccess: (data, variables) => {
      if (!data?.IsSuccess) {
        toast.error(data?.Error ?? "Failed to set current term")
        return
      }

      // Persist to Zustand
      useCurrentAcademicStore.getState().setCurrentTermId(
        variables.schoolSessionTermId
      )

      // Also stamp the React Query cache for immediate UI feedback
      const updateTerms = (terms: SchoolSessionTermItem[]) =>
        terms.map((t) => ({
          ...t,
          IsCurrent: t.Id === variables.schoolSessionTermId,
        }))

      queryClient.setQueriesData<GetAllSchoolSessionsResponseI>(
        { queryKey: [queryKeys.schoolSessions], exact: false },
        (old) => {
          if (!old?.Value?.Items) return old
          return {
            ...old,
            Value: {
              ...old.Value,
              Items: old.Value.Items.map((s) => ({
                ...s,
                Terms: updateTerms(s.Terms),
              })),
            },
          }
        }
      )

      // Also update the single-session cache used by the detail page.
      queryClient.setQueriesData<GetSchoolSessionByIdResponseI>(
        { queryKey: [queryKeys.schoolSessionById], exact: false },
        (old) => {
          if (!old?.Value) return old
          return {
            ...old,
            Value: {
              ...old.Value,
              Terms: updateTerms(old.Value.Terms),
            },
          }
        }
      )

      toast.success("Current term updated")
    },
    onError: (err) => toast.error(getErrorMessage(err, "An unexpected error occurred")),
  })
  return { setCurrentSchoolTermAsync: mutateAsync, isLoading: isPending }
}

export const useGetAllSchoolTerms = (params: GetAllSchoolTermsParams) => {
  const { data, isPending, isError, error, isLoading, isSuccess, refetch } =
    useQuery<GetAllSchoolTermsResponseI>({
      queryKey: [queryKeys.schoolTerms, params],
      queryFn: () => getAllSchoolTermsApi(params),
      enabled: !!params.schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })
  return {
    terms: data?.Value?.Items ?? [],
    pagination: data?.Value,
    isPending,
    isLoading,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetSchoolTermById = (id: string) => {
  const { data, isPending, isError, error, isLoading, isSuccess, refetch } =
    useQuery<GetSchoolTermByIdResponseI>({
      queryKey: [queryKeys.schoolTermById, id],
      queryFn: () => getSchoolTermByIdApi(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })
  return {
    term: data?.Value,
    isPending,
    isLoading,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useCreateSchoolTerm = () => {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: CreateSchoolTermPayloadI) => createSchoolTermApi(payload),
    onSuccess: (data) => {
      if (!data?.IsSuccess) {
        toast.error(data?.Error ?? "Failed to create term")
        return
      }
      queryClient.invalidateQueries({ queryKey: [queryKeys.schoolTerms] })
      toast.success("Term created successfully")
    },
    onError: (err) => toast.error(getErrorMessage(err, "An unexpected error occurred")),
  })
  return { createSchoolTermAsync: mutateAsync, isLoading: isPending }
}

export const useUpdateSchoolTerm = () => {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: UpdateSchoolTermPayloadI) => updateSchoolTermApi(payload),
    onSuccess: (data) => {
      if (!data?.IsSuccess) {
        toast.error(data?.Error ?? "Failed to update term")
        return
      }
      queryClient.invalidateQueries({ queryKey: [queryKeys.schoolTerms] })
      queryClient.invalidateQueries({ queryKey: [queryKeys.schoolTermById] })
      queryClient.invalidateQueries({ queryKey: [queryKeys.schoolSessions] })
      toast.success("Term updated successfully")
    },
    onError: (err) => toast.error(getErrorMessage(err, "An unexpected error occurred")),
  })
  return { updateSchoolTermAsync: mutateAsync, isLoading: isPending }
}

export const useDeleteSchoolTerm = () => {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (id: string) => deleteSchoolTermApi(id),
    onSuccess: (data) => {
      if (!data?.IsSuccess) {
        toast.error(data?.Error ?? "Failed to delete term")
        return
      }
      queryClient.invalidateQueries({ queryKey: [queryKeys.schoolTerms] })
      toast.success("Term deleted successfully")
    },
    onError: (err) => toast.error(getErrorMessage(err, "An unexpected error occurred")),
  })
  return { deleteSchoolTermAsync: mutateAsync, isLoading: isPending }
}

// ─── ManageTeachers ───────────────────────────────────────────────────────────

export const useGetManageTeachers = (params: ManageTeachersParams) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetManageTeachersResponseI>({
      queryKey: [queryKeys.mySubUsers, "teachers", params],
      queryFn: () => getManageTeachersApi(params),
      enabled: !!params.schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    teachers: data?.value?.items ?? [],
    pagination: data?.value
      ? {
          totalItems: data.value.totalItems,
          pageNumber: data.value.pageNumber,
          pageSize: data.value.pageSize,
          totalPages: data.value.totalPages,
        }
      : null,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

// ─── RemoveJobRoles ───────────────────────────────────────────────────────────

export const useRemoveJobRoles = () => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<RemoveJobRolesResponseI, Error, RemoveJobRolesPayloadI>({
      mutationFn: removeJobRolesApi,
      onSuccess: (data) => {
        if (!data?.IsSuccess) {
          toast.error(data?.Error ?? "Failed to remove job roles")
          return
        }
        queryClient.invalidateQueries({ queryKey: [queryKeys.mySubUsers] })
        toast.success("Job roles removed successfully")
      },
      onError: (err) => toast.error(getErrorMessage(err, "An unexpected error occurred")),
    })

  return {
    removeJobRoles: mutate,
    removeJobRolesAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}


export const useGetRoleAccess = (params: {
  schoolJobRoleId: string
  schoolId: string
}) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetRoleAccessResponseI>({
      queryKey: [queryKeys.roleAccess, params.schoolJobRoleId, params.schoolId],
      queryFn: () => getRoleAccessApi(params.schoolJobRoleId, params.schoolId),
      enabled: !!params.schoolJobRoleId && !!params.schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    roleAccess: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useUpdateRoleAccess = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: UpdateRoleAccessResponseI) => void
  onError?: (error: Error) => void
} = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<UpdateRoleAccessResponseI, Error, UpdateRoleAccessPayloadI>({
      mutationFn: updateRoleAccessApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.roleAccess] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.userDashboard] })
        toast.success("Role access updated successfully")
        onSuccess?.(data)
      },
      onError,
    })

  return {
    updateRoleAccess: mutate,
    updateRoleAccessAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useBackfillLegacyAccess = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: BackfillLegacyAccessResponseI) => void
  onError?: (error: Error) => void
} = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<BackfillLegacyAccessResponseI, Error, string>({
      mutationFn: backfillLegacyAccessApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.roleAccess] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.mySubUsers] })
        const v = data?.Value
        toast.success(
          v
            ? `Backfill complete: ${v.SubUsersBackfilled} migrated, ${v.SkippedAlreadyHasRole} already had roles`
            : "Legacy access backfill complete"
        )
        onSuccess?.(data)
      },
      onError,
    })

  return {
    backfillLegacyAccess: mutate,
    backfillLegacyAccessAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}
