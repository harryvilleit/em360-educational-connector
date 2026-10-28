import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { queryKeys } from "@/utils/queryKeys"
import {
  createCalendarEventApi,
  updateCalendarEventApi,
  deleteCalendarEventApi,
  getCalendarEventsApi,
} from "@/api/calendar.api"
import type {
  CreateCalendarEventPayloadI,
  CreateCalendarEventResponseI,
  UpdateCalendarEventPayloadI,
  UpdateCalendarEventResponseI,
  DeleteCalendarEventResponseI,
  GetCalendarEventsParamsI,
  GetCalendarEventsResponseI,
} from "@/api/calendar.api/types"

interface UseCreateCalendarEventOptions {
  onSuccess?: (data: CreateCalendarEventResponseI) => void
  onError?: (error: Error) => void
}

export const useCreateCalendarEvent = ({
  onSuccess,
  onError,
}: UseCreateCalendarEventOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      CreateCalendarEventResponseI,
      Error,
      CreateCalendarEventPayloadI
    >({
      mutationFn: createCalendarEventApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.calendarEvents],
        })
        toast.success("Event created successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to create event")
        onError?.(err)
      },
    })

  return {
    createCalendarEvent: mutate,
    createCalendarEventAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseUpdateCalendarEventOptions {
  onSuccess?: (data: UpdateCalendarEventResponseI) => void
  onError?: (error: Error) => void
}

export const useUpdateCalendarEvent = ({
  onSuccess,
  onError,
}: UseUpdateCalendarEventOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      UpdateCalendarEventResponseI,
      Error,
      UpdateCalendarEventPayloadI
    >({
      mutationFn: updateCalendarEventApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.calendarEvents],
        })
        toast.success("Event updated successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to update event")
        onError?.(err)
      },
    })

  return {
    updateCalendarEvent: mutate,
    updateCalendarEventAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseDeleteCalendarEventOptions {
  onSuccess?: (data: DeleteCalendarEventResponseI) => void
  onError?: (error: Error) => void
}

export const useDeleteCalendarEvent = ({
  onSuccess,
  onError,
}: UseDeleteCalendarEventOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<DeleteCalendarEventResponseI, Error, string>({
      mutationFn: deleteCalendarEventApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.calendarEvents],
        })
        toast.success("Event deleted successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to delete event")
        onError?.(err)
      },
    })

  return {
    deleteCalendarEvent: mutate,
    deleteCalendarEventAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetCalendarEvents = (params: GetCalendarEventsParamsI) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetCalendarEventsResponseI>({
      queryKey: [queryKeys.calendarEvents, params],
      queryFn: () => getCalendarEventsApi(params),
      enabled: !!params.schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    events: data?.value ?? [],
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}
