import apiClient from "./api"
import type { TeacherCourseRefI } from "./teacherCourse.api"
import { normalizeResponse, type ApiResultI } from "@/utils/apiResponse"

export interface AiCourseBrief {
  title: string
  topic: string
  educationLevel: string
  countryCode: string
  curriculumStandard: string
  languageCode: string
  learningGoals: string
  sectionCount: number
  lessonsPerSection: number
  lessonDurationMinutes: number
  questionsPerLesson: number
  includeEssay: boolean
}
export interface AiBook {
  title: string
  author: string
  reason: string
  verified: boolean
  isbn?: string | null
  catalogueUrl?: string | null
}
export interface AiChoiceQuestion {
  prompt: string
  options: string[]
  correctOption: number
  explanation: string
}
export interface AiEssayQuestion {
  prompt: string
  referenceAnswer: string
  rubric: { name: string; description: string; points: number }[]
}
export interface AiLessonContent {
  explanation: string
  workedExample: string
  activity: string
  worksheet: string
  questions: AiChoiceQuestion[]
  essay?: AiEssayQuestion | null
  books: AiBook[]
}
export interface AiCourseLesson {
  title: string
  outcomes: string[]
  content?: AiLessonContent | null
}
export interface AiCourseContent {
  overview: string
  sections: { title: string; lessons: AiCourseLesson[] }[]
}
export interface AiCourseDraft {
  id: string
  revision: string
  state:
    | "queued"
    | "generating"
    | "outlineReady"
    | "ready"
    | "failed"
    | "cancelled"
    | "imported"
  stage: string
  failureMessage?: string | null
  brief: AiCourseBrief
  content: AiCourseContent
  completedLessons: number
  totalLessons: number
  createdAtUtc: string
  updatedAtUtc: string
  importResult?: {
    sectionIds: string[]
    assignmentIds: string[]
    materialUrl: string
  } | null
}
interface Response<T> extends ApiResultI {
  value: T
}
const path = (c: TeacherCourseRefI) =>
  `/ELearning/Courses/${encodeURIComponent(c.subjectId)}/${encodeURIComponent(c.classId)}/AiCourse`
const config = (c: TeacherCourseRefI) => ({
  params: { schoolId: c.schoolId },
  timeout: 90_000,
})
export const aiCourseKey = (c: TeacherCourseRefI) => [
  "digital-school-ai-course",
  c.schoolId,
  c.subjectId,
  c.classId,
]
export async function listAiCourseDrafts(
  c: TeacherCourseRefI
): Promise<AiCourseDraft[]> {
  return normalizeResponse<Response<AiCourseDraft[]>>(
    await apiClient.get(path(c), config(c))
  ).value
}
export async function getAiCourseDraft(
  c: TeacherCourseRefI,
  id: string
): Promise<AiCourseDraft> {
  return normalizeResponse<Response<AiCourseDraft>>(
    await apiClient.get(`${path(c)}/${id}`, config(c))
  ).value
}
export async function createAiCourseDraft(
  c: TeacherCourseRefI,
  brief: AiCourseBrief,
  requestKey: string
): Promise<AiCourseDraft> {
  return normalizeResponse<Response<AiCourseDraft>>(
    await apiClient.post(path(c), { brief, requestKey }, config(c))
  ).value
}
export async function saveAiCourseDraft(
  c: TeacherCourseRefI,
  d: AiCourseDraft,
  content: AiCourseContent
): Promise<AiCourseDraft> {
  return normalizeResponse<Response<AiCourseDraft>>(
    await apiClient.put(
      `${path(c)}/${d.id}`,
      { revision: d.revision, content },
      config(c)
    )
  ).value
}
export async function actOnAiCourseDraft(
  c: TeacherCourseRefI,
  d: AiCourseDraft,
  action: "Generate" | "Cancel" | "Retry" | "Import",
  extra: Record<string, unknown> = {}
): Promise<AiCourseDraft> {
  return normalizeResponse<Response<AiCourseDraft>>(
    await apiClient.post(
      `${path(c)}/${d.id}/${action}`,
      { revision: d.revision, ...extra },
      config(c)
    )
  ).value
}
