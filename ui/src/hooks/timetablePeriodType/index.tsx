import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { queryKeys } from "@/utils/queryKeys"
import {
  createPeriodTypeApi,
  getPeriodTypesBySchoolApi,
  updatePeriodTypeApi,
  togglePeriodTypeStatusApi,
  deletePeriodTypeApi,
} from "@/api/timetablePeriodType.api"
import type {
  CreatePeriodTypePayloadI,
  CreatePeriodTypeResponseI,
  GetPeriodTypesBySchoolParamsI,
  UpdatePeriodTypePayloadI,
  UpdatePeriodTypeResponseI,
  PeriodTypeIdPayloadI,
  TogglePeriodTypeStatusResponseI,
  DeletePeriodTypeResponseI,
} from "@/api/timetablePeriodType.api/types"

function invalidatePeriodTypes(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: [queryKeys.timetablePeriodTypes] })
}

export const useGetPeriodTypesBySchool = (
  params: GetPeriodTypesBySchoolParamsI
) => {
  const { data, isPending, isError, error, isSuccess, refetch } = useQuery({
    queryKey: [queryKeys.timetablePeriodTypes, params],
    queryFn: () => getPeriodTypesBySchoolApi(params),
    enabled: !!params.schoolId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  return {
    periodTypes: data?.value?.items ?? [],
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

interface UseCreatePeriodTypeOptions {
  onSuccess?: (data: CreatePeriodTypeResponseI) => void
  onError?: (error: Error) => void
}

export const useCreatePeriodType = ({
  onSuccess,
  onError,
}: UseCreatePeriodTypeOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<CreatePeriodTypeResponseI, Error, CreatePeriodTypePayloadI>({
      mutationFn: createPeriodTypeApi,
      onSuccess: (data) => {
        invalidatePeriodTypes(queryClient)
        toast.success("Period type created successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to create period type")
        onError?.(err)
      },
    })

  return {
    createPeriodType: mutate,
    createPeriodTypeAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseUpdatePeriodTypeOptions {
  onSuccess?: (data: UpdatePeriodTypeResponseI) => void
  onError?: (error: Error) => void
}

export const useUpdatePeriodType = ({
  onSuccess,
  onError,
}: UseUpdatePeriodTypeOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<UpdatePeriodTypeResponseI, Error, UpdatePeriodTypePayloadI>({
      mutationFn: updatePeriodTypeApi,
      onSuccess: (data) => {
        invalidatePeriodTypes(queryClient)
        toast.success("Period type updated successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to update period type")
        onError?.(err)
      },
    })

  return {
    updatePeriodType: mutate,
    updatePeriodTypeAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseTogglePeriodTypeStatusOptions {
  onSuccess?: (data: TogglePeriodTypeStatusResponseI) => void
  onError?: (error: Error) => void
}

export const useTogglePeriodTypeStatus = ({
  onSuccess,
  onError,
}: UseTogglePeriodTypeStatusOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<TogglePeriodTypeStatusResponseI, Error, PeriodTypeIdPayloadI>({
      mutationFn: togglePeriodTypeStatusApi,
      onSuccess: (data) => {
        invalidatePeriodTypes(queryClient)
        toast.success("Period type status updated")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to update status")
        onError?.(err)
      },
    })

  return {
    togglePeriodTypeStatus: mutate,
    togglePeriodTypeStatusAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseDeletePeriodTypeOptions {
  onSuccess?: (data: DeletePeriodTypeResponseI) => void
  onError?: (error: Error) => void
}

export const useDeletePeriodType = ({
  onSuccess,
  onError,
}: UseDeletePeriodTypeOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<DeletePeriodTypeResponseI, Error, PeriodTypeIdPayloadI>({
      mutationFn: deletePeriodTypeApi,
      onSuccess: (data) => {
        invalidatePeriodTypes(queryClient)
        toast.success("Period type deleted successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to delete period type")
        onError?.(err)
      },
    })

  return {
    deletePeriodType: mutate,
    deletePeriodTypeAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}
