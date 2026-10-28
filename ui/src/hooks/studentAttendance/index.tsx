import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { queryKeys } from "@/utils/queryKeys"
import {
  getAttendanceDashboardApi,
  getClassAttendanceRosterApi,
  saveStudentAttendanceApi,
  getStudentAttendanceHistoryApi,
} from "@/api/studentAttendance.api"
import type {
  GetAttendanceDashboardParamsI,
  GetAttendanceDashboardResponseI,
  GetClassAttendanceRosterParamsI,
  GetClassAttendanceRosterResponseI,
  SaveStudentAttendancePayloadI,
  SaveStudentAttendanceResponseI,
  GetStudentAttendanceHistoryParamsI,
  GetStudentAttendanceHistoryResponseI,
} from "@/api/studentAttendance.api/types"

export const useGetAttendanceDashboard = (
  params: GetAttendanceDashboardParamsI
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetAttendanceDashboardResponseI>({
      // Session/Term are part of the key so a cached Term 1 dashboard can
      // never be shown while Term 2 is selected.
      queryKey: [
        queryKeys.studentAttendanceDashboard,
        params.schoolId,
        params.attendanceDate,
        params.schoolSessionId,
        params.schoolSessionTermId,
      ],
      queryFn: () => getAttendanceDashboardApi(params),
      enabled: !!params.schoolId && !!params.attendanceDate,
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    })

  return {
    dashboard: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetClassAttendanceRoster = (
  params: GetClassAttendanceRosterParamsI
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetClassAttendanceRosterResponseI>({
      queryKey: [
        queryKeys.studentAttendanceRoster,
        params.schoolId,
        params.schoolClassId,
        params.attendanceDate,
        params.schoolSessionId,
        params.schoolSessionTermId,
      ],
      queryFn: () => getClassAttendanceRosterApi(params),
      enabled: !!params.schoolClassId && !!params.schoolId && !!params.attendanceDate,
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
    })

  return {
    roster: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetStudentAttendanceHistory = (
  params: GetStudentAttendanceHistoryParamsI
) => {
  const query = useQuery<GetStudentAttendanceHistoryResponseI>({
    queryKey: [queryKeys.studentAttendanceRoster, "history", params],
    queryFn: () => getStudentAttendanceHistoryApi(params),
    enabled: !!params.studentId && !!params.schoolId,
    staleTime: 30_000,
  })
  return {
    history: query.data?.value,
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
  }
}

interface UseSaveStudentAttendanceOptions {
  onSuccess?: (data: SaveStudentAttendanceResponseI) => void
  onError?: (error: Error) => void
}

export const useSaveStudentAttendance = ({
  onSuccess,
  onError,
}: UseSaveStudentAttendanceOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<SaveStudentAttendanceResponseI, Error, SaveStudentAttendancePayloadI>({
      mutationFn: saveStudentAttendanceApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.studentAttendanceDashboard],
        })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.studentAttendanceRoster],
        })
        toast.success(data.message || "Attendance saved successfully.")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to save attendance")
        onError?.(err)
      },
    })

  return {
    saveAttendance: mutate,
    saveAttendanceAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}
