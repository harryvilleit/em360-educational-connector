import type { ApiResultI } from "@/utils/apiResponse"

export interface CreateSectionPayloadI {
  courseId: string
  title: string
  sortOrder: number
}

export interface UpdateSectionPayloadI {
  id: string
  title: string
  sortOrder: number
}

export interface SectionI {
  id: string
  courseId: string
  title: string
  sortOrder: number
}

export interface SectionLessonMaterialI {
  id: string
  lessonId: string
  fileName: string
  fileUrl: string
}

export interface SectionLessonI {
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
  materials: SectionLessonMaterialI[]
}

export interface SectionWithLessonsI {
  id: string
  courseId: string
  title: string
  sortOrder: number
  lessons: SectionLessonI[]
}

export interface SectionsByCourseIdResponseI extends ApiResultI {
  message?: string
  statusCode?: number
  value: SectionWithLessonsI[]
}

export interface CreateSectionResponseI extends ApiResultI {
  message?: string
  statusCode?: number
  value?: SectionI | string | null
}

export interface UpdateSectionResponseI extends ApiResultI {
  message?: string
  statusCode?: number
  value?: SectionI | string | null
}
