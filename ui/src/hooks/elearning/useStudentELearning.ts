import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getStudentCourseWorkspaceApi,
  getStudentELearningCoursesApi,
  saveStudentLessonProgressApi,
} from "@/api/studentElearning.api"
import { useAuthStore } from "@/store/auth.store"

export const studentCoursesKey = (schoolId?: string, userId?: string) => [
  "student-elearning-courses",
  schoolId ?? null,
  userId ?? null,
]

export const studentCourseWorkspaceKey = (
  schoolId?: string,
  subjectId?: string,
  classId?: string,
  userId?: string
) => [
  "student-elearning-course",
  schoolId ?? null,
  subjectId ?? null,
  classId ?? null,
  userId ?? null,
]

export function useStudentELearningCourses(schoolId?: string) {
  const userId = useAuthStore((state) => state.user?.id)
  const query = useQuery({
    queryKey: studentCoursesKey(schoolId, userId),
    queryFn: () => getStudentELearningCoursesApi(schoolId!),
    enabled: Boolean(schoolId && userId),
    staleTime: 30 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  })
  return { ...query, courses: query.data?.value ?? [] }
}

export function useStudentCourseWorkspace(
  schoolId?: string,
  subjectId?: string,
  classId?: string
) {
  const userId = useAuthStore((state) => state.user?.id)
  const query = useQuery({
    queryKey: studentCourseWorkspaceKey(schoolId, subjectId, classId, userId),
    queryFn: () =>
      getStudentCourseWorkspaceApi(schoolId!, subjectId!, classId!),
    enabled: Boolean(schoolId && subjectId && classId && userId),
    staleTime: 15 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  })
  return { ...query, workspace: query.data?.value }
}

export function useSaveStudentLessonProgress(input: {
  schoolId?: string
  subjectId?: string
  classId?: string
}) {
  const queryClient = useQueryClient()
  const userId = useAuthStore((state) => state.user?.id)
  return useMutation({
    mutationFn: (progress: {
      lessonId: string
      lastPositionSeconds: number
      isCompleted: boolean
    }) =>
      saveStudentLessonProgressApi({
        schoolId: input.schoolId!,
        subjectId: input.subjectId!,
        classId: input.classId!,
        ...progress,
      }),
    onSuccess: () => {
      void Promise.all([
        queryClient.invalidateQueries({
          queryKey: studentCourseWorkspaceKey(
            input.schoolId,
            input.subjectId,
            input.classId,
            userId
          ),
        }),
        queryClient.invalidateQueries({
          queryKey: studentCoursesKey(input.schoolId, userId),
        }),
        queryClient.invalidateQueries({
          queryKey: ["teacher-course-workspace"],
        }),
      ])
    },
  })
}
