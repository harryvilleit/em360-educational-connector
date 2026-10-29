import { elearningApiClient } from "../api"
import { normalizeResponse } from "@/utils/apiResponse"
import type {
  CreateSectionPayloadI,
  CreateSectionResponseI,
  SectionsByCourseIdResponseI,
  UpdateSectionPayloadI,
  UpdateSectionResponseI,
} from "./types"
import type { ApiResultI } from "@/utils/apiResponse"

export const createSectionApi = async (
  payload: CreateSectionPayloadI
): Promise<CreateSectionResponseI> => {
  const res = await elearningApiClient.post("/Section/Create", payload)
  return normalizeResponse<CreateSectionResponseI>(res)
}

export const updateSectionApi = async (
  payload: UpdateSectionPayloadI
): Promise<UpdateSectionResponseI> => {
  const res = await elearningApiClient.put("/Section/Update", payload)
  return normalizeResponse<UpdateSectionResponseI>(res)
}

export const deleteSectionApi = async (sectionId: string): Promise<ApiResultI> => {
  const res = await elearningApiClient.delete(`/Section/${encodeURIComponent(sectionId)}`)
  return normalizeResponse<ApiResultI>(res)
}

export const getSectionsByCourseIdApi = async (
  courseId: string
): Promise<SectionsByCourseIdResponseI> => {
  const res = await elearningApiClient.get(`/Section/ByCourseId/${courseId}`)
  return normalizeResponse<SectionsByCourseIdResponseI>(res)
}

export type {
  CreateSectionPayloadI,
  CreateSectionResponseI,
  SectionI,
  SectionLessonI,
  SectionLessonMaterialI,
  SectionsByCourseIdResponseI,
  SectionWithLessonsI,
  UpdateSectionPayloadI,
  UpdateSectionResponseI,
} from "./types"
