import type { ApiResultI } from "@/utils/apiResponse"

export interface LessonMaterialPayloadI {
  
  fileName: string
  fileUrl: string
}

export interface CreateLessonPayloadI {
  sectionId: string
  title: string
  shortDescription: string
  durationInMinutes: number
  sortOrder: number
  videoUrl: string
  embedUrl: string
  videoUploadId?: string
  content: string
  materials: LessonMaterialPayloadI[]
}

export interface UpdateLessonPayloadI {
  id: string
  title: string
  shortDescription: string
  durationInMinutes: number
  sortOrder: number
  videoUrl: string
  embedUrl: string
  videoUploadId?: string
  content: string
  materials: LessonMaterialPayloadI[]
}

export interface LessonI {
  id: string
  sectionId: string
  title: string
  shortDescription: string
  durationInMinutes: number
  sortOrder: number
  videoUrl: string
  embedUrl: string
  videoUploadId?: string
  videoUploadFileName?: string
  videoUploadSizeBytes?: number
  videoUploadStatus?: "Uploading" | "Processing" | "Ready" | "Failed"
  content: string
  materials: Array<{
    id?: string
    lessonId?: string
    fileName: string
    fileUrl: string
  }>
}

export interface CreateLessonResponseI extends ApiResultI {
  message?: string
  statusCode?: number
  value?: LessonI | string | null
}

export interface UpdateLessonResponseI extends ApiResultI {
  message?: string
  statusCode?: number
  value?: LessonI | string | null
}

export interface LessonVideoUploadI {
  id: string
  cloudflareStreamUid: string
  fileName: string
  fileSizeBytes: number
  status: "Uploading" | "Processing" | "Ready" | "Failed"
  processingPercent: number
  failureReason?: string | null
  uploadUrl?: string | null
  uploadUrlExpiresAtUtc?: string | null
  readyAtUtc?: string | null
}

export interface LessonVideoPlaybackI {
  source: "CloudflareStream" | "YouTube" | "None"
  playbackUrl: string
  expiresAtUtc?: string | null
  status: string
}
