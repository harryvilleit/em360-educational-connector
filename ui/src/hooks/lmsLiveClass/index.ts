import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/store/auth.store"
import {
  deleteLmsLiveClassApi,
  endLmsLiveClassApi,
  getLmsLiveClassEnrollmentsApi,
  getMyLmsLiveClassesApi,
  getPublicLmsLiveClassApi,
  getPublicLmsLiveClassesApi,
  getTutorLmsLiveClassesApi,
  mapLmsLiveClass,
  scheduleLmsLiveClassApi,
  startLmsLiveClassApi,
  updateLmsLiveClassApi,
  type SaveLmsLiveClassPayloadI,
} from "@/api/lmsLiveClass.api"

const tutorKey = ["lms", "live-classes", "tutor"] as const
const myKey = ["lms", "live-classes", "mine"] as const
const publicKey = ["lms", "live-classes", "public"] as const

export function useTutorLmsLiveClasses(enabled = true) {
  const query = useQuery({
    queryKey: tutorKey,
    queryFn: getTutorLmsLiveClassesApi,
    enabled,
    staleTime: 15_000,
  })
  return {
    ...query,
    raw: query.data?.value ?? [],
    sessions: (query.data?.value ?? []).map(mapLmsLiveClass),
  }
}

export function useMyLmsLiveClasses(enabled = true) {
  const query = useQuery({
    queryKey: myKey,
    queryFn: getMyLmsLiveClassesApi,
    enabled,
    staleTime: 15_000,
  })
  return { ...query, sessions: (query.data?.value ?? []).map(mapLmsLiveClass) }
}

export function usePublicLmsLiveClasses(search?: string) {
  const viewerId = useAuthStore((state) => state.token ? state.user?.id : null)
  const query = useQuery({
    queryKey: [...publicKey, search ?? "", viewerId ?? "guest"],
    queryFn: () => getPublicLmsLiveClassesApi(search),
    staleTime: 30_000,
  })
  return { ...query, sessions: (query.data?.value ?? []).map(mapLmsLiveClass) }
}

export function usePublicLmsLiveClass(publicCode?: string) {
  const viewerId = useAuthStore((state) => state.token ? state.user?.id : null)
  const query = useQuery({
    queryKey: [...publicKey, "detail", publicCode, viewerId ?? "guest"],
    queryFn: () => getPublicLmsLiveClassApi(publicCode!),
    enabled: Boolean(publicCode),
    staleTime: 15_000,
  })
  return {
    ...query,
    raw: query.data?.value,
    session: query.data?.value ? mapLmsLiveClass(query.data.value) : undefined,
  }
}

export function useSaveLmsLiveClass() {
  const client = useQueryClient()
  const invalidate = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: tutorKey }),
      client.invalidateQueries({ queryKey: myKey }),
      client.invalidateQueries({ queryKey: publicKey }),
    ])
  }
  const create = useMutation({ mutationFn: scheduleLmsLiveClassApi, onSuccess: invalidate })
  const update = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SaveLmsLiveClassPayloadI }) =>
      updateLmsLiveClassApi(id, payload),
    onSuccess: invalidate,
  })
  const remove = useMutation({ mutationFn: deleteLmsLiveClassApi, onSuccess: invalidate })
  const start = useMutation({ mutationFn: startLmsLiveClassApi, onSuccess: invalidate })
  const end = useMutation({ mutationFn: endLmsLiveClassApi, onSuccess: invalidate })
  return { create, update, remove, start, end }
}

export function useLmsLiveClassEnrollments(id?: string, enabled = true) {
  const query = useQuery({
    queryKey: ["lms", "live-class", id, "enrollments"],
    queryFn: () => getLmsLiveClassEnrollmentsApi(id!),
    enabled: enabled && Boolean(id),
    staleTime: 10_000,
  })
  return { ...query, enrollments: query.data?.value ?? [] }
}
