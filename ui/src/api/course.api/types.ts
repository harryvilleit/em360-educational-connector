import type { CourseWeeklyAvailability } from "@/lib/course-availability"
import type { ApiResultI } from "@/utils/apiResponse"

export const CoursePricingType = {
  Free: 0,
  Paid: 1,
} as const
export type CoursePricingType =
  (typeof CoursePricingType)[keyof typeof CoursePricingType]

export interface CreateCoursePayloadI {
  title: string
  description: string
  categoryId: string
  subCategoryId: string
  topic: string
  isBeginner: boolean
  isIntermediate: boolean
  isAdvanced: boolean
  gradeType: string
  deliveryKind?: "Unspecified" | "Recorded" | "Live" | "Mixed"
  passScorePercent: number
  pricingType: number
  price: number
  discountPercent: number
  discountStartsAtUtc?: string | null
  discountEndsAtUtc?: string | null
  currency: string
  weeklyAvailability?: CourseWeeklyAvailability | null
  introMediaUrl: string
}

export interface CreateCourseResponseI extends ApiResultI {
  message?: string
  statusCode?: number
  value?: TutorCourseI | string | null
}

export interface UpdateCoursePayloadI extends CreateCoursePayloadI {
  id: string
}

export interface UpdateCourseResponseI extends ApiResultI {
  message?: string
  statusCode?: number
  value?: TutorCourseI | string | null
}

export interface CourseLessonMaterialI {
  id: string
  lessonId: string
  fileName: string
  fileUrl: string
}

export interface CourseLessonI {
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
  materials: CourseLessonMaterialI[]
}

export interface CourseSectionI {
  id: string
  courseId: string
  title: string
  sortOrder: number
  lessons: CourseLessonI[]
}

export interface TutorCourseI {
  id: string
  tutorId?: string
  isOwner?: boolean
  countryCode?: string
  tutorName?: string
  title: string
  description: string
  categoryId: string
  categoryName?: string
  subCategoryId: string
  subCategoryName?: string
  topic?: string
  isBeginner?: boolean
  isIntermediate?: boolean
  isAdvanced?: boolean
  gradeType?: string
  deliveryKind?: "Unspecified" | "Recorded" | "Live" | "Mixed"
  taxClassificationVersion?: number
  passScorePercent?: number

  pricingType?: number | string
  price?: number
  currency?: string
  discountPercent?: number
  discountStartsAtUtc?: string | null
  discountEndsAtUtc?: string | null
  weeklyAvailability?: CourseWeeklyAvailability | null
  introMediaUrl?: string
  status?: number | string
  statusName?: string
  version?: string
  isDeleted?: boolean
  deletedAtUtc?: string | null
  dateCreated?: string
  dateModified?: string
  instructorName?: string
  enrolledCount?: number
  lessonCount?: number
  sections?: CourseSectionI[]
}

export interface PublicCourseSearchParamsI {
  countryCode?: string
  search?: string
  categoryId?: string
  subCategoryId?: string
  topic?: string
  level?: "beginner" | "intermediate" | "advanced"
  isFree?: boolean
  sort?: "newest" | "popular" | "price_low" | "price_high"
  pageNumber?: number
  pageSize?: number
}

export interface PublicCoursePageI {
  items: TutorCourseI[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface PublicCourseSearchResponseI extends ApiResultI {
  message?: string
  statusCode?: number
  value: PublicCoursePageI
}

export interface GetCourseByIdResponseI extends ApiResultI {
  message?: string
  statusCode?: number
  value: TutorCourseI
}

export interface TutorCoursesResponseI extends ApiResultI {
  message?: string
  statusCode?: number
  value: TutorCourseI[]
}

export interface TutorCourseFiltersI {
  includeDeleted?: boolean
  status?: "Draft" | "Published" | "Archived"
  search?: string
}

/** One free excerpt in a course's public preview reel. */
export interface CoursePreviewClipI {
  lessonId: string
  title: string
  sectionTitle: string
  order: number
  source: "CloudflareStream" | "YouTube" | "Url"
  /** A short-lived player URL. For Cloudflare this is the generated excerpt clip when one exists. */
  playbackUrl: string
  /** True when the server already cut a real excerpt; otherwise the player stops at clipSeconds. */
  isExtracted: boolean
  clipSeconds: number
  lessonDurationSeconds?: number | null
  thumbnailUrl?: string | null
}

export interface CoursePreviewReelI {
  courseId: string
  clipSeconds: number
  maxLessons: number
  clips: CoursePreviewClipI[]
}

export interface CoursePreviewReelResponseI extends ApiResultI {
  value: CoursePreviewReelI
}
