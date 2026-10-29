import type { ApiResultI } from "@/utils/apiResponse"

export interface TutorCategorySelectionI {
  categoryId: string
  subCategoryIds: string[]
}

export interface CreateTutorProfilePayloadI {
  email: string
  professionalTitle: string
  bio: string
  country: string
  countryCode: string
  languages: string
  categorySelections: TutorCategorySelectionI[]
  yearsOfExperience: number
  qualifications: string
  certifications: string
  hourlyRate: number
  currency: string
  portfolioUrl: string
  cvUrl: string
  introVideoUrl: string
  phoneNumber: string
  identityDocumentType: string
  identityDocumentUrl: string
}

export interface CreateTutorProfileResponseI extends ApiResultI {
  message?: string
  statusCode?: number
  value?: unknown
}

export interface TutorMyProfileSubCategoryI {
  id: string
  name: string
  description: string
  isActive: boolean
  categoryId: string
  dateCreated: string
}

export interface TutorMyProfileCategoryI {
  categoryId: string
  categoryName: string
  selectedSubCategories: TutorMyProfileSubCategoryI[]
}

export interface TutorMyProfileI {
  id: string
  userId: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phoneNumber: string
  professionalTitle: string
  bio: string
  country: string
  countryCode: string
  languages: string
  categories: TutorMyProfileCategoryI[]
  yearsOfExperience: number
  qualifications: string
  certifications: string
  hourlyRate: number
  currency: string
  portfolioUrl: string
  cvUrl: string
  introVideoUrl: string
  identityDocumentType: string
  identityDocumentUrl: string
  status: number | string
  statusName: string
  rejectionReason: string | null
  dateCreated: string
}

export interface PublicTutorI {
  id: string
  fullName: string
  professionalTitle: string
  bio: string
  country: string
  countryCode: string
  languages: string[]
  subjects: string[]
  yearsOfExperience: number
  qualifications: string
  certifications?: string | null
  hourlyRate: number
  currency: string
  introVideoUrl?: string | null
  isVerified: boolean
  publishedCourses: import("@/api/course.api/types").TutorCourseI[]
  publishedPackages: import("@/api/coursePackage.api").CoursePackageI[]
}

export interface PublicTutorSearchParamsI {
  countryCode?: string
  search?: string
  categoryId?: string
  subCategoryId?: string
  language?: string
  maximumHourlyRate?: number
  sort?: "recommended" | "price_low" | "experience"
  pageNumber?: number
  pageSize?: number
}

export interface PublicTutorPageI {
  items: PublicTutorI[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface PublicTutorSearchResponseI extends ApiResultI {
  message?: string
  statusCode?: number
  value: PublicTutorPageI
}

export interface PublicTutorResponseI extends ApiResultI {
  message?: string
  statusCode?: number
  value: PublicTutorI
}

export interface TutorMyProfileResponseI extends ApiResultI {
  message?: string
  statusCode?: number
  value: TutorMyProfileI | null
}
