import type { QueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/utils/queryKeys"

export async function refetchCourseGetQueries(
  queryClient: QueryClient,
  courseId?: string
) {
  const tasks: Promise<unknown>[] = [
    queryClient.invalidateQueries({ queryKey: [queryKeys.tutorCourses] }),
  ]

  if (courseId) {
    tasks.push(
      queryClient.refetchQueries({
        queryKey: [queryKeys.sectionsByCourseId, courseId],
      }),
      queryClient.refetchQueries({
        queryKey: [queryKeys.courseById, courseId],
      })
    )
  }

  await Promise.all(tasks)
}
