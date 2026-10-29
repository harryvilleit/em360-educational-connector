import { elearningApiClient } from "../api"
import { normalizeResponse } from "@/utils/apiResponse"
import type {
  CreateLessonPayloadI,
  CreateLessonResponseI,
  UpdateLessonPayloadI,
  UpdateLessonResponseI,
  LessonVideoPlaybackI,
  LessonVideoUploadI,
} from "./types"
import type { ApiResultI } from "@/utils/apiResponse"

export const createLessonApi = async (
  payload: CreateLessonPayloadI
): Promise<CreateLessonResponseI> => {
  const res = await elearningApiClient.post("/Lesson/Create", payload)
  return normalizeResponse<CreateLessonResponseI>(res)
}

export const updateLessonApi = async (
  payload: UpdateLessonPayloadI
): Promise<UpdateLessonResponseI> => {
  const res = await elearningApiClient.put("/Lesson/Update", payload)
  return normalizeResponse<UpdateLessonResponseI>(res)
}

export const deleteLessonApi = async (lessonId: string): Promise<ApiResultI> => {
  const res = await elearningApiClient.delete(`/Lesson/${encodeURIComponent(lessonId)}`)
  return normalizeResponse<ApiResultI>(res)
}

export const reorderLessonsApi = async (
  sectionId: string,
  lessonIds: string[]
): Promise<ApiResultI> => {
  const res = await elearningApiClient.put("/Lesson/Reorder", { sectionId, lessonIds })
  return normalizeResponse<ApiResultI>(res)
}

interface LessonVideoResultI<T> extends ApiResultI {
  message?: string
  statusCode?: number
  value: T
}

export const createLessonVideoUploadApi = async (payload: {
  sectionId: string
  fileName: string
  contentType: string
  fileSizeBytes: number
  durationSeconds?: number
}) => {
  const res = await elearningApiClient.post("/Lesson/VideoUploads", payload)
  return normalizeResponse<LessonVideoResultI<LessonVideoUploadI>>(res)
}

export const completeLessonVideoUploadApi = async (uploadId: string) => {
  const res = await elearningApiClient.post(
    `/Lesson/VideoUploads/${encodeURIComponent(uploadId)}/Complete`
  )
  return normalizeResponse<LessonVideoResultI<LessonVideoUploadI>>(res)
}

export const getLessonVideoUploadApi = async (uploadId: string) => {
  const res = await elearningApiClient.get(
    `/Lesson/VideoUploads/${encodeURIComponent(uploadId)}`
  )
  return normalizeResponse<LessonVideoResultI<LessonVideoUploadI>>(res)
}

export const getAvailableLessonVideoUploadsApi = async (sectionId: string) => {
  const res = await elearningApiClient.get("/Lesson/VideoUploads/Available", {
    params: { sectionId },
  })
  return normalizeResponse<LessonVideoResultI<LessonVideoUploadI[]>>(res)
}

export const attachLessonVideoUploadApi = async (
  lessonId: string,
  uploadId: string
): Promise<ApiResultI> => {
  const res = await elearningApiClient.put(
    `/Lesson/${encodeURIComponent(lessonId)}/VideoUpload`,
    { uploadId }
  )
  return normalizeResponse<ApiResultI>(res)
}

export const getLessonVideoUploadPlaybackApi = async (uploadId: string) => {
  const res = await elearningApiClient.get(
    `/Lesson/VideoUploads/${encodeURIComponent(uploadId)}/Playback`
  )
  return normalizeResponse<LessonVideoResultI<LessonVideoPlaybackI>>(res)
}

export const getLessonVideoPlaybackApi = async (lessonId: string) => {
  const res = await elearningApiClient.get(
    `/Lesson/${encodeURIComponent(lessonId)}/Playback`
  )
  return normalizeResponse<LessonVideoResultI<LessonVideoPlaybackI>>(res)
}

export type {
  CreateLessonPayloadI,
  CreateLessonResponseI,
  LessonI,
  LessonMaterialPayloadI,
  UpdateLessonPayloadI,
  UpdateLessonResponseI,
  LessonVideoPlaybackI,
  LessonVideoUploadI,
} from "./types"
