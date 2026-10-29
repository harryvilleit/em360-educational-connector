import { elearningApiClient } from "../api"
import { normalizeResponse, type ApiResultI } from "@/utils/apiResponse"
import type {
  LmsAssignment,
  LmsAssignmentType,
  LmsSubmission,
} from "@/types/elearning"
import type { CreateAssignmentPayload } from "@/types/lms-assignment-form"

export interface CourseAssignmentSubmissionDtoI {
  id: string
  userId: string
  email: string
  responseJson: string
  status: string
  score?: number | null
  suggestedScore?: number | null
  weightedScore?: number | null
  feedback?: string | null
  privateNotes?: string | null
  gradingMethod?: string | null
  approvedAtUtc?: string | null
  submittedAtUtc: string
  gradedAtUtc?: string | null
}

export interface CourseAssignmentDtoI {
  id: string
  courseId: string
  courseTitle: string
  title: string
  description: string
  type: string
  contentJson: string
  startDateUtc?: string | null
  dueDateUtc?: string | null
  durationMinutes?: number | null
  maxScore?: number | null
  weightPercent?: number | null
  status: string
  totalStudents: number
  submissions: CourseAssignmentSubmissionDtoI[]
}

export interface CourseAssignmentPlanDtoI {
  courseId: string
  totalScorePercent: number
  passScorePercent: number
  allocatedWeightPercent: number
  remainingWeightPercent: number
  isComplete: boolean
  isPublished: boolean
  assignmentCount: number
}

export interface CourseGradeResultDtoI {
  courseId: string
  courseTitle: string
  userId: string
  email: string
  totalScorePercent: number
  passScorePercent: number
  earnedScorePercent: number
  approvedWeightPercent: number
  assignmentCount: number
  gradedAssignmentCount: number
  isComplete: boolean
  hasPassed: boolean
}

interface ResultI<T> extends ApiResultI {
  message?: string
  statusCode?: number
  value: T
}

function jsonObject(value: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(value)
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed
      : {}
  } catch {
    return {}
  }
}

function mapSubmission(
  dto: CourseAssignmentSubmissionDtoI,
  assignmentId: string,
  assignmentType: LmsAssignmentType
): LmsSubmission {
  const response = jsonObject(dto.responseJson) as Partial<LmsSubmission>
  const status = dto.status.toLowerCase()
  return {
    ...response,
    id: dto.id,
    assignmentId,
    studentName: response.studentName || dto.email,
    studentEmail: dto.email,
    submittedAt: dto.submittedAtUtc,
    type: (response.type as LmsAssignmentType) || assignmentType,
    status:
      status.includes("pendingapproval") || status.includes("pending_approval")
        ? "pending_approval"
        : status.includes("grade")
          ? "graded"
          : status.includes("reopen")
            ? "resubmit_requested"
            : "submitted",
    score: dto.score ?? undefined,
    suggestedScore: dto.suggestedScore ?? undefined,
    weightedScore: dto.weightedScore ?? undefined,
    feedback: dto.feedback ?? undefined,
    privateNotes: dto.privateNotes ?? undefined,
    gradingMethod: dto.gradingMethod ?? undefined,
    approvedAt: dto.approvedAtUtc ?? undefined,
  }
}

export function mapCourseAssignment(dto: CourseAssignmentDtoI): LmsAssignment {
  const content = jsonObject(dto.contentJson) as Partial<LmsAssignment>
  const type = dto.type as LmsAssignmentType
  const status = dto.status.toLowerCase()
  return {
    ...content,
    id: dto.id,
    title: dto.title,
    courseId: dto.courseId,
    courseTitle: dto.courseTitle,
    type,
    description: dto.description,
    dueDate: dto.dueDateUtc ?? "",
    startDate: dto.startDateUtc ?? undefined,
    endDate: dto.dueDateUtc ?? undefined,
    durationMinutes: dto.durationMinutes ?? undefined,
    status: status.includes("draft")
      ? "draft"
      : status.includes("closed")
        ? "closed"
        : "open",
    maxScore: dto.maxScore ?? undefined,
    weightPercent: dto.weightPercent ?? undefined,
    submissions: (dto.submissions ?? []).map((item) =>
      mapSubmission(item, dto.id, type)
    ),
    totalStudents: dto.totalStudents,
    createdBy: "Tutor",
  }
}

function toRequest(payload: CreateAssignmentPayload) {
  return {
    courseId: payload.courseId,
    title: payload.title,
    description: payload.description,
    type: payload.type,
    contentJson: JSON.stringify(payload),
    startDateUtc: payload.startDate
      ? new Date(payload.startDate).toISOString()
      : null,
    dueDateUtc:
      payload.endDate || payload.dueDate
        ? new Date(
            `${(payload.endDate || payload.dueDate).slice(0, 10)}T23:59:59.999Z`
          ).toISOString()
        : null,
    durationMinutes: payload.durationMinutes ?? null,
    maxScore: payload.maxScore ?? null,
    weightPercent: payload.weightPercent ?? null,
    status: "Draft",
  }
}

export async function createAssignmentApi(payload: CreateAssignmentPayload) {
  const response = await elearningApiClient.post(
    "/Assignment",
    toRequest(payload)
  )
  return normalizeResponse<ResultI<CourseAssignmentDtoI>>(response)
}

export async function updateAssignmentApi(
  id: string,
  payload: CreateAssignmentPayload
) {
  const response = await elearningApiClient.put(
    `/Assignment/${encodeURIComponent(id)}`,
    toRequest(payload)
  )
  return normalizeResponse<ResultI<CourseAssignmentDtoI>>(response)
}

export async function getCourseAssignmentsApi(courseId: string) {
  const response = await elearningApiClient.get(
    `/Assignment/Course/${encodeURIComponent(courseId)}`
  )
  return normalizeResponse<ResultI<CourseAssignmentDtoI[]>>(response)
}

export async function getMyAssignmentsApi() {
  const response = await elearningApiClient.get("/Assignment/Mine")
  return normalizeResponse<ResultI<CourseAssignmentDtoI[]>>(response)
}

export async function submitAssignmentApi(
  assignmentId: string,
  response: Record<string, unknown>
) {
  const result = await elearningApiClient.post(
    `/Assignment/${encodeURIComponent(assignmentId)}/Submit`,
    { responseJson: JSON.stringify(response) }
  )
  return normalizeResponse<ResultI<CourseAssignmentSubmissionDtoI>>(result)
}

export async function gradeAssignmentSubmissionApi(
  assignmentId: string,
  submissionId: string,
  score: number,
  feedback?: string,
  privateNotes?: string,
  approve = true
) {
  const response = await elearningApiClient.patch(
    `/Assignment/${encodeURIComponent(assignmentId)}/Submissions/${encodeURIComponent(submissionId)}/Grade`,
    { score, feedback, privateNotes, approve }
  )
  return normalizeResponse<ResultI<CourseAssignmentSubmissionDtoI>>(response)
}

export async function reopenAssignmentSubmissionApi(
  assignmentId: string,
  submissionId: string
) {
  const response = await elearningApiClient.patch(
    `/Assignment/${encodeURIComponent(assignmentId)}/Submissions/${encodeURIComponent(submissionId)}/Reopen`
  )
  return normalizeResponse<ApiResultI>(response)
}

export async function getCourseAssignmentPlanApi(courseId: string) {
  const response = await elearningApiClient.get(
    `/Assignment/Course/${encodeURIComponent(courseId)}/Plan`
  )
  return normalizeResponse<ResultI<CourseAssignmentPlanDtoI>>(response)
}

export async function publishCourseAssignmentPlanApi(courseId: string) {
  const response = await elearningApiClient.post(
    `/Assignment/Course/${encodeURIComponent(courseId)}/Publish`
  )
  return normalizeResponse<ResultI<CourseAssignmentPlanDtoI>>(response)
}

export async function deleteAssignmentApi(assignmentId: string) {
  const response = await elearningApiClient.delete(
    `/Assignment/${encodeURIComponent(assignmentId)}`
  )
  return normalizeResponse<ApiResultI>(response)
}

export async function autoGradeAssignmentSubmissionApi(
  assignmentId: string,
  submissionId: string
) {
  const response = await elearningApiClient.post(
    `/Assignment/${encodeURIComponent(assignmentId)}/Submissions/${encodeURIComponent(submissionId)}/AutoGrade`
  )
  return normalizeResponse<ResultI<CourseAssignmentSubmissionDtoI>>(response)
}

export async function approveAssignmentSubmissionApi(
  assignmentId: string,
  submissionId: string
) {
  const response = await elearningApiClient.patch(
    `/Assignment/${encodeURIComponent(assignmentId)}/Submissions/${encodeURIComponent(submissionId)}/Approve`
  )
  return normalizeResponse<ResultI<CourseAssignmentSubmissionDtoI>>(response)
}

export async function getMyCourseGradeApi(courseId: string) {
  const response = await elearningApiClient.get(
    `/Assignment/Course/${encodeURIComponent(courseId)}/MyResult`
  )
  return normalizeResponse<ResultI<CourseGradeResultDtoI>>(response)
}

export async function getCourseGradesApi(courseId: string) {
  const response = await elearningApiClient.get(
    `/Assignment/Course/${encodeURIComponent(courseId)}/Results`
  )
  return normalizeResponse<ResultI<CourseGradeResultDtoI[]>>(response)
}
