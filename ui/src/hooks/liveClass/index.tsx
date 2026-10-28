import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  scheduleLiveClassApi,
  getLiveClassesApi,
  getTeacherCoursesApi,
  startLiveClassApi,
  endLiveClassApi,
  joinLiveClassApi,
  leaveLiveClassApi,
  getLiveClassParticipantsApi,
  admitParticipantsApi,
  removeParticipantApi,
  muteParticipantsApi,
  updateLiveClassPolicyApi,
  createGuestLinkApi,
  revokeGuestLinkApi,
  startClassFromSlotApi,
  getLiveClassEnrolledCountApi,
} from "@/api/liveClass.api"
import type {
  GetLiveClassesParams,
  GetLiveClassParticipantsParams,
  ScheduleLiveClassPayloadI,
  JoinLiveClassPayloadI,
  CreateGuestLinkPayloadI,
  RevokeGuestLinkParams,
  AdmitParticipantsPayloadI,
  RemoveParticipantPayloadI,
  MuteParticipantsPayloadI,
  UpdateLiveClassPolicyPayloadI,
  StartClassFromSlotPayloadI,
} from "@/api/liveClass.api/types"
import { useAuthStore } from "@/store/auth.store"

// Local, namespaced query keys — kept out of the shared registry so this module
// is fully self-contained and can't clobber keys defined elsewhere.
const liveClassKeys = {
  list: "live-classes",
  participants: "live-class-participants",
  enrolledCount: "live-class-enrolled-count",
} as const

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Live-refresh options for screens that must notice a class starting.
 *
 * The defaults below are deliberately quiet — most screens read this list once.
 * A screen where someone is waiting for a teacher to open a room (the student
 * portal) needs the opposite, so it opts into polling rather than every caller
 * paying for it.
 */
export interface UseGetLiveClassesOptions {
  /** Poll interval in ms. Omit for no polling. */
  refetchInterval?: number
  /** Overrides the 5 minute default. */
  staleTime?: number
  /** Re-check when the tab regains focus. */
  refetchOnWindowFocus?: boolean
}

export const useGetLiveClasses = (
  params: GetLiveClassesParams,
  options: UseGetLiveClassesOptions = {}
) => {
  const viewerId = useAuthStore((state) => state.token ? state.user?.id : null)
  const { data, isPending, isError, error, isSuccess, refetch, isFetching } =
    useQuery({
      queryKey: [
        liveClassKeys.list,
        viewerId ?? "guest",
        params.schoolId,
        // schoolClassId and status are sent to the API but were missing from the
        // key, so a class-filtered list and an unfiltered one shared one cache
        // entry — whichever fetched first served both.
        params.schoolClassId ?? null,
        params.teacherId ?? null,
        params.status ?? null,
        params.pageNumber ?? 1,
        params.pageSize ?? 20,
      ],

      queryFn: () =>
        getLiveClassesApi({
          ...params,
          pageNumber: params.pageNumber ?? 1,
          pageSize: params.pageSize ?? 20,
        }),

      enabled: Boolean(params.schoolId),

      // Keep successful data fresh for 5 minutes unless the caller says otherwise.
      staleTime: options.staleTime ?? 5 * 60 * 1000,

      // Keep unused cache for 10 minutes
      gcTime: 10 * 60 * 1000,

      // Do NOT repeatedly retry 503/4xx responses
      retry: false,

      // Opt-in polling, for callers watching for a class to go live.
      refetchInterval: options.refetchInterval,
      refetchIntervalInBackground: false,

      // Off by default; a polling caller usually wants this on too.
      refetchOnWindowFocus: options.refetchOnWindowFocus ?? false,

      // Do not automatically refetch when connection comes back
      refetchOnReconnect: false,

      // If valid cached data exists, don't immediately refetch on remount —
      // except when the caller has asked to stay current.
      refetchOnMount: options.refetchInterval ? true : false,
    })

  return {
    liveClasses: data?.value?.items ?? [],

    totalItems: data?.value?.totalItems ?? 0,

    pageNumber: data?.value?.pageNumber ?? params.pageNumber ?? 1,

    pageSize: data?.value?.pageSize ?? params.pageSize ?? 20,

    totalPages: data?.value?.totalPages ?? 0,

    isLoading: isPending,

    isPending,

    isFetching,

    isError,

    error,

    isSuccess,

    refetch,
  }
}

export const useGetLiveClassParticipants = (
  params: GetLiveClassParticipantsParams,
  options?: { refetchInterval?: number }
) => {
  const { data, isPending, isError, error, isSuccess, refetch } = useQuery({
    queryKey: [liveClassKeys.participants, params],
    queryFn: () => getLiveClassParticipantsApi(params),
    enabled: !!params.liveClassId,
    staleTime: 10 * 1000,
    refetchInterval: options?.refetchInterval,
  })

  return {
    participants: data?.value ?? [],
    isLoading: isPending,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

// ─── Mutations ────────────────────────────────────────────────────────────────

interface MutationOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

export const useScheduleLiveClass = (
  opts: MutationOptions<Awaited<ReturnType<typeof scheduleLiveClassApi>>> = {}
) => {
  const queryClient = useQueryClient()
  const m = useMutation<
    Awaited<ReturnType<typeof scheduleLiveClassApi>>,
    Error,
    ScheduleLiveClassPayloadI
  >({
    mutationFn: scheduleLiveClassApi,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [liveClassKeys.list] })
      toast.success(data?.message || "Class scheduled")
      opts.onSuccess?.(data)
    },
    onError: (err) => {
      toast.error(err?.message ?? "Failed to schedule class")
      opts.onError?.(err)
    },
  })
  return {
    scheduleLiveClass: m.mutate,
    scheduleLiveClassAsync: m.mutateAsync,
    isPending: m.isPending,
    isSuccess: m.isSuccess,
    isError: m.isError,
    error: m.error,
    reset: m.reset,
  }
}

export const useStartLiveClass = (
  opts: MutationOptions<Awaited<ReturnType<typeof startLiveClassApi>>> = {}
) => {
  const queryClient = useQueryClient()
  const m = useMutation({
    mutationFn: (liveClassId: string) => startLiveClassApi(liveClassId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [liveClassKeys.list] })
      opts.onSuccess?.(data)
    },
    onError: (err: Error) => {
      queryClient.invalidateQueries({ queryKey: [liveClassKeys.list] })
      toast.error(
        err?.message ?? "Only an assigned teacher can start this class"
      )
      opts.onError?.(err)
    },
  })
  return {
    startLiveClass: m.mutate,
    startLiveClassAsync: m.mutateAsync,
    isPending: m.isPending,
    isSuccess: m.isSuccess,
    isError: m.isError,
    error: m.error,
  }
}

export const useEndLiveClass = (
  opts: MutationOptions<Awaited<ReturnType<typeof endLiveClassApi>>> = {}
) => {
  const queryClient = useQueryClient()
  const m = useMutation({
    mutationFn: (liveClassId: string) => endLiveClassApi(liveClassId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [liveClassKeys.list] })
      toast.success("Class ended")
      opts.onSuccess?.(data)
    },
    onError: (err: Error) => {
      toast.error(err?.message ?? "Failed to end class")
      opts.onError?.(err)
    },
  })
  return {
    endLiveClass: m.mutate,
    endLiveClassAsync: m.mutateAsync,
    isPending: m.isPending,
    isSuccess: m.isSuccess,
    isError: m.isError,
    error: m.error,
  }
}

export const useJoinLiveClass = (
  opts: MutationOptions<Awaited<ReturnType<typeof joinLiveClassApi>>> = {}
) => {
  const m = useMutation<
    Awaited<ReturnType<typeof joinLiveClassApi>>,
    Error,
    JoinLiveClassPayloadI
  >({
    mutationFn: joinLiveClassApi,
    onSuccess: (data) => opts.onSuccess?.(data),
    onError: (err) => {
      toast.error(err?.message ?? "Unable to join this class")
      opts.onError?.(err)
    },
  })
  return {
    joinLiveClass: m.mutate,
    joinLiveClassAsync: m.mutateAsync,
    isPending: m.isPending,
    isSuccess: m.isSuccess,
    isError: m.isError,
    error: m.error,
    data: m.data,
  }
}

export const useLeaveLiveClass = () => {
  const m = useMutation({
    mutationFn: (participantId: string) => leaveLiveClassApi(participantId),
  })
  return {
    leaveLiveClass: m.mutate,
    leaveLiveClassAsync: m.mutateAsync,
    isPending: m.isPending,
  }
}

export const useAdmitParticipants = () => {
  const queryClient = useQueryClient()
  const m = useMutation<
    Awaited<ReturnType<typeof admitParticipantsApi>>,
    Error,
    AdmitParticipantsPayloadI
  >({
    mutationFn: admitParticipantsApi,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [liveClassKeys.participants] }),
    onError: (err) =>
      toast.error(err?.message ?? "Failed to admit participants"),
  })
  return {
    admitParticipants: m.mutate,
    admitParticipantsAsync: m.mutateAsync,
    isPending: m.isPending,
  }
}

export const useRemoveParticipant = () => {
  const queryClient = useQueryClient()
  const m = useMutation<
    Awaited<ReturnType<typeof removeParticipantApi>>,
    Error,
    RemoveParticipantPayloadI
  >({
    mutationFn: removeParticipantApi,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [liveClassKeys.participants] }),
    onError: (err) =>
      toast.error(err?.message ?? "Failed to remove participant"),
  })
  return {
    removeParticipant: m.mutate,
    removeParticipantAsync: m.mutateAsync,
    isPending: m.isPending,
  }
}

export const useMuteParticipants = () => {
  const queryClient = useQueryClient()
  const m = useMutation<
    Awaited<ReturnType<typeof muteParticipantsApi>>,
    Error,
    MuteParticipantsPayloadI
  >({
    mutationFn: muteParticipantsApi,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [liveClassKeys.participants] }),
    onError: (err) =>
      toast.error(err?.message ?? "Failed to update mute state"),
  })
  return {
    muteParticipants: m.mutate,
    muteParticipantsAsync: m.mutateAsync,
    isPending: m.isPending,
  }
}

export const useUpdateLiveClassPolicy = () => {
  const queryClient = useQueryClient()
  const m = useMutation<
    Awaited<ReturnType<typeof updateLiveClassPolicyApi>>,
    Error,
    UpdateLiveClassPolicyPayloadI
  >({
    mutationFn: updateLiveClassPolicyApi,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [liveClassKeys.list] }),
    onError: (err) => toast.error(err?.message ?? "Failed to update policy"),
  })
  return {
    updatePolicy: m.mutate,
    updatePolicyAsync: m.mutateAsync,
    isPending: m.isPending,
  }
}

export const useCreateGuestLink = (
  opts: MutationOptions<Awaited<ReturnType<typeof createGuestLinkApi>>> = {}
) => {
  const m = useMutation<
    Awaited<ReturnType<typeof createGuestLinkApi>>,
    Error,
    CreateGuestLinkPayloadI
  >({
    mutationFn: createGuestLinkApi,
    onSuccess: (data) => {
      toast.success("Guest link created")
      opts.onSuccess?.(data)
    },
    onError: (err) => {
      toast.error(err?.message ?? "Failed to create guest link")
      opts.onError?.(err)
    },
  })
  return {
    createGuestLink: m.mutate,
    createGuestLinkAsync: m.mutateAsync,
    isPending: m.isPending,
    data: m.data,
  }
}

export const useRevokeGuestLink = () => {
  const m = useMutation<
    Awaited<ReturnType<typeof revokeGuestLinkApi>>,
    Error,
    RevokeGuestLinkParams
  >({
    mutationFn: revokeGuestLinkApi,
    onSuccess: () => toast.success("Guest link revoked"),
    onError: (err) =>
      toast.error(err?.message ?? "Failed to revoke guest link"),
  })
  return {
    revokeGuestLink: m.mutate,
    revokeGuestLinkAsync: m.mutateAsync,
    isPending: m.isPending,
  }
}

/**
 * Materialise (find-or-create) the LiveClass behind a virtual Timetable period,
 * then hand back the LiveClassDto so the caller can Start/Join it. Use this when
 * the E-Learning class list is sourced from the teacher's timetable slots.
 */
export const useStartClassFromSlot = (
  opts: MutationOptions<Awaited<ReturnType<typeof startClassFromSlotApi>>> = {}
) => {
  const queryClient = useQueryClient()
  const m = useMutation<
    Awaited<ReturnType<typeof startClassFromSlotApi>>,
    Error,
    StartClassFromSlotPayloadI
  >({
    mutationFn: startClassFromSlotApi,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [liveClassKeys.list] })
      opts.onSuccess?.(data)
    },
    onError: (err) => {
      toast.error(err?.message ?? "Unable to start this class")
      opts.onError?.(err)
    },
  })
  return {
    startClassFromSlot: m.mutate,
    startClassFromSlotAsync: m.mutateAsync,
    isPending: m.isPending,
    data: m.data,
  }
}

// ─── Enrolled student count (pre-join lobby) ─────────────────────────────────

export const useGetEnrolledCount = (liveClassId?: string | null) => {
  const { data, isPending } = useQuery({
    queryKey: [liveClassKeys.enrolledCount, liveClassId],
    queryFn: () => getLiveClassEnrolledCountApi(liveClassId!),
    enabled: !!liveClassId,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
  return {
    enrolledCount: data?.value ?? 0,
    isLoading: isPending,
  }
}

export const useGetTeacherCourses = (
  schoolId?: string,
  teacherSubUserId?: string
) => {
  const userId = useAuthStore((state) => state.user?.id)
  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: [
      "teacher-courses",
      schoolId,
      userId ?? null,
      teacherSubUserId ?? "self",
    ],
    queryFn: () => getTeacherCoursesApi(schoolId as string, teacherSubUserId),
    enabled: !!schoolId && !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
  return {
    courses: data?.value ?? [],
    isLoading: isPending,
    isError,
    error,
    refetch,
  }
}
