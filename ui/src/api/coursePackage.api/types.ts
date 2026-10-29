import type { ApiResultI } from "@/utils/apiResponse"
import type { TutorCourseI } from "@/api/course.api"

export interface CoursePackageI {
  id: string
  tutorId: string
  isOwner?: boolean
  tutorName: string
  title: string
  description: string
  categoryId: string
  categoryName: string
  subCategoryId: string
  subCategoryName: string
  topic?: string | null
  isBeginner: boolean
  isIntermediate: boolean
  isAdvanced: boolean
  price: number
  originalCoursePrice: number
  currency: string
  introMediaUrl?: string | null
  status: string
  isDeleted: boolean
  courseCount: number
  lessonCount: number
  hasPaidPurchases: boolean
  dateCreated: string
  dateModified: string
  courses?: TutorCourseI[]
}

export interface SaveCoursePackagePayloadI {
  title: string
  description: string
  categoryId: string
  subCategoryId: string
  topic?: string
  isBeginner: boolean
  isIntermediate: boolean
  isAdvanced: boolean
  price: number
  introMediaUrl?: string
  courseIds: string[]
}

export interface CoursePackageResponseI extends ApiResultI {
  value: CoursePackageI
}

export interface CoursePackagesResponseI extends ApiResultI {
  value: CoursePackageI[]
}

export interface PublicCoursePackageSearchParamsI {
  search?: string
  categoryId?: string
  subCategoryId?: string
  countryCode?: string
  sort?: "newest" | "popular" | "price_low" | "price_high"
  pageNumber?: number
  pageSize?: number
}

export interface PublicCoursePackagePageI {
  items: CoursePackageI[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface PublicCoursePackagesResponseI extends ApiResultI {
  value: PublicCoursePackagePageI
}

export interface CreateCoursePackageResponseI extends ApiResultI {
  value: string
}
