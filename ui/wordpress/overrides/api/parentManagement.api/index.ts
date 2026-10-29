// Recovered from the 0.6 WordPress Parent Portal source; used only by the WordPress parent screens.
import api from "@/api/api"
import { normalizeResponse } from "@/utils/apiResponse"
import type { SchoolParentItemI } from "@/api/guardian.api/types"
export interface Page<T> {
  items: T[]
  totalItems: number
  totalPages: number
  pageNumber: number
  pageSize: number
}
export async function value<T>(response: Promise<unknown>): Promise<T> {
  const r = normalizeResponse<{
    isSuccess: boolean
    message?: string
    value: T
  }>(await response)
  if (r.isSuccess === false)
    throw new Error(r.message || "The request could not be completed.")
  return r.value
}
export interface ParentOverview {
  totalParents: number
  linkedChildren: number
  pendingConsent: number
  visitRequests: number
  recentParents: SchoolParentItemI[]
  growthSeries: { month: string; newParents: number }[]
}
export const parentOverview = (schoolId: string) =>
  value<ParentOverview>(api.get(`/Guardian/SchoolOverview/${schoolId}`))
export type TranscriptStatus =
  | "Pending"
  | "Processing"
  | "Dispatched"
  | "Rejected"
  | "Cancelled"
export interface Transcript {
  id: string
  guardianId: string
  studentId: string
  studentName: string
  className?: string
  recipientType: string
  institutionName?: string
  institutionAddress?: string
  contactPerson?: string
  contactEmail?: string
  purpose: string
  additionalNotes?: string
  status: TranscriptStatus
  rejectionReason?: string
  reviewedAt?: string
  dispatchedAt?: string
  dateCreated: string
}
export const transcripts = (
  schoolId: string,
  pageNumber: number,
  status?: string,
  guardianId?: string
) =>
  value<Page<Transcript>>(
    api.get("/Transcript/GetRequests", {
      params: { schoolId, pageNumber, pageSize: 20, status, guardianId },
    })
  )
export const reviewTranscript = (
  id: string,
  newStatus: TranscriptStatus,
  rejectionReason?: string
) =>
  value<string>(
    api.post("/Transcript/UpdateStatus/" + id, { newStatus, rejectionReason })
  )
export interface TranscriptSubmission {
  schoolId: string
  guardianId: string
  studentId: string
  recipientType: number
  purpose: string
  institutionName?: string
  institutionAddress?: string
  contactPerson?: string
  contactEmail?: string
  additionalNotes?: string
}
export const submitTranscript = (payload: TranscriptSubmission) =>
  value<Transcript>(api.post("/Guardian/SubmitTranscriptRequest", payload))
export interface ParentConsentRecord {
  consentRequestId: string
  title: string
  description: string
  category: string
  responseDue: string
  studentId: string
  studentName: string
  myResponseStatus: string
  myResponseNote?: string
  respondedAt?: string
  isUrgent: boolean
}
export const parentConsentRecords = (
  schoolId: string,
  guardianId: string,
  pageNumber: number,
  status?: string
) =>
  value<Page<ParentConsentRecord>>(
    api.get("/Guardian/GetConsentRequests", {
      params: { schoolId, guardianId, pageNumber, pageSize: 20, status },
    })
  )

export const transcriptSummary = (schoolId: string, guardianId?: string) =>
  value<{
    total: number
    pending: number
    processing: number
    dispatched: number
    rejected: number
    cancelled: number
  }>(api.get("/Transcript/Summary/" + schoolId, { params: { guardianId } }))
