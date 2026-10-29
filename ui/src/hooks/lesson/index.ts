import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  createLessonApi,
  deleteLessonApi,
  reorderLessonsApi,
  updateLessonApi,
  type CreateLessonPayloadI,
  type CreateLessonResponseI,
  type UpdateLessonPayloadI,
  type UpdateLessonResponseI,
} from "@/api/lesson.api"
import { refetchCourseGetQueries } from "@/lib/elearning-queries"

type UseCreateLessonOptions = {
  onSuccess?: (data: CreateLessonResponseI) => void
  onError?: (error: Error) => void
}

export const useDeleteLesson = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ lessonId }: { lessonId: string; courseId: string }) =>
      deleteLessonApi(lessonId),
    onSuccess: async (data, variables) => {
      await refetchCourseGetQueries(queryClient, variables.courseId)
      toast.success(data.message || "Lesson deleted")
    },
    onError: (error: Error) => toast.error(error.message || "Could not delete lesson"),
  })
}

export const useReorderLessons = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ sectionId, lessonIds }: { sectionId: string; lessonIds: string[]; courseId: string }) =>
      reorderLessonsApi(sectionId, lessonIds),
    onSuccess: async (data, variables) => {
      await refetchCourseGetQueries(queryClient, variables.courseId)
      toast.success(data.message || "Lesson order updated")
    },
    onError: (error: Error) => toast.error(error.message || "Could not reorder lessons"),
  })
}

type UseUpdateLessonOptions = {
  onSuccess?: (data: UpdateLessonResponseI) => void
  onError?: (error: Error) => void
}

export const useCreateLesson = ({
  onSuccess,
  onError,
}: UseCreateLessonOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      CreateLessonResponseI,
      Error,
      CreateLessonPayloadI & { courseId?: string }
    >({
      mutationFn: ({ courseId: _courseId, ...payload }) => {
        void _courseId
        return createLessonApi(payload)
      },
      onSuccess: async (data, variables) => {
        await refetchCourseGetQueries(queryClient, variables.courseId)
        toast.success(data.message || "Lesson created")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to create lesson")
        onError?.(err)
      },
    })

  return {
    createLesson: mutate,
    createLessonAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useUpdateLesson = ({
  onSuccess,
  onError,
}: UseUpdateLessonOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<
      UpdateLessonResponseI,
      Error,
      UpdateLessonPayloadI & { courseId?: string }
    >({
      mutationFn: ({ courseId: _courseId, ...payload }) => {
        void _courseId
        return updateLessonApi(payload)
      },
      onSuccess: async (data, variables) => {
        await refetchCourseGetQueries(queryClient, variables.courseId)
        toast.success(data.message || "Lesson updated")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to update lesson")
        onError?.(err)
      },
    })

  return {
    updateLesson: mutate,
    updateLessonAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}
