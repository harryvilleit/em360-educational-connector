import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/utils/queryKeys"
import {
  getStaffDirectoryApi,
  getStaffDetailsApi,
  getStaffAssignedClassesApi,
  getStaffAssignedSubjectsApi,
  getStaffTimetableApi,
} from "@/api/staff.api"
import type {
  GetStaffDirectoryParamsI,
  GetStaffDirectoryResponseI,
  GetStaffDetailsParamsI,
  GetStaffDetailsResponseI,
  GetStaffAssignedClassesParamsI,
  GetStaffAssignedClassesResponseI,
  GetStaffAssignedSubjectsParamsI,
  GetStaffAssignedSubjectsResponseI,
  GetStaffTimetableParamsI,
  GetStaffTimetableResponseI,
} from "@/api/staff.api/types"

export const useStaffDirectory = (params: GetStaffDirectoryParamsI) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetStaffDirectoryResponseI>({
      queryKey: [queryKeys.staffDirectory, params],
      queryFn: () => getStaffDirectoryApi(params),
      enabled: !!params.schoolId,
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    directory: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useStaffDetails = (params: GetStaffDetailsParamsI) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetStaffDetailsResponseI>({
      queryKey: [queryKeys.staffDetails, params],
      queryFn: () => getStaffDetailsApi(params),
      enabled: !!params.subUserId && !!params.schoolId,
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    details: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useStaffAssignedClasses = (
  params: GetStaffAssignedClassesParamsI
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetStaffAssignedClassesResponseI>({
      queryKey: [queryKeys.staffAssignedClasses, params],
      queryFn: () => getStaffAssignedClassesApi(params),
      enabled: !!params.subUserId && !!params.schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    assignedClasses: data?.value ?? [],
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useStaffAssignedSubjects = (
  params: GetStaffAssignedSubjectsParamsI
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetStaffAssignedSubjectsResponseI>({
      queryKey: [queryKeys.staffAssignedSubjects, params],
      queryFn: () => getStaffAssignedSubjectsApi(params),
      enabled: !!params.subUserId && !!params.schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    assignedSubjects: data?.value ?? [],
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useStaffTimetable = (params: GetStaffTimetableParamsI) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetStaffTimetableResponseI>({
      queryKey: [queryKeys.staffTimetable, params],
      queryFn: () => getStaffTimetableApi(params),
      enabled: !!params.subUserId && !!params.schoolId,
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    timetable: data?.value ?? [],
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}
