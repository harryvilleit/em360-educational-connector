import apiClient from "@/api/api"
import { normalizeResponse, type ApiResultI } from "@/utils/apiResponse"

export interface ParentCourse {
  subjectId: string
  subjectName: string
  classId: string
  className: string
  teacherName: string | null
  lessonCount: number
  completedLessonCount: number
  progressPercent: number
}

export interface ParentCourseDetail extends Omit<ParentCourse, "subjectId" | "classId"> {
  sections: {
    id: string
    title: string
    sortOrder: number
    lessons: {
      id: string
      title: string
      contentType: string
      durationMinutes: number
      description: string | null
      htmlContent?: string | null
      hasVideo: boolean
      isCompleted: boolean
      materials: { id: string; displayName: string; fileUrl: string; contentType: string }[]
    }[]
  }[]
  courseMaterials: { id: string; originalFileName: string; fileUrl: string; contentType: string }[]
  recordings: { id: string; title: string; fileUrl: string | null; startedAtUtc: string }[]
  assignments: {
    id: string
    title: string
    dueDateUtc: string
    assignmentType: string
    instructions: string | null
    status: string
    submittedAtUtc: string | null
    score: number | null
    markedAttemptNumber: number | null
    feedback: string[]
  }[]
}

interface ParentCourseContext {
  schoolId: string
  studentId: string
  sessionId: string
  termId: string
}

const childPath = ({ schoolId, studentId }: ParentCourseContext) =>
  `/parent-courses/${encodeURIComponent(schoolId)}/children/${encodeURIComponent(studentId)}`

export async function getParentCourses(
  context: ParentCourseContext & { classId?: string }
): Promise<ParentCourse[]> {
  const response = await apiClient.get(childPath(context), {
    params: { sessionId: context.sessionId, termId: context.termId, classId: context.classId },
  })
  return normalizeResponse<ApiResultI & { value: ParentCourse[] }>(response).value
}

export async function getParentCourse(
  context: ParentCourseContext & { classId: string; subjectId: string }
): Promise<ParentCourseDetail> {
  const response = await apiClient.get(
    `${childPath(context)}/${encodeURIComponent(context.classId)}/${encodeURIComponent(context.subjectId)}`,
    { params: { sessionId: context.sessionId, termId: context.termId } }
  )
  return normalizeResponse<ApiResultI & { value: ParentCourseDetail }>(response).value
}

export async function getParentLessonPlayback(
  context: ParentCourseContext & { classId: string; subjectId: string; lessonId: string }
): Promise<{ source: string; playbackUrl: string; status: string }> {
  const response = await apiClient.get(
    `${childPath(context)}/${encodeURIComponent(context.classId)}/${encodeURIComponent(context.subjectId)}/lessons/${encodeURIComponent(context.lessonId)}/playback`,
    { params: { sessionId: context.sessionId, termId: context.termId } }
  )
  return normalizeResponse<ApiResultI & { value: { source: string; playbackUrl: string; status: string } }>(response).value
}
