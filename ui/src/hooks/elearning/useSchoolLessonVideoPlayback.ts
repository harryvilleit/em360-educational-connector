import { useQuery } from "@tanstack/react-query"
import {
  getTeacherCourseLessonVideoPlaybackApi,
  type TeacherCourseRefI,
} from "@/api/teacherCourse.api"
import type { LessonVideoPlaybackI } from "@/api/lesson.api/types"

type SchoolLessonVideoPlaybackState = {
  playback: LessonVideoPlaybackI | null
  isLoading: boolean
  error: string
}

/**
 * Resolves a short-lived, authorised Cloudflare player URL for either assigned
 * staff or an enrolled student. The server owns the YouTube fallback decision.
 */
export function useSchoolLessonVideoPlayback(
  course: TeacherCourseRefI | undefined,
  lessonId?: string,
  videoUploadId?: string | null,
  videoUploadStatus?: "Uploading" | "Processing" | "Ready" | "Failed" | null
) {
  const enabled = Boolean(course && lessonId && videoUploadId)
  const query = useQuery({
    queryKey: ["school-lesson-video-playback", course?.schoolId, course?.subjectId,
      course?.classId, lessonId, videoUploadId],
    enabled,
    queryFn: async () => {
      const response = await getTeacherCourseLessonVideoPlaybackApi(course!, lessonId!)
      return response.value
    },
    staleTime: 0,
    gcTime: 0,
    retry: false,
    refetchInterval: (current) => {
      const status = current.state.data?.status ?? videoUploadStatus
      return status === "Processing" || status === "Uploading" ? 8000 : false
    },
  })
  const state: SchoolLessonVideoPlaybackState = {
    playback: enabled ? query.data ?? null : null,
    isLoading: enabled && query.isPending,
    error: enabled && query.error ? query.error.message : "",
  }
  return state
}
