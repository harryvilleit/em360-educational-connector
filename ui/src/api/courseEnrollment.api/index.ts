import { elearningApiClient } from "../api"
import { normalizeResponse, type ApiResultI } from "@/utils/apiResponse"

export interface CourseLearnerI {
  id: string
  userId: string
  learnerName: string
  email: string
  dateEnrolledUtc: string
  completedLessons: number
  totalLessons: number
  progressPercent: number
  status: string
}

export interface CourseLearnersResponseI extends ApiResultI {
  value: {
    items: CourseLearnerI[]
    totalItems: number
    pageNumber: number
    pageSize: number
  }
}

export async function getCourseLearnersApi(
  courseId: string, pageNumber: number, pageSize: number, signal?: AbortSignal
): Promise<CourseLearnersResponseI> {
  const response = await elearningApiClient.get(
    `/Course/${encodeURIComponent(courseId)}/Enrollments`,
    { params: { pageNumber, pageSize }, signal }
  )
  return normalizeResponse<CourseLearnersResponseI>(response)
}
