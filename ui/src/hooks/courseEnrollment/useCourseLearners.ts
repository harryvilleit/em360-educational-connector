import { useQuery } from "@tanstack/react-query"
import { getCourseLearnersApi } from "@/api/courseEnrollment.api"
import { ApiError } from "@/api/api"
import { useAuthStore } from "@/store/auth.store"

export function useCourseLearners(courseId: string, page: number, enabled: boolean) {
  const userId = useAuthStore((state) => state.user?.id)
  return useQuery({
    queryKey: ["lms", "course-learners", userId, courseId, page],
    queryFn: ({ signal }) => getCourseLearnersApi(courseId, page, 20, signal),
    enabled: enabled && Boolean(userId && courseId),
    staleTime: 15_000,
    retry: (count, error) =>
      !(error instanceof ApiError && [401, 403, 404].includes(error.status)) && count < 2,
  })
}
