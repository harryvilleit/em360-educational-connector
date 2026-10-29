import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/store/auth.store"
import { toast } from "sonner"
import {
  createCourseApi,
  changeCourseStatusApi,
  deleteCourseApi,
  getCourseByIdApi,
  getPublicCourseByIdApi,
  getTutorCoursesApi,
  searchPublicCoursesApi,
  restoreCourseApi,
  updateCourseApi,
  type CreateCoursePayloadI,
  type CreateCourseResponseI,
  type GetCourseByIdResponseI,
  type PublicCourseSearchParamsI,
  type PublicCourseSearchResponseI,
  type TutorCoursesResponseI,
  type UpdateCoursePayloadI,
  type UpdateCourseResponseI,
} from "@/api/course.api"
import { mapTutorCourseToLmsCourse } from "@/lib/elearning-mappers"
import { refetchCourseGetQueries } from "@/lib/elearning-queries"
import { queryKeys } from "@/utils/queryKeys"

type UseCreateCourseOptions = {
  onSuccess?: (data: CreateCourseResponseI) => void
  onError?: (error: Error) => void
}

type UseUpdateCourseOptions = {
  onSuccess?: (data: UpdateCourseResponseI) => void
  onError?: (error: Error) => void
}

export const useCreateCourse = ({
  onSuccess,
  onError,
}: UseCreateCourseOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<CreateCourseResponseI, Error, CreateCoursePayloadI>({
      mutationFn: createCourseApi,
      onSuccess: async (data) => {
        await queryClient.invalidateQueries({
          queryKey: [queryKeys.tutorCourses],
        })
        toast.success(data.message || "Course created successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to create course")
        onError?.(err)
      },
    })

  return {
    createCourse: mutate,
    createCourseAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useUpdateCourse = ({
  onSuccess,
  onError,
}: UseUpdateCourseOptions = {}) => {
  const queryClient = useQueryClient()

  const { mutate, mutateAsync, isPending, isSuccess, isError, error, reset } =
    useMutation<UpdateCourseResponseI, Error, UpdateCoursePayloadI>({
      mutationFn: updateCourseApi,
      onSuccess: async (data, variables) => {
        await refetchCourseGetQueries(queryClient, variables.id)
        toast.success(data.message || "Course updated successfully")
        onSuccess?.(data)
      },
      onError: (err) => {
        toast.error(err?.message ?? "Failed to update course")
        onError?.(err)
      },
    })

  return {
    updateCourse: mutate,
    updateCourseAsync: mutateAsync,
    isPending,
    isSuccess,
    isError,
    error,
    reset,
  }
}

export const useCourseById = (courseId?: string, enabled = true) => {
  const {
    data,
    isPending,
    isError,
    error,
    isSuccess,
    refetch,
    isFetching,
    dataUpdatedAt,
  } = useQuery<GetCourseByIdResponseI>({
    queryKey: [queryKeys.courseById, courseId],
    queryFn: () => getCourseByIdApi(courseId!),
    enabled: enabled && Boolean(courseId),
    staleTime: 30 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  const course = data?.value ?? null
  const lmsCourse = course ? mapTutorCourseToLmsCourse(course) : null

  return {
    course,
    lmsCourse,
    dataUpdatedAt,
    isLoading: isPending,
    isPending,
    isFetching,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useTutorCourses = (enabled = true, includeDeleted = false) => {
  const { data, isPending, isError, error, isSuccess, refetch, isFetching } =
    useQuery<TutorCoursesResponseI>({
      queryKey: [queryKeys.tutorCourses, { includeDeleted }],
      queryFn: () => getTutorCoursesApi({ includeDeleted }),
      enabled,
      staleTime: 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })

  const tutorCourses = data?.value ?? []
  const courses = tutorCourses.map(mapTutorCourseToLmsCourse)

  return {
    raw: tutorCourses,
    courses,
    isLoading: isPending,
    isPending,
    isFetching,
    isError,
    error,
    isSuccess,
    refetch,
  }
}

export const useChangeCourseStatus = () => {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string
      status: "Published" | "Archived"
    }) => changeCourseStatusApi(id, status),
    onSuccess: async (data, variables) => {
      await Promise.all([
        refetchCourseGetQueries(queryClient, variables.id),
        queryClient.invalidateQueries({ queryKey: [queryKeys.tutorCourses] }),
        queryClient.invalidateQueries({ queryKey: [queryKeys.publicCourses] }),
      ])
      toast.success(
        data.message || `Course ${variables.status.toLowerCase()} successfully`
      )
    },
    onError: (error: Error) =>
      toast.error(error.message || "Could not change the course status"),
  })
  return mutation
}

export const useDeleteCourse = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteCourseApi,
    onSuccess: async (data) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [queryKeys.tutorCourses] }),
        queryClient.invalidateQueries({ queryKey: [queryKeys.publicCourses] }),
      ])
      toast.success(data.message || "Course moved to deleted courses")
    },
    onError: (error: Error) =>
      toast.error(error.message || "Could not delete the course"),
  })
}

export const useRestoreCourse = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: restoreCourseApi,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: [queryKeys.tutorCourses],
      })
      toast.success(data.message || "Course restored as draft")
    },
    onError: (error: Error) =>
      toast.error(error.message || "Could not restore the course"),
  })
}

export const usePublicCourses = (
  filters: PublicCourseSearchParamsI = {},
  enabled = true
) => {
  const query = useQuery<PublicCourseSearchResponseI>({
    queryKey: ["lms", "public-courses", filters],
    queryFn: () => searchPublicCoursesApi(filters),
    enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  })
  const raw = query.data?.value?.items ?? []
  return {
    ...query,
    raw,
    courses: raw.map(mapTutorCourseToLmsCourse),
    totalItems: query.data?.value?.totalItems ?? 0,
  }
}

export const usePublicCourseById = (courseId?: string) => {
  const viewerId = useAuthStore((state) => state.token ? state.user?.id : null)
  const query = useQuery<GetCourseByIdResponseI>({
    queryKey: ["lms", "public-course", courseId, viewerId ?? "guest"],
    queryFn: () => getPublicCourseByIdApi(courseId!),
    enabled: Boolean(courseId),
    staleTime: 2 * 60 * 1000,
  })
  const raw = query.data?.value ?? null
  return {
    ...query,
    raw,
    course: raw ? mapTutorCourseToLmsCourse(raw) : null,
  }
}
