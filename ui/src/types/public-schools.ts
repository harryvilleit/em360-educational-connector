export type SchoolRequestType =
  | "admission"
  | "visit"
  | "partnership"
  | "general"

export const PUBLIC_SCHOOL_LEVELS = [
  "Nursery",
  "Primary",
  "Secondary",
  "Vocational",
  "Tutoring",
  "Mentoring",
] as const

export interface PublicSchoolCard {
  id: string
  slug?: string | null
  name: string
  tagline: string
  description: string
  schoolLevel: string
  schoolLevels: string[]
  countryCode: string
  city: string
  state: string
  localGovernment: string
  coverImageUrl?: string | null
  isVerified: boolean
  admissionsOpen: boolean
  rating: number
  ratingCount: number
  studentCount: number
}

export interface SchoolProgram {
  id: string
  name: string
  sortOrder: number
}

export interface SchoolFacility {
  id: string
  name: string
  imageUrl: string
  sortOrder: number
}

export interface SchoolGalleryImage {
  id: string
  imageUrl: string
  caption?: string | null
  sortOrder: number
}

export interface SchoolRating {
  id: string
  score: number
  comment?: string | null
  reviewerType: "Parent" | "Student" | string
  dateModified: string
}

export interface PublicSchoolCourse {
  id: string
  name: string
  description: string
}
export interface SchoolPricingSettings {
  title: string
  content: string
  showPricing: boolean
  publishedTitle?: string | null
  publishedContent?: string | null
  publishedAtUtc?: string | null
}
export interface PublicSchool extends PublicSchoolCard {
  courses?: PublicSchoolCourse[]
  pricingTitle?: string | null
  pricingContent?: string | null
  address: string
  phoneNumber: string
  email: string
  websiteUrl?: string | null
  logoUrl?: string | null
  establishedYear?: number | null
  staffCount: number
  programs: SchoolProgram[]
  facilities: SchoolFacility[]
  galleryImages: SchoolGalleryImage[]
  recentRatings: SchoolRating[]
}

export interface PublicSchoolFilterOptions {
  countries: string[]
  cities: string[]
  states: string[]
  localGovernments: string[]
  schoolLevels: string[]
}

export interface PublicSchoolSearchResult {
  items: PublicSchoolCard[]
  featuredSchools: PublicSchoolCard[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
  effectiveCountryCode: string
  wasCountryDetected: boolean
  countrySource: string
  filters: PublicSchoolFilterOptions
}

export interface PublicSchoolSearchParams {
  pageNumber?: number
  pageSize?: number
  keyword?: string
  country?: string
  state?: string
  localGovernment?: string
  city?: string
  schoolLevel?: string
}

export interface SchoolPublicProfileSettings {
  schoolId: string
  slug?: string | null
  description: string
  tagline: string
  schoolLevel: string
  schoolLevels: string[]
  websiteUrl?: string | null
  establishedYear?: number | null
  admissionsOpen: boolean
  countryCode?: string | null
  programs: SchoolProgram[]
  facilities: SchoolFacility[]
  galleryImages: SchoolGalleryImage[]
}

export interface UpdateSchoolPublicProfilePayload {
  description: string
  tagline: string
  schoolLevels: string[]
  /** Backward-compatible value for an older API deployment. */
  schoolLevel: string
  websiteUrl?: string | null
  establishedYear?: number | null
  admissionsOpen: boolean
  programs: string[]
}

export interface SchoolContactRequest {
  id: string
  schoolId: string
  schoolName: string
  requesterName: string
  requesterEmail: string
  requesterPhone: string
  requestType: SchoolRequestType
  studentName?: string
  studentGrade?: string
  message: string
  status: "pending" | "reviewed" | "closed"
  submittedAt: string
}

export interface SchoolEnquiryInput {
  requestId: string
  requesterName: string
  requesterEmail: string
  requesterPhone: string
  requestType: SchoolRequestType
  studentName?: string
  studentGrade?: string
  message: string
}
export interface SchoolEnquiry extends Omit<SchoolEnquiryInput, "requestId"> {
  id: string
  status: "pending" | "reviewed" | "closed"
  emailNotificationQueued: boolean
  submittedAtUtc: string
}
export interface SchoolEnquiryPage {
  items: SchoolEnquiry[]
  totalItems: number
  pendingCount: number
  pageNumber: number
  pageSize: number
}
