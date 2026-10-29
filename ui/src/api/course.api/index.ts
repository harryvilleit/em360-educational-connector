import { elearningApiClient } from "../api"
import { normalizeResponse } from "@/utils/apiResponse"
import type { ApiResultI } from "@/utils/apiResponse"
import type {
  CreateCoursePayloadI,
  CreateCourseResponseI,
  GetCourseByIdResponseI,
  TutorCoursesResponseI,
  UpdateCoursePayloadI,
  UpdateCourseResponseI,
  PublicCourseSearchParamsI,
  PublicCourseSearchResponseI,
  CoursePreviewReelResponseI,
  TutorCourseFiltersI,
} from "./types"

export const createCourseApi = async (
  payload: CreateCoursePayloadI
): Promise<CreateCourseResponseI> => {
  const res = await elearningApiClient.post("/Course/Create", payload)
  return normalizeResponse<CreateCourseResponseI>(res)
}

export const updateCourseApi = async (
  payload: UpdateCoursePayloadI
): Promise<UpdateCourseResponseI> => {
  const res = await elearningApiClient.put("/Course/Update", payload)
  return normalizeResponse<UpdateCourseResponseI>(res)
}

export const getCourseByIdApi = async (
  id: string
): Promise<GetCourseByIdResponseI> => {
  const res = await elearningApiClient.get(`/Course/GetById/${id}`)
  return normalizeResponse<GetCourseByIdResponseI>(res)
}

export const getTutorCoursesApi = async (
  params: TutorCourseFiltersI = {}
): Promise<TutorCoursesResponseI> => {
  const res = await elearningApiClient.get("/Course/TutorCourses", { params })
  return normalizeResponse<TutorCoursesResponseI>(res)
}

export const searchPublicCoursesApi = async (
  params: PublicCourseSearchParamsI = {}
): Promise<PublicCourseSearchResponseI> => {
  const res = await elearningApiClient.get("/Course/Search", { params })
  return normalizeResponse<PublicCourseSearchResponseI>(res)
}

export const getPublicCourseByIdApi = async (
  id: string
): Promise<GetCourseByIdResponseI> => {
  const res = await elearningApiClient.get(
    `/Course/Public/${encodeURIComponent(id)}`
  )
  return normalizeResponse<GetCourseByIdResponseI>(res)
}

/** Public: one-minute excerpts from the first lessons with video, for the course preview. */
export const getCoursePreviewReelApi = async (
  id: string
): Promise<CoursePreviewReelResponseI> => {
  const res = await elearningApiClient.get(
    `/Course/Public/${encodeURIComponent(id)}/PreviewReel`
  )
  return normalizeResponse<CoursePreviewReelResponseI>(res)
}

export const changeCourseStatusApi = async (
  id: string,
  status: "Published" | "Archived"
): Promise<ApiResultI> => {
  const res = await elearningApiClient.patch(
    `/Course/${encodeURIComponent(id)}/Status`,
    { status }
  )
  return normalizeResponse<ApiResultI>(res)
}

export const deleteCourseApi = async (id: string): Promise<ApiResultI> => {
  const res = await elearningApiClient.delete(
    `/Course/${encodeURIComponent(id)}`
  )
  return normalizeResponse<ApiResultI>(res)
}

export const restoreCourseApi = async (id: string): Promise<ApiResultI> => {
  const res = await elearningApiClient.post(
    `/Course/${encodeURIComponent(id)}/Restore`
  )
  return normalizeResponse<ApiResultI>(res)
}

export { CoursePricingType } from "./types"
export type {
  CreateCoursePayloadI,
  CreateCourseResponseI,
  CoursePricingType as CoursePricingTypeValue,
  CourseLessonI,
  CourseLessonMaterialI,
  CourseSectionI,
  GetCourseByIdResponseI,
  TutorCourseI,
  TutorCoursesResponseI,
  UpdateCoursePayloadI,
  UpdateCourseResponseI,
  PublicCourseSearchParamsI,
  PublicCourseSearchResponseI,
  PublicCoursePageI,
  TutorCourseFiltersI,
  CoursePreviewClipI,
  CoursePreviewReelI,
  CoursePreviewReelResponseI,
} from "./types"
