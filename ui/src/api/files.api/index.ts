import { elearningApiClient } from "../api"
import { normalizeResponse } from "@/utils/apiResponse"
import type { ApiResultI } from "@/utils/apiResponse"
import {
  createUploadRequestConfig,
  type UploadRequestOptions,
} from "@/api/upload-request"
import {
  extractUploadUrl,
  type FileUploadPolicyResponseI,
  type UploadFileResponseI,
} from "./types"

export const getFileUploadPolicyApi =
  async (): Promise<FileUploadPolicyResponseI> => {
    const res = await elearningApiClient.get("/Files/UploadPolicy")
    return normalizeResponse<FileUploadPolicyResponseI>(res)
  }

export const uploadFileApi = async (
  file: File,
  options: UploadRequestOptions = {}
): Promise<UploadFileResponseI> => {
  const formData = new FormData()
  formData.append("file", file)

  const res = await elearningApiClient.post("/Files/Upload", formData, {
    ...createUploadRequestConfig(file, options),
  })

  return normalizeResponse<UploadFileResponseI>(res)
}

export const uploadFileAndGetUrl = async (
  file: File,
  options: UploadRequestOptions = {}
): Promise<string> => {
  const response = await uploadFileApi(file, options)
  return extractUploadUrl(response)
}

export type RecoverableLessonMaterialI = {
  id: string
  fileName: string
  fileUrl: string
  contentType: string
  sizeBytes: number
  dateCreatedUtc: string
}

type RecoverableLessonMaterialResponseI = ApiResultI & { value: RecoverableLessonMaterialI }
type AvailableLessonMaterialsResponseI = ApiResultI & { value: RecoverableLessonMaterialI[] }

export async function uploadLessonMaterialApi(
  sectionId: string,
  file: File,
  options: UploadRequestOptions = {}
): Promise<RecoverableLessonMaterialResponseI> {
  const formData = new FormData()
  formData.append("sectionId", sectionId)
  formData.append("file", file)
  const res = await elearningApiClient.post("/Lesson/MaterialUploads", formData, {
    ...createUploadRequestConfig(file, options),
  })
  return normalizeResponse<RecoverableLessonMaterialResponseI>(res)
}

export async function listAvailableLessonMaterialsApi(
  sectionId: string
): Promise<AvailableLessonMaterialsResponseI> {
  const res = await elearningApiClient.get("/Lesson/MaterialUploads/Available", {
    params: { sectionId },
  })
  return normalizeResponse<AvailableLessonMaterialsResponseI>(res)
}

export const uploadLiveClassCoverAndGetUrl = async (
  file: File
): Promise<string> => {
  const formData = new FormData()
  formData.append("file", file)
  const res = await elearningApiClient.post(
    "/Files/Images/LiveClassCover",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  )
  return extractUploadUrl(normalizeResponse<UploadFileResponseI>(res))
}

export const uploadConferenceCoverAndGetUrl = async (
  file: File
): Promise<string> => {
  const formData = new FormData()
  formData.append("file", file)
  const res = await elearningApiClient.post(
    "/Files/Images/ConferenceCover",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  )
  return extractUploadUrl(normalizeResponse<UploadFileResponseI>(res))
}

export type {
  FileUploadPolicyI,
  FileUploadPolicyResponseI,
  UploadFileResponseI,
  UploadFileValue,
} from "./types"
export { extractUploadUrl } from "./types"
export {
  getFileUploadLimit,
  getMaterialUploadLimitLabel,
  isExtensionAllowedByUploadPolicy,
} from "./upload-policy"
