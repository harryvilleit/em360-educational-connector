import {
  getSystemJobRolesApi,
  createJobRoleApi,
  updateJobRoleApi,
  deleteJobRoleApi,
  getJobRolesBySchoolApi,
  getJobRolesBySchoolPaginatedApi,
  getJobRoleByIdApi,
} from "@/api/jobRoles.api"
import type {
  CreateJobRolePayloadI,
  CreateJobRoleResponseI,
  UpdateJobRolePayloadI,
  UpdateJobRoleResponseI,
  DeleteJobRoleResponseI,
  GetSystemJobRolesResponseI,
  GetBySchoolResponseI,
  GetBySchoolPaginatedParams,
  GetBySchoolPaginatedResponseI,
  GetByIdResponseI,
} from "@/api/jobRoles.api/types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/utils/queryKeys"
import { toast } from "sonner"

export const useGetSystemJobRoles = () => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetSystemJobRolesResponseI>({
      queryKey: [queryKeys.jobRoles, "system"],
      queryFn: getSystemJobRolesApi,
      staleTime: 10 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
    })

  return {
    systemJobRoles: data?.Value ?? [],
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

interface UseCreateJobRoleOptions {
  onSuccess?: (data: CreateJobRoleResponseI) => void
  onError?: (error: Error) => void
}

export const useCreateJobRole = ({
  onSuccess,
  onError,
}: UseCreateJobRoleOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<CreateJobRoleResponseI, Error, CreateJobRolePayloadI>({
      mutationFn: createJobRoleApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.jobRoles] })
        toast.success("Job role created successfully")
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
    reset,
  }
}

interface UseUpdateJobRoleOptions {
  onSuccess?: (data: UpdateJobRoleResponseI) => void
  onError?: (error: Error) => void
}

export const useUpdateJobRole = ({
  onSuccess,
  onError,
}: UseUpdateJobRoleOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<UpdateJobRoleResponseI, Error, UpdateJobRolePayloadI>({
      mutationFn: updateJobRoleApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.jobRoles] })
        toast.success("Job role updated successfully")
        onSuccess?.(data)
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
    reset,
  }
}

interface UseDeleteJobRoleOptions {
  onSuccess?: (data: DeleteJobRoleResponseI) => void
  onError?: (error: Error) => void
}

export const useDeleteJobRole = ({
  onSuccess,
  onError,
}: UseDeleteJobRoleOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<DeleteJobRoleResponseI, Error, string>({
      mutationFn: deleteJobRoleApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.jobRoles] })
        toast.success("Job role deleted successfully")
        onSuccess?.(data)
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

export const useGetJobRolesBySchool = (schoolId: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetBySchoolResponseI>({
      queryKey: [queryKeys.jobRoles, schoolId],
      queryFn: () => getJobRolesBySchoolApi(schoolId),
      enabled: !!schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    jobRoles: data?.Value ?? [],
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetJobRolesBySchoolPaginated = (
  params: GetBySchoolPaginatedParams
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetBySchoolPaginatedResponseI>({
      queryKey: [queryKeys.jobRoles, "paginated", params],
      queryFn: () => getJobRolesBySchoolPaginatedApi(params),
      enabled: !!params.schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    paginatedJobRoles: data?.Value,
    jobRoles: data?.Value?.Items ?? [],
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetJobRoleById = (id: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetByIdResponseI>({
      queryKey: [queryKeys.jobRoles, id],
      queryFn: () => getJobRoleByIdApi(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    jobRole: data?.Value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}
