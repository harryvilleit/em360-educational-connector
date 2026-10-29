import { useQuery } from "@tanstack/react-query"
import {
  getELearningOverviewApi,
  getELearningTeacherTimetableWeekApi,
  type GetELearningOverviewParamsI,
  type GetELearningTeacherTimetableWeekParamsI,
} from "@/api/elearningOverview.api"
import { useAuthStore } from "@/store/auth.store"

export function useELearningOverview(
  params: Partial<GetELearningOverviewParamsI>
) {
  const userId = useAuthStore((state) => state.user?.id)
  const enabled = Boolean(
    userId &&
    params.schoolId &&
    params.schoolSessionId &&
    params.schoolSessionTermId
  )

  const query = useQuery({
    queryKey: [
      "elearning-overview",
      params.schoolId ?? null,
      params.schoolSessionId ?? null,
      params.schoolSessionTermId ?? null,
      userId ?? null,
    ],
    queryFn: () =>
      getELearningOverviewApi(params as GetELearningOverviewParamsI),
    enabled,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  return {
    ...query,
    overview: query.data?.value,
  }
}

export function useELearningTeacherTimetableWeek(
  params: Partial<GetELearningTeacherTimetableWeekParamsI>
) {
  const userId = useAuthStore((state) => state.user?.id)
  const enabled = Boolean(
    userId &&
    params.schoolId &&
    params.teacherSubUserId &&
    params.schoolSessionId &&
    params.schoolSessionTermId &&
    params.weekStartDate
  )

  return useQuery({
    queryKey: [
      "elearning-teacher-timetable",
      params.schoolId ?? null,
      params.teacherSubUserId ?? null,
      params.schoolSessionId ?? null,
      params.schoolSessionTermId ?? null,
      params.weekStartDate ?? null,
      userId ?? null,
    ],
    queryFn: () =>
      getELearningTeacherTimetableWeekApi(
        params as GetELearningTeacherTimetableWeekParamsI
      ),
    enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}
