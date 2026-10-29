import { request } from "../rebuilt/service"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { queryKeys } from "@/utils/queryKeys"
import {
  getHostelOverviewApi,
  createHostelsApi,
  updateHostelApi,
  deleteHostelApi,
  getAllHostelsApi,
  getHostelByIdApi,
  createHostelRoomApi,
  updateHostelRoomApi,
  deleteHostelRoomApi,
  getAllHostelRoomsApi,
  getHostelRoomByIdApi,
  getHostelRoomsByHostelTypeApi,
  getAvailableHostelRoomsApi,
  getRollCallSheetApi,
  submitHostelAttendanceApi,
  getHostelAttendanceHistoryApi,
  getHostelAttendanceSessionByIdApi,
  getHostelReportOverviewApi,
  getAllHostelReportsApi,
  getHostelReportByIdApi,
  fileHostelReportApi,
  billHostelReportApi,
  waiveHostelReportApi,
  deleteHostelReportApi,
  assignHostelSupervisorApi,
  unassignHostelSupervisorApi,
  getAllHostelSupervisorsApi,
  getHostelSupervisorProfileApi,
  recordHostelVisitorApi,
  getAllHostelVisitorsApi,
  getHostelVisitorByIdApi,
  updateHostelVisitorApi,
  signInOutHostelVisitorApi,
  deleteHostelVisitorApi,
  createBedSpaceApi,
  updateBedSpaceApi,
  deleteBedSpaceApi,
  assignBedSpaceApi,
  releaseBedSpaceApi,
  getAllBedSpacesApi,
  getBedSpaceByIdApi,
  getBedSpacesByRoomApi,
  getAvailableBedSpacesApi,
  getBedSpacesByStudentApi,
} from "@/api/hostel.api"
import type {
  GetHostelOverviewParamsI,
  GetHostelOverviewResponseI,
  HostelItemI,
  CreateHostelsPayloadI,
  CreateHostelsResponseI,
  UpdateHostelPayloadI,
  UpdateHostelResponseI,
  DeleteHostelResponseI,
  GetAllHostelsParamsI,
  GetAllHostelsResponseI,
  GetHostelByIdResponseI,
  CreateHostelRoomPayloadI,
  CreateHostelRoomResponseI,
  UpdateHostelRoomPayloadI,
  UpdateHostelRoomResponseI,
  DeleteHostelRoomResponseI,
  GetAllHostelRoomsParamsI,
  GetAllHostelRoomsResponseI,
  GetHostelRoomByIdResponseI,
  GetHostelRoomsByHostelTypeResponseI,
  GetAvailableHostelRoomsParamsI,
  GetAvailableHostelRoomsResponseI,
  GetRollCallSheetParamsI,
  GetRollCallSheetResponseI,
  SubmitHostelAttendancePayloadI,
  SubmitHostelAttendanceResponseI,
  GetHostelAttendanceHistoryParamsI,
  GetHostelAttendanceHistoryResponseI,
  GetHostelAttendanceSessionByIdResponseI,
  GetHostelReportOverviewParamsI,
  GetHostelReportOverviewResponseI,
  GetAllHostelReportsParamsI,
  GetAllHostelReportsResponseI,
  GetHostelReportByIdResponseI,
  FileHostelReportPayloadI,
  FileHostelReportResponseI,
  BillHostelReportPayloadI,
  BillHostelReportResponseI,
  WaiveHostelReportResponseI,
  DeleteHostelReportResponseI,
  AssignHostelSupervisorPayloadI,
  AssignHostelSupervisorResponseI,
  UnassignHostelSupervisorPayloadI,
  UnassignHostelSupervisorResponseI,
  GetAllHostelSupervisorsParamsI,
  GetAllHostelSupervisorsResponseI,
  GetHostelSupervisorProfileResponseI,
  RecordHostelVisitorPayloadI,
  RecordHostelVisitorResponseI,
  GetAllHostelVisitorsParamsI,
  GetAllHostelVisitorsResponseI,
  GetHostelVisitorByIdResponseI,
  UpdateHostelVisitorPayloadI,
  UpdateHostelVisitorResponseI,
  SignInOutHostelVisitorPayloadI,
  SignInOutHostelVisitorResponseI,
  DeleteHostelVisitorResponseI,
  CreateBedSpacePayloadI,
  CreateBedSpaceResponseI,
  UpdateBedSpacePayloadI,
  UpdateBedSpaceResponseI,
  DeleteBedSpaceResponseI,
  AssignBedSpacePayloadI,
  AssignBedSpaceResponseI,
  ReleaseBedSpaceResponseI,
  GetAllBedSpacesParamsI,
  GetAllBedSpacesResponseI,
  GetBedSpaceByIdResponseI,
  GetBedSpacesByRoomResponseI,
  GetAvailableBedSpacesParamsI,
  GetAvailableBedSpacesResponseI,
  GetBedSpacesByStudentResponseI,
} from "@/api/hostel.api/types"

interface UseCreateHostelsOptions {
  onSuccess?: (data: HostelItemI[]) => void
  onError?: (error: Error) => void
}

export const useCreateHostels = ({
  onSuccess,
  onError,
}: UseCreateHostelsOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<CreateHostelsResponseI, Error, CreateHostelsPayloadI>({
      mutationFn: createHostelsApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.hostels] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.hostelOverview] })
        toast.success(
          data.value.length > 1
            ? `${data.value.length} hostels created successfully`
            : "Hostel created successfully"
        )
        onSuccess?.(data.value)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to create hostel")
        onError?.(err)
      },
    })

  return {
    createHostels: mutate,
    createHostelsAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseUpdateHostelOptions {
  onSuccess?: (data: UpdateHostelResponseI) => void
  onError?: (error: Error) => void
}

export const useUpdateHostel = ({
  onSuccess,
  onError,
}: UseUpdateHostelOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<UpdateHostelResponseI, Error, UpdateHostelPayloadI>({
      mutationFn: updateHostelApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.hostels] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.hostelById] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.hostelOverview] })
        toast.success("Hostel type updated successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to update hostel type")
        onError?.(err)
      },
    })

  return {
    updateHostel: mutate,
    updateHostelAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseDeleteHostelOptions {
  onSuccess?: (data: DeleteHostelResponseI) => void
  onError?: (error: Error) => void
}

export const useDeleteHostel = ({
  onSuccess,
  onError,
}: UseDeleteHostelOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<DeleteHostelResponseI, Error, string>({
      mutationFn: deleteHostelApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.hostels] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.hostelOverview] })
        toast.success("Hostel type deleted successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to delete hostel type")
        onError?.(err)
      },
    })

  return {
    deleteHostel: mutate,
    deleteHostelAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetHostelOverview = (params: GetHostelOverviewParamsI) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetHostelOverviewResponseI>({
      queryKey: [queryKeys.hostelOverview, params],
      queryFn: () => getHostelOverviewApi(params),
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

export const useGetAllHostels = (params: GetAllHostelsParamsI) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetAllHostelsResponseI>({
      queryKey: [queryKeys.hostels, params],
      queryFn: () => getAllHostelsApi(params),
      enabled: !!params.schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    hostels: data?.value?.items ?? [],
    pagination: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetHostelById = (id: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetHostelByIdResponseI>({
      queryKey: [queryKeys.hostelById, id],
      queryFn: () => getHostelByIdApi(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    hostel: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

interface UseCreateHostelRoomOptions {
  onSuccess?: (data: CreateHostelRoomResponseI) => void
  onError?: (error: Error) => void
}

export const useCreateHostelRoom = ({
  onSuccess,
  onError,
}: UseCreateHostelRoomOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<CreateHostelRoomResponseI, Error, CreateHostelRoomPayloadI>({
      mutationFn: createHostelRoomApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.hostelRooms] })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.hostelRoomsByHostelType],
        })
        queryClient.invalidateQueries({ queryKey: [queryKeys.hostelOverview] })
        toast.success("Room created successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to create room")
        onError?.(err)
      },
    })

  return {
    createHostelRoom: mutate,
    createHostelRoomAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseUpdateHostelRoomOptions {
  onSuccess?: (data: UpdateHostelRoomResponseI) => void
  onError?: (error: Error) => void
}

export const useUpdateHostelRoom = ({
  onSuccess,
  onError,
}: UseUpdateHostelRoomOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<UpdateHostelRoomResponseI, Error, UpdateHostelRoomPayloadI>({
      mutationFn: updateHostelRoomApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.hostelRooms] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.hostelRoomById] })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.hostelRoomsByHostelType],
        })
        queryClient.invalidateQueries({ queryKey: [queryKeys.hostelOverview] })
        toast.success("Room updated successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to update room")
        onError?.(err)
      },
    })

  return {
    updateHostelRoom: mutate,
    updateHostelRoomAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseDeleteHostelRoomOptions {
  onSuccess?: (data: DeleteHostelRoomResponseI) => void
  onError?: (error: Error) => void
}

export const useDeleteHostelRoom = ({
  onSuccess,
  onError,
}: UseDeleteHostelRoomOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<DeleteHostelRoomResponseI, Error, string>({
      mutationFn: deleteHostelRoomApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.hostelRooms] })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.hostelRoomsByHostelType],
        })
        queryClient.invalidateQueries({ queryKey: [queryKeys.hostelOverview] })
        toast.success("Room deleted successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to delete room")
        onError?.(err)
      },
    })

  return {
    deleteHostelRoom: mutate,
    deleteHostelRoomAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetAllHostelRooms = (params: GetAllHostelRoomsParamsI) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetAllHostelRoomsResponseI>({
      queryKey: [queryKeys.hostelRooms, params],
      queryFn: () => getAllHostelRoomsApi(params),
      enabled: !!params.schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    rooms: data?.value?.items ?? [],
    pagination: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetHostelRoomById = (id: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetHostelRoomByIdResponseI>({
      queryKey: [queryKeys.hostelRoomById, id],
      queryFn: () => getHostelRoomByIdApi(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    room: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetHostelRoomsByHostelType = (hostelId: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetHostelRoomsByHostelTypeResponseI>({
      queryKey: [queryKeys.hostelRoomsByHostelType, hostelId],
      queryFn: () => getHostelRoomsByHostelTypeApi(hostelId),
      enabled: !!hostelId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    rooms: data?.value ?? [],
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetAvailableHostelRooms = (
  params: GetAvailableHostelRoomsParamsI
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetAvailableHostelRoomsResponseI>({
      queryKey: [queryKeys.availableHostelRooms, params],
      queryFn: () => getAvailableHostelRoomsApi(params),
      enabled: !!params.schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    rooms: data?.value ?? [],
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetRollCallSheet = (params: GetRollCallSheetParamsI) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetRollCallSheetResponseI>({
      queryKey: [queryKeys.hostelRollCallSheet, params],
      queryFn: () => getRollCallSheetApi(params),
      enabled: !!params.hostelId && !!params.date,
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    })

  return {
    rollCallSheet: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

interface UseSubmitHostelAttendanceOptions {
  onSuccess?: (data: SubmitHostelAttendanceResponseI) => void
  onError?: (error: Error) => void
}

export const useSubmitHostelAttendance = ({
  onSuccess,
  onError,
}: UseSubmitHostelAttendanceOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      SubmitHostelAttendanceResponseI,
      Error,
      SubmitHostelAttendancePayloadI
    >({
      mutationFn: submitHostelAttendanceApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.hostelRollCallSheet],
        })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.hostelAttendanceHistory],
        })
        toast.success("Attendance submitted successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to submit attendance")
        onError?.(err)
      },
    })

  return {
    submitHostelAttendance: mutate,
    submitHostelAttendanceAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetHostelAttendanceHistory = (
  params: GetHostelAttendanceHistoryParamsI
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetHostelAttendanceHistoryResponseI>({
      queryKey: [queryKeys.hostelAttendanceHistory, params],
      queryFn: () => getHostelAttendanceHistoryApi(params),
      enabled: !!params.schoolId,
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    })

  return {
    sessions: data?.value?.items ?? [],
    pagination: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetHostelAttendanceSessionById = (sessionId: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetHostelAttendanceSessionByIdResponseI>({
      queryKey: [queryKeys.hostelAttendanceSessionById, sessionId],
      queryFn: () => getHostelAttendanceSessionByIdApi(sessionId),
      enabled: !!sessionId,
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    })

  return {
    session: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetHostelReportOverview = (
  params: GetHostelReportOverviewParamsI
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetHostelReportOverviewResponseI>({
      queryKey: [queryKeys.hostelReportOverview, params],
      queryFn: () => getHostelReportOverviewApi(params),
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

export const useGetAllHostelReports = (params: GetAllHostelReportsParamsI) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetAllHostelReportsResponseI>({
      queryKey: [queryKeys.hostelReports, params],
      queryFn: () => getAllHostelReportsApi(params),
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    })

  return {
    reports: data?.value?.items ?? [],
    pagination: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetHostelReportById = (id: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetHostelReportByIdResponseI>({
      queryKey: [queryKeys.hostelReportById, id],
      queryFn: () => getHostelReportByIdApi(id),
      enabled: !!id,
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    })

  return {
    report: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

interface UseFileHostelReportOptions {
  onSuccess?: (data: FileHostelReportResponseI) => void
  onError?: (error: Error) => void
}

export const useFileHostelReport = ({
  onSuccess,
  onError,
}: UseFileHostelReportOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<FileHostelReportResponseI, Error, FileHostelReportPayloadI>({
      mutationFn: fileHostelReportApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.hostelReports] })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.hostelReportOverview],
        })
        toast.success("Report filed successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to file report")
        onError?.(err)
      },
    })

  return {
    fileHostelReport: mutate,
    fileHostelReportAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseBillHostelReportOptions {
  onSuccess?: (data: BillHostelReportResponseI) => void
  onError?: (error: Error) => void
}

export const useBillHostelReport = ({
  onSuccess,
  onError,
}: UseBillHostelReportOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      BillHostelReportResponseI,
      Error,
      BillHostelReportPayloadI & { id: string }
    >({
      mutationFn: billHostelReportApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.hostelReports] })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.hostelReportById],
        })
        toast.success("Student billed for damage successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to bill report")
        onError?.(err)
      },
    })

  return {
    billHostelReport: mutate,
    billHostelReportAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseWaiveHostelReportOptions {
  onSuccess?: (data: WaiveHostelReportResponseI) => void
  onError?: (error: Error) => void
}

export const useWaiveHostelReport = ({
  onSuccess,
  onError,
}: UseWaiveHostelReportOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<WaiveHostelReportResponseI, Error, string>({
      mutationFn: waiveHostelReportApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.hostelReports] })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.hostelReportById],
        })
        toast.success("Report waived successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to waive report")
        onError?.(err)
      },
    })

  return {
    waiveHostelReport: mutate,
    waiveHostelReportAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseDeleteHostelReportOptions {
  onSuccess?: (data: DeleteHostelReportResponseI) => void
  onError?: (error: Error) => void
}

export const useDeleteHostelReport = ({
  onSuccess,
  onError,
}: UseDeleteHostelReportOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<DeleteHostelReportResponseI, Error, string>({
      mutationFn: deleteHostelReportApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.hostelReports] })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.hostelReportOverview],
        })
        toast.success("Report deleted successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to delete report")
        onError?.(err)
      },
    })

  return {
    deleteHostelReport: mutate,
    deleteHostelReportAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseAssignHostelSupervisorOptions {
  onSuccess?: (data: AssignHostelSupervisorResponseI) => void
  onError?: (error: Error) => void
}

export const useAssignHostelSupervisor = ({
  onSuccess,
  onError,
}: UseAssignHostelSupervisorOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      AssignHostelSupervisorResponseI,
      Error,
      AssignHostelSupervisorPayloadI
    >({
      mutationFn: assignHostelSupervisorApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.hostelSupervisors],
        })
        toast.success("Supervisor assigned successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to assign supervisor")
        onError?.(err)
      },
    })

  return {
    assignHostelSupervisor: mutate,
    assignHostelSupervisorAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface ReassignHostelSupervisorPayloadI {
  role?: number
  oldHostelId: string
  newHostelId: string
  supervisorId: string
}

interface UseReassignHostelSupervisorOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

// There's no Reassign endpoint — this composes Unassign (old hostel) and
// Assign (new hostel) into a single action. Not atomic: if Assign fails
// after Unassign succeeds, the supervisor is left unassigned.
export const useReassignHostelSupervisor = ({
  onSuccess,
  onError,
}: UseReassignHostelSupervisorOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<void, Error, ReassignHostelSupervisorPayloadI>({
      mutationFn: async ({
        oldHostelId,
        newHostelId,
        supervisorId,
        role = 1,
      }) => {
        await request("/WordPressHostel/Reassign", "POST", {
          previousHostelId: oldHostelId,
          hostelId: newHostelId,
          supervisorId,
          role,
        })
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.hostelSupervisors],
        })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.hostelSupervisorProfile],
        })
        toast.success("Supervisor reassigned successfully")
        onSuccess?.()
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to reassign supervisor")
        onError?.(err)
      },
    })

  return {
    reassignHostelSupervisor: mutate,
    reassignHostelSupervisorAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseUnassignHostelSupervisorOptions {
  onSuccess?: (data: UnassignHostelSupervisorResponseI) => void
  onError?: (error: Error) => void
}

export const useUnassignHostelSupervisor = ({
  onSuccess,
  onError,
}: UseUnassignHostelSupervisorOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      UnassignHostelSupervisorResponseI,
      Error,
      UnassignHostelSupervisorPayloadI
    >({
      mutationFn: unassignHostelSupervisorApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [queryKeys.hostelSupervisors],
        })
        toast.success("Supervisor unassigned successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to unassign supervisor")
        onError?.(err)
      },
    })

  return {
    unassignHostelSupervisor: mutate,
    unassignHostelSupervisorAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetAllHostelSupervisors = (
  params: GetAllHostelSupervisorsParamsI
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetAllHostelSupervisorsResponseI>({
      queryKey: [queryKeys.hostelSupervisors, params],
      queryFn: () => getAllHostelSupervisorsApi(params),
      enabled: !!params.schoolId,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    supervisors: data?.value?.items ?? [],
    pagination: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetHostelSupervisorProfile = (id: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetHostelSupervisorProfileResponseI>({
      queryKey: [queryKeys.hostelSupervisorProfile, id],
      queryFn: () => getHostelSupervisorProfileApi(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  return {
    supervisor: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

interface UseRecordHostelVisitorOptions {
  onSuccess?: (data: RecordHostelVisitorResponseI) => void
  onError?: (error: Error) => void
}

export const useRecordHostelVisitor = ({
  onSuccess,
  onError,
}: UseRecordHostelVisitorOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      RecordHostelVisitorResponseI,
      Error,
      RecordHostelVisitorPayloadI
    >({
      mutationFn: recordHostelVisitorApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.hostelVisitors] })
        toast.success("Visitor recorded successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to record visitor")
        onError?.(err)
      },
    })

  return {
    recordHostelVisitor: mutate,
    recordHostelVisitorAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetAllHostelVisitors = (
  params: GetAllHostelVisitorsParamsI
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetAllHostelVisitorsResponseI>({
      queryKey: [queryKeys.hostelVisitors, params],
      queryFn: () => getAllHostelVisitorsApi(params),
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    })

  return {
    visitors: data?.value?.items ?? [],
    pagination: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetHostelVisitorById = (id: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetHostelVisitorByIdResponseI>({
      queryKey: [queryKeys.hostelVisitorById, id],
      queryFn: () => getHostelVisitorByIdApi(id),
      enabled: !!id,
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    })

  return {
    visitor: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

interface UseUpdateHostelVisitorOptions {
  onSuccess?: (data: UpdateHostelVisitorResponseI) => void
  onError?: (error: Error) => void
}

export const useUpdateHostelVisitor = ({
  onSuccess,
  onError,
}: UseUpdateHostelVisitorOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      UpdateHostelVisitorResponseI,
      Error,
      UpdateHostelVisitorPayloadI
    >({
      mutationFn: updateHostelVisitorApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.hostelVisitors] })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.hostelVisitorById],
        })
        toast.success("Visitor log updated successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to update visitor log")
        onError?.(err)
      },
    })

  return {
    updateHostelVisitor: mutate,
    updateHostelVisitorAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseSignInOutHostelVisitorOptions {
  onSuccess?: (data: SignInOutHostelVisitorResponseI) => void
  onError?: (error: Error) => void
}

export const useSignInOutHostelVisitor = ({
  onSuccess,
  onError,
}: UseSignInOutHostelVisitorOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      SignInOutHostelVisitorResponseI,
      Error,
      SignInOutHostelVisitorPayloadI
    >({
      mutationFn: signInOutHostelVisitorApi,
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.hostelVisitors] })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.hostelVisitorById],
        })
        toast.success(
          variables.isSignIn ? "Visitor signed in" : "Visitor signed out"
        )
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to update sign-in status")
        onError?.(err)
      },
    })

  return {
    signInOutHostelVisitor: mutate,
    signInOutHostelVisitorAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseDeleteHostelVisitorOptions {
  onSuccess?: (data: DeleteHostelVisitorResponseI) => void
  onError?: (error: Error) => void
}

export const useDeleteHostelVisitor = ({
  onSuccess,
  onError,
}: UseDeleteHostelVisitorOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<DeleteHostelVisitorResponseI, Error, string>({
      mutationFn: deleteHostelVisitorApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.hostelVisitors] })
        toast.success("Visitor log deleted successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to delete visitor log")
        onError?.(err)
      },
    })

  return {
    deleteHostelVisitor: mutate,
    deleteHostelVisitorAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseCreateBedSpaceOptions {
  onSuccess?: (data: CreateBedSpaceResponseI) => void
  onError?: (error: Error) => void
}

export const useCreateBedSpace = ({
  onSuccess,
  onError,
}: UseCreateBedSpaceOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<CreateBedSpaceResponseI, Error, CreateBedSpacePayloadI>({
      mutationFn: createBedSpaceApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.bedSpaces] })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.bedSpacesByRoom],
        })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.availableBedSpaces],
        })
        queryClient.invalidateQueries({ queryKey: [queryKeys.hostelRooms] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.hostelOverview] })
        toast.success("Bed space created successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to create bed space")
        onError?.(err)
      },
    })

  return {
    createBedSpace: mutate,
    createBedSpaceAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseUpdateBedSpaceOptions {
  onSuccess?: (data: UpdateBedSpaceResponseI) => void
  onError?: (error: Error) => void
}

export const useUpdateBedSpace = ({
  onSuccess,
  onError,
}: UseUpdateBedSpaceOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<UpdateBedSpaceResponseI, Error, UpdateBedSpacePayloadI>({
      mutationFn: updateBedSpaceApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.bedSpaces] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.bedSpaceById] })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.bedSpacesByRoom],
        })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.availableBedSpaces],
        })
        queryClient.invalidateQueries({ queryKey: [queryKeys.hostelRooms] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.hostelOverview] })
        toast.success("Bed space updated successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to update bed space")
        onError?.(err)
      },
    })

  return {
    updateBedSpace: mutate,
    updateBedSpaceAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseDeleteBedSpaceOptions {
  onSuccess?: (data: DeleteBedSpaceResponseI) => void
  onError?: (error: Error) => void
}

export const useDeleteBedSpace = ({
  onSuccess,
  onError,
}: UseDeleteBedSpaceOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<DeleteBedSpaceResponseI, Error, string>({
      mutationFn: deleteBedSpaceApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.bedSpaces] })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.bedSpacesByRoom],
        })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.availableBedSpaces],
        })
        queryClient.invalidateQueries({ queryKey: [queryKeys.hostelRooms] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.hostelOverview] })
        toast.success("Bed space deleted successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to delete bed space")
        onError?.(err)
      },
    })

  return {
    deleteBedSpace: mutate,
    deleteBedSpaceAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseAssignBedSpaceOptions {
  onSuccess?: (data: AssignBedSpaceResponseI) => void
  onError?: (error: Error) => void
}

export const useAssignBedSpace = ({
  onSuccess,
  onError,
}: UseAssignBedSpaceOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<AssignBedSpaceResponseI, Error, AssignBedSpacePayloadI>({
      mutationFn: assignBedSpaceApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.bedSpaces] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.bedSpaceById] })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.bedSpacesByRoom],
        })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.availableBedSpaces],
        })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.bedSpacesByStudent],
        })
        queryClient.invalidateQueries({ queryKey: [queryKeys.hostelRooms] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.hostelOverview] })
        toast.success("Student assigned to bed space successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to assign bed space")
        onError?.(err)
      },
    })

  return {
    assignBedSpace: mutate,
    assignBedSpaceAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

interface UseReleaseBedSpaceOptions {
  onSuccess?: (data: ReleaseBedSpaceResponseI) => void
  onError?: (error: Error) => void
}

export const useReleaseBedSpace = ({
  onSuccess,
  onError,
}: UseReleaseBedSpaceOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<ReleaseBedSpaceResponseI, Error, string>({
      mutationFn: releaseBedSpaceApi,
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKeys.bedSpaces] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.bedSpaceById] })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.bedSpacesByRoom],
        })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.availableBedSpaces],
        })
        queryClient.invalidateQueries({
          queryKey: [queryKeys.bedSpacesByStudent],
        })
        queryClient.invalidateQueries({ queryKey: [queryKeys.hostelRooms] })
        queryClient.invalidateQueries({ queryKey: [queryKeys.hostelOverview] })
        toast.success("Bed space released successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to release bed space")
        onError?.(err)
      },
    })

  return {
    releaseBedSpace: mutate,
    releaseBedSpaceAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useGetAllBedSpaces = (params: GetAllBedSpacesParamsI) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetAllBedSpacesResponseI>({
      queryKey: [queryKeys.bedSpaces, params],
      queryFn: () => getAllBedSpacesApi(params),
      enabled: !!params.schoolId,
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    })

  return {
    bedSpaces: data?.value?.items ?? [],
    pagination: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetBedSpaceById = (id: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetBedSpaceByIdResponseI>({
      queryKey: [queryKeys.bedSpaceById, id],
      queryFn: () => getBedSpaceByIdApi(id),
      enabled: !!id,
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    })

  return {
    bedSpace: data?.value,
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetBedSpacesByRoom = (roomId: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetBedSpacesByRoomResponseI>({
      queryKey: [queryKeys.bedSpacesByRoom, roomId],
      queryFn: () => getBedSpacesByRoomApi(roomId),
      enabled: !!roomId,
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    })

  return {
    bedSpaces: data?.value ?? [],
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetAvailableBedSpaces = (
  params: GetAvailableBedSpacesParamsI
) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetAvailableBedSpacesResponseI>({
      queryKey: [queryKeys.availableBedSpaces, params],
      queryFn: () => getAvailableBedSpacesApi(params),
      enabled: !!params.schoolId,
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    })

  return {
    bedSpaces: data?.value ?? [],
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useGetBedSpacesByStudent = (studentId: string) => {
  const { data, isPending, isError, error, isSuccess, refetch } =
    useQuery<GetBedSpacesByStudentResponseI>({
      queryKey: [queryKeys.bedSpacesByStudent, studentId],
      queryFn: () => getBedSpacesByStudentApi(studentId),
      enabled: !!studentId,
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    })

  return {
    bedSpaces: data?.value ?? [],
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}
