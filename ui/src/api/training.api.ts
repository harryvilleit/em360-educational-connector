import apiClient from "./api"
import { normalizeResponse, type ApiResultI } from "@/utils/apiResponse"
import type {
  AiCourseBrief,
  AiCourseContent,
} from "./digitalSchoolAiCourse.api"
export const trainingMenus = {
  learn: "/dashboard/training",
  courses: "/dashboard/training-courses",
  assignments: "/dashboard/training-assignments",
  rules: "/dashboard/training-rules",
} as const
export interface TrainingCourse {
  id: string
  title: string
  revision: string
  published: boolean
  passPercent: number
  lessonCount: number
  brief: AiCourseBrief
  content: AiCourseContent | null
}
export interface TrainingStaff {
  userId: string
  name: string
  email: string
}
export interface TrainingLesson {
  title: string
  outcomes: string[]
  explanation: string
  workedExample: string
  activity: string
  worksheet: string
  questions: { prompt: string; options: string[] }[]
  books: { title: string; author: string; reason: string }[]
}
export interface TrainingAssignment {
  sourceRuleId?: string | null
  sourceRuleName?: string | null
  id: string
  courseId: string
  courseTitle: string
  userId: string
  revision: string
  dueAtUtc: string
  completedAtUtc: string | null
  lessonCount: number
  completedLessons: number[]
  progressPercent: number
  passPercent: number
  status: string
  content: {
    overview: string
    sections: { title: string; lessons: TrainingLesson[] }[]
  } | null
}
interface Response<T> extends ApiResultI {
  value: T
}
const cfg = (schoolId: string) => ({ params: { schoolId } })
const value = <T>(response: unknown) =>
  normalizeResponse<Response<T>>(response).value
export const trainingApi = {
  courses: async (s: string, forAssignment = false) =>
    value<TrainingCourse[]>(
      await apiClient.get("/Training/Courses", {
        params: { schoolId: s, forAssignment },
      })
    ),
  course: async (s: string, id: string) =>
    value<TrainingCourse>(
      await apiClient.get(`/Training/Courses/${encodeURIComponent(id)}`, cfg(s))
    ),
  create: async (s: string, title: string) =>
    value<TrainingCourse>(
      await apiClient.post("/Training/Courses", { title }, cfg(s))
    ),
  save: async (s: string, course: TrainingCourse, published: boolean) =>
    value<TrainingCourse>(
      await apiClient.put(
        `/Training/Courses/${encodeURIComponent(course.id)}`,
        {
          revision: course.revision,
          brief: course.brief,
          content: course.content,
          passPercent: course.passPercent,
          published,
        },
        cfg(s)
      )
    ),
  generate: async (
    s: string,
    course: TrainingCourse,
    lessonIndex: number | null
  ) =>
    value<TrainingCourse>(
      await apiClient.post(
        `/Training/Courses/${encodeURIComponent(course.id)}/Generate`,
        { revision: course.revision, lessonIndex },
        { ...cfg(s), timeout: 180_000 }
      )
    ),
  staff: async (s: string) =>
    value<TrainingStaff[]>(await apiClient.get("/Training/Staff", cfg(s))),
  assignments: async (s: string, mine = true) =>
    value<TrainingAssignment[]>(
      await apiClient.get("/Training/Assignments", {
        params: { schoolId: s, mine },
      })
    ),
  assignment: async (s: string, id: string) =>
    value<TrainingAssignment>(
      await apiClient.get(
        `/Training/Assignments/${encodeURIComponent(id)}`,
        cfg(s)
      )
    ),
  assign: async (
    s: string,
    courseId: string,
    userIds: string[],
    dueAtUtc: string
  ) =>
    value<number>(
      await apiClient.post(
        "/Training/Assignments",
        { courseId, userIds, dueAtUtc },
        cfg(s)
      )
    ),
  complete: async (
    s: string,
    a: TrainingAssignment,
    lessonIndex: number,
    answers: number[]
  ) =>
    value<{
      passed: boolean
      scorePercent: number
      message: string
      assignment: TrainingAssignment
    }>(
      await apiClient.post(
        `/Training/Assignments/${encodeURIComponent(a.id)}/CompleteLesson`,
        { revision: a.revision, lessonIndex, answers },
        cfg(s)
      )
    ),
  cancel: async (s: string, a: TrainingAssignment) =>
    value<boolean>(
      await apiClient.delete(
        `/Training/Assignments/${encodeURIComponent(a.id)}`,
        { params: { schoolId: s, revision: a.revision } }
      )
    ),
}
