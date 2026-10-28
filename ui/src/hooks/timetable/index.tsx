import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { queryKeys } from "@/utils/queryKeys"
import {
  createTimetableApi,
  updateTimetableSlotApi,
  deleteTimetableSlotApi,
  getTimetableByWeekApi,
  getAllTimetablesApi,
  getTimetableOverviewApi,
} from "@/api/timetable.api"
import type {
  CreateTimetablePayloadI,
  CreateTimetableResponseI,
  UpdateTimetableSlotPayloadI,
  UpdateTimetableSlotResponseI,
  DeleteTimetableSlotResponseI,
  GetTimetableByWeekParamsI,
  GetAllTimetablesParamsI,
  GetTimetableOverviewParamsI,
  GetTimetableOverviewResponseI,
} from "@/api/timetable.api/types"

function invalidateTimetableQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: [queryKeys.timetable] })
  queryClient.invalidateQueries({ queryKey: [queryKeys.timetableOverview] })
}

interface UseCreateTimetableOptions {
  onSuccess?: (data: CreateTimetableResponseI) => void
  onError?: (error: Error) => void
  silentError?: boolean
}

export const useCreateTimetable = ({
  onSuccess,
  onError,
  silentError,
}: UseCreateTimetableOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<CreateTimetableResponseI, Error, CreateTimetablePayloadI>({
      mutationFn: createTimetableApi,
      onSuccess: (data) => {
        invalidateTimetableQueries(queryClient)
        toast.success("Timetable saved successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        if (!silentError) toast.error(err?.message ?? "Failed to save timetable")
        onError?.(err)
      },
    })

  return {
    createTimetable: mutate,
    createTimetableAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetTimetableByWeek = (
  params: GetTimetableByWeekParamsI,
  options?: { enabled?: boolean }
) => {
  const { data, isPending, isFetching, isError, error, isSuccess, refetch } =
    useQuery({
      queryKey: [queryKeys.timetable, "by-week", params],
      queryFn: () => getTimetableByWeekApi(params),
      enabled: !!params.schoolId && (options?.enabled ?? true),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    timetable: data?.value,
    isLoading: isPending && isFetching,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetAllTimetables = (
  params: GetAllTimetablesParamsI,
  options?: { enabled?: boolean }
) => {
  const { data, isPending, isFetching, isError, error, isSuccess, refetch } =
    useQuery({
      queryKey: [queryKeys.timetable, "all", params],
      queryFn: () => getAllTimetablesApi(params),
      enabled: !!params.schoolId && (options?.enabled ?? true),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    slots: data?.value?.items ?? [],
    pagination: data?.value
      ? {
          totalItems: data.value.totalItems,
          pageNumber: data.value.pageNumber,
          pageSize: data.value.pageSize,
          totalPages: data.value.totalPages,
        }
      : null,
    isLoading: isPending && isFetching,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

interface UseUpdateTimetableSlotOptions {
  onSuccess?: (data: UpdateTimetableSlotResponseI) => void
  onError?: (error: Error) => void
}

export const useUpdateTimetableSlot = ({
  onSuccess,
  onError,
}: UseUpdateTimetableSlotOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      UpdateTimetableSlotResponseI,
      Error,
      UpdateTimetableSlotPayloadI
    >({
      mutationFn: updateTimetableSlotApi,
      onSuccess: (data) => {
        invalidateTimetableQueries(queryClient)
        toast.success("Slot updated successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to update slot")
        onError?.(err)
      },
    })

  return {
    updateTimetableSlot: mutate,
    updateTimetableSlotAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseDeleteTimetableSlotOptions {
  onSuccess?: (data: DeleteTimetableSlotResponseI) => void
  onError?: (error: Error) => void
}

export const useDeleteTimetableSlot = ({
  onSuccess,
  onError,
}: UseDeleteTimetableSlotOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<DeleteTimetableSlotResponseI, Error, string>({
      mutationFn: deleteTimetableSlotApi,
      onSuccess: (data) => {
        invalidateTimetableQueries(queryClient)
        toast.success("Slot deleted successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to delete slot")
        onError?.(err)
      },
    })

  return {
    deleteTimetableSlot: mutate,
    deleteTimetableSlotAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetTimetableOverview = (params: GetTimetableOverviewParamsI) => {
  const { data, isPending, isFetching, isError, error, isSuccess, refetch } =
    useQuery<GetTimetableOverviewResponseI>({
      queryKey: [queryKeys.timetableOverview, params],
      queryFn: () => getTimetableOverviewApi(params),
      enabled: !!params.schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    overview: data?.value,
    isLoading: isPending && isFetching,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}
