// Matches EM360.Domain.Enums.ConsentCategory in the supplied School API.
export const ConsentCategory = {
  Medical: 1,
  Academic: 2,
  FieldTrip: 3,
  Sports: 4,
  Administrative: 5,
  Other: 6,
} as const
export type ConsentCategory =
  (typeof ConsentCategory)[keyof typeof ConsentCategory]

// Only classIds exists on the Create payload (no per-student id list), so
// unlike the old client-only mock model, real consent targeting only
// supports "everyone" vs "specific classes" — not individual students.
// The backend calls value 1 AllParents (guardians of all school students).
export const ConsentTargetType = {
  AllStudents: 1,
  SpecificClasses: 2,
} as const
export type ConsentTargetType =
  (typeof ConsentTargetType)[keyof typeof ConsentTargetType]

export interface CreateConsentRequestPayloadI {
  schoolId: string
  title: string
  description: string
  category: ConsentCategory
  responseDue: string
  sentByUserId: string
  sentBy: string
  targetType: ConsentTargetType
  classIds: string[]
  isUrgent: boolean
}

// The Create payload takes the numeric enum values above, but per the
// backend-enum-serialization gotcha seen elsewhere in this API, the response
// likely serializes category/targetType back out as their string name
// rather than the numeric value Swagger's example shows — verify live.
// Note classIds is NOT echoed back here (only present on the Create
// payload), so a client can't tell which classes a "SpecificClasses"
// request targets from this shape alone.
export interface ConsentRequestI {
  id: string
  schoolId: string
  title: string
  description: string
  category: string
  responseDue: string
  sentBy: string
  sentByUserId: string
  targetType: string
  isUrgent: boolean
  totalSent: number
  approved: number
  rejected: number
  pending: number
  dateCreated: string
}

export interface CreateConsentRequestResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: ConsentRequestI
}

export interface GetConsentRequestsParamsI {
  requestId?: string
  search?: string
  category?: ConsentCategory
  status?: "open" | "closed"
  schoolId?: string
  pageNumber?: number
  pageSize?: number
}

export interface PaginatedConsentRequestsValueI {
  summary?: { pending: number; approved: number; rejected: number }
  items: ConsentRequestI[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface GetConsentRequestsResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: PaginatedConsentRequestsValueI
}

export interface GetConsentResponsesParamsI {
  consentRequestId: string
  status?: string
  pageNumber?: number
  pageSize?: number
}

export interface ConsentResponseItemI {
  id: string
  consentRequestId: string
  guardianId: string
  guardianName: string
  studentId: string
  studentName: string
  className: string
  status: string
  responseNote: string
  respondedAt: string
}

export interface PaginatedConsentResponsesValueI {
  items: ConsentResponseItemI[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface GetConsentResponsesResponseI {
  isSuccess: boolean
  message: string
  error: string
  isFailure: boolean
  statusCode: number
  value: PaginatedConsentResponsesValueI
}
