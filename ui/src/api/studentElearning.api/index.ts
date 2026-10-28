import apiClient from "../api"
import { normalizeResponse } from "@/utils/apiResponse"
import type {
  StudentAssignmentAttemptResponseI,
  StudentCourseWorkspaceResponseI,
  StudentCoursesResponseI,
  StudentLessonProgressResponseI,
  StudentLessonVideoPlaybackResponseI,
  StudentMutationResponseI,
  StudentSavedAnswerI,
  StudentSnapshotResponseI,
  StudentVoiceAnswerResponseI,
  StudentVisualPageResponseI,
} from "./types"

function studentCoursePath(subjectId: string, classId: string) {
  return `/ELearning/Student/Courses/${encodeURIComponent(subjectId)}/${encodeURIComponent(classId)}`
}

export async function getStudentELearningCoursesApi(
  schoolId: string
): Promise<StudentCoursesResponseI> {
  const res = await apiClient.get("/ELearning/Student/Courses", {
    params: { schoolId },
  })
  return normalizeResponse<StudentCoursesResponseI>(res)
}

export async function getStudentCourseWorkspaceApi(
  schoolId: string,
  subjectId: string,
  classId: string
): Promise<StudentCourseWorkspaceResponseI> {
  const res = await apiClient.get(
    `${studentCoursePath(subjectId, classId)}/Workspace`,
    {
      params: { schoolId },
    }
  )
  return normalizeResponse<StudentCourseWorkspaceResponseI>(res)
}

export async function saveStudentLessonProgressApi(input: {
  schoolId: string
  subjectId: string
  classId: string
  lessonId: string
  lastPositionSeconds: number
  isCompleted: boolean
}): Promise<StudentLessonProgressResponseI> {
  const res = await apiClient.put(
    `${studentCoursePath(input.subjectId, input.classId)}/Lessons/${encodeURIComponent(input.lessonId)}/Progress`,
    {
      lastPositionSeconds: input.lastPositionSeconds,
      isCompleted: input.isCompleted,
    },
    { params: { schoolId: input.schoolId } }
  )
  return normalizeResponse<StudentLessonProgressResponseI>(res)
}

export async function getStudentLessonVideoPlaybackApi(input: {
  schoolId: string
  subjectId: string
  classId: string
  lessonId: string
}): Promise<StudentLessonVideoPlaybackResponseI> {
  const res = await apiClient.get(
    `/ELearning/Courses/${encodeURIComponent(input.subjectId)}/${encodeURIComponent(input.classId)}/Lessons/${encodeURIComponent(input.lessonId)}/Playback`,
    { params: { schoolId: input.schoolId } }
  )
  return normalizeResponse<StudentLessonVideoPlaybackResponseI>(res)
}

export async function startStudentAssignmentApi(
  schoolId: string,
  assignmentId: string
): Promise<StudentAssignmentAttemptResponseI> {
  const res = await apiClient.post(
    `/ELearning/Student/Assignments/${encodeURIComponent(assignmentId)}/Attempts`,
    undefined,
    { params: { schoolId } }
  )
  return normalizeResponse<StudentAssignmentAttemptResponseI>(res)
}

export async function saveStudentAssignmentAnswersApi(
  schoolId: string,
  attemptId: string,
  answers: StudentSavedAnswerI[]
): Promise<StudentMutationResponseI> {
  const res = await apiClient.put(
    `/ELearning/Student/Assignments/Attempts/${encodeURIComponent(attemptId)}/Answers`,
    { answers },
    { params: { schoolId } }
  )
  return normalizeResponse<StudentMutationResponseI>(res)
}

export async function submitStudentAssignmentApi(
  schoolId: string,
  attemptId: string
): Promise<StudentAssignmentAttemptResponseI> {
  const res = await apiClient.post(
    `/ELearning/Student/Assignments/Attempts/${encodeURIComponent(attemptId)}/Submit`,
    undefined,
    { params: { schoolId } }
  )
  return normalizeResponse<StudentAssignmentAttemptResponseI>(res)
}

export async function endStudentAssignmentApi(
  schoolId: string,
  attemptId: string,
  reason:
    | "tab_leave"
    | "timer_expired"
    | "camera_denied"
    | "network_failure"
    | "manual_exit"
): Promise<StudentMutationResponseI> {
  const res = await apiClient.post(
    `/ELearning/Student/Assignments/Attempts/${encodeURIComponent(attemptId)}/End`,
    { reason },
    { params: { schoolId } }
  )
  return normalizeResponse<StudentMutationResponseI>(res)
}

export async function uploadStudentAssignmentSnapshotApi(
  schoolId: string,
  attemptId: string,
  file: File
): Promise<StudentSnapshotResponseI> {
  const formData = new FormData()
  formData.append("file", file)
  const res = await apiClient.post(
    `/ELearning/Student/Assignments/Attempts/${encodeURIComponent(attemptId)}/Snapshots`,
    formData,
    { params: { schoolId } }
  )
  return normalizeResponse<StudentSnapshotResponseI>(res)
}

export async function uploadStudentVoiceAnswerApi(
  schoolId: string,
  attemptId: string,
  questionId: string,
  file: File
): Promise<StudentVoiceAnswerResponseI> {
  const formData = new FormData()
  formData.append("file", file)
  const res = await apiClient.post(
    `/ELearning/Student/Assignments/Attempts/${encodeURIComponent(attemptId)}/Questions/${encodeURIComponent(questionId)}/Voice`,
    formData,
    { params: { schoolId } }
  )
  return normalizeResponse<StudentVoiceAnswerResponseI>(res)
}

export async function uploadStudentVisualPageApi(
  schoolId: string,
  attemptId: string,
  questionId: string,
  file: File
): Promise<StudentVisualPageResponseI> {
  const formData = new FormData()
  formData.append("file", file)
  const res = await apiClient.post(
    `/ELearning/Student/Assignments/Attempts/${encodeURIComponent(attemptId)}/Questions/${encodeURIComponent(questionId)}/VisualPages`,
    formData,
    { params: { schoolId } }
  )
  return normalizeResponse<StudentVisualPageResponseI>(res)
}

export type * from "./types"
