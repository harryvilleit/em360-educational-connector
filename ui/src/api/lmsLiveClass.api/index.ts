import { elearningApiClient } from "../api"
import { normalizeResponse, type ApiResultI } from "@/utils/apiResponse"
import type { LiveClassSession } from "@/types/elearning"

export interface LmsLiveClassDtoI {
  id: string
  publicCode: string
  publicUrl: string
  title: string
  description: string
  coverImageUrl?: string | null
  tutorId: string
  tutorName: string
  courseId?: string | null
  courseTitle?: string | null
  scheduledStartUtc: string
  scheduledEndUtc: string
  targetEnrollmentFromUtc?: string | null
  targetEnrollmentToUtc?: string | null
  status: "Scheduled" | "Live" | "Ended" | "Cancelled"
  isPaid: boolean
  price: number
  currency: string
  maxParticipants: number
  enrollmentCount: number
  paidEnrollmentCount: number
  pendingRefundCount: number
  isEnrolled: boolean
  isHost: boolean
  hasPaid: boolean
  canJoin: boolean
  canEdit: boolean
  canDelete: boolean
  mediaProvider: "CloudflareStream"
}

export interface SaveLmsLiveClassPayloadI {
  title: string
  description: string
  coverImageUrl?: string | null
  courseId?: string | null
  scheduledStartUtc: string
  scheduledEndUtc: string
  targetEnrollmentFromUtc?: string | null
  targetEnrollmentToUtc?: string | null
  isPaid: boolean
  price: number
  maxParticipants: number
  invitedEmails: string[]
}

export interface LmsLiveClassCheckoutI {
  liveClassId: string
  orderId?: string | null
  status: string
  amount: number
  currency: string
  paymentProvider?: string | null
  checkoutUrl?: string | null
  isEnrolled: boolean
}

export interface LmsLiveClassEnrollmentI {
  id: string
  userId: string
  name: string
  email: string
  isPaid: boolean
  dateEnrolledUtc: string
  lastJoinedAtUtc?: string | null
}

export interface LmsLiveClassJoinI {
  liveClassId: string
  provider: "CloudflareStream"
  role: "Host" | "Participant"
  joinedAtUtc: string
  playbackUrl: string
  playbackExpiresAtUtc: string
  browserPublishUrl?: string | null
  rtmpsUrl?: string | null
  rtmpsStreamKey?: string | null
}

interface ResultI<T> extends ApiResultI {
  message?: string
  statusCode?: number
  value: T
}

function parseApiUtc(value: string) {
  const trimmed = value?.trim()
  if (!trimmed) return null
  const normalized = trimmed.replace(" ", "T")
  const includesZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(normalized)
  const parsed = new Date(includesZone ? normalized : `${normalized}Z`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function localDatePart(date: Date | null, fallback: string) {
  if (!date) return fallback.slice(0, 10)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function mapLmsLiveClass(dto: LmsLiveClassDtoI): LiveClassSession {
  const start = parseApiUtc(dto.scheduledStartUtc)
  const end = parseApiUtc(dto.scheduledEndUtc)
  const time = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  return {
    id: dto.id,
    publicCode: dto.publicCode,
    publicUrl: dto.publicUrl,
    title: dto.title,
    description: dto.description,
    coverImageUrl: dto.coverImageUrl ?? undefined,
    courseId: dto.courseId ?? undefined,
    courseTitle: dto.courseTitle ?? undefined,
    teacherId: dto.tutorId,
    teacherName: dto.tutorName,
    scheduledDate: localDatePart(start, dto.scheduledStartUtc),
    startTime: start ? time(start) : "Time unavailable",
    endTime: end ? time(end) : "Time unavailable",
    scheduledStartUtc: dto.scheduledStartUtc,
    scheduledEndUtc: dto.scheduledEndUtc,
    targetEnrollmentFromUtc: dto.targetEnrollmentFromUtc ?? undefined,
    targetEnrollmentToUtc: dto.targetEnrollmentToUtc ?? undefined,
    status:
      dto.status === "Live"
        ? "live"
        : dto.status === "Ended" || dto.status === "Cancelled"
          ? "ended"
          : "upcoming",
    lmsStatus: dto.status,
    participantCount: dto.enrollmentCount,
    paidEnrollmentCount: dto.paidEnrollmentCount,
    pendingRefundCount: dto.pendingRefundCount,
    maxParticipants: dto.maxParticipants,
    agoraChannelId: "",
    mediaProvider: dto.mediaProvider,
    isPaid: dto.isPaid,
    price: dto.price,
    currency: dto.currency,
    accessType: "public",
    isEnrolled: dto.isEnrolled,
    isHost: dto.isHost,
    hasPaid: dto.hasPaid,
    canJoin: dto.canJoin,
    canEdit: dto.canEdit,
    canDelete: dto.canDelete,
  }
}

export async function getTutorLmsLiveClassesApi() {
  const response = await elearningApiClient.get("/LiveClass/Mine/Tutor")
  return normalizeResponse<ResultI<LmsLiveClassDtoI[]>>(response)
}

export async function getMyLmsLiveClassesApi() {
  const response = await elearningApiClient.get("/LiveClass/Mine")
  return normalizeResponse<ResultI<LmsLiveClassDtoI[]>>(response)
}

export async function getPublicLmsLiveClassesApi(search?: string) {
  const response = await elearningApiClient.get("/LiveClass/Public", {
    params: search ? { search } : undefined,
  })
  return normalizeResponse<ResultI<LmsLiveClassDtoI[]>>(response)
}

export async function getPublicLmsLiveClassApi(publicCode: string) {
  const response = await elearningApiClient.get(
    `/LiveClass/Public/${encodeURIComponent(publicCode)}`
  )
  return normalizeResponse<ResultI<LmsLiveClassDtoI>>(response)
}

export async function scheduleLmsLiveClassApi(
  payload: SaveLmsLiveClassPayloadI
) {
  const response = await elearningApiClient.post("/LiveClass", payload)
  return normalizeResponse<ResultI<LmsLiveClassDtoI>>(response)
}

export async function updateLmsLiveClassApi(
  id: string,
  payload: SaveLmsLiveClassPayloadI
) {
  const response = await elearningApiClient.put(
    `/LiveClass/${encodeURIComponent(id)}`,
    payload
  )
  return normalizeResponse<ResultI<LmsLiveClassDtoI>>(response)
}

export async function deleteLmsLiveClassApi(id: string) {
  const response = await elearningApiClient.delete(
    `/LiveClass/${encodeURIComponent(id)}`
  )
  return normalizeResponse<ApiResultI & { message?: string }>(response)
}

export async function startLmsLiveClassApi(id: string) {
  const response = await elearningApiClient.post(
    `/LiveClass/${encodeURIComponent(id)}/Start`
  )
  return normalizeResponse<ResultI<LmsLiveClassDtoI>>(response)
}

export async function endLmsLiveClassApi(id: string) {
  const response = await elearningApiClient.post(
    `/LiveClass/${encodeURIComponent(id)}/End`
  )
  return normalizeResponse<ResultI<LmsLiveClassDtoI>>(response)
}

export async function enrollLmsLiveClassApi(publicCode: string) {
  const response = await elearningApiClient.post(
    `/LiveClass/Public/${encodeURIComponent(publicCode)}/Enroll`
  )
  return normalizeResponse<ResultI<LmsLiveClassCheckoutI>>(response)
}

export async function verifyLmsLiveClassPaymentApi(orderId: string) {
  const response = await elearningApiClient.post(
    `/LiveClass/Orders/${encodeURIComponent(orderId)}/Verify`
  )
  return normalizeResponse<ResultI<LmsLiveClassCheckoutI>>(response)
}

export async function joinLmsLiveClassApi(id: string) {
  const response = await elearningApiClient.post(
    `/LiveClass/${encodeURIComponent(id)}/Join`
  )
  return normalizeResponse<ResultI<LmsLiveClassJoinI>>(response)
}

export async function getLmsLiveClassEnrollmentsApi(id: string) {
  const response = await elearningApiClient.get(
    `/LiveClass/${encodeURIComponent(id)}/Enrollments`
  )
  return normalizeResponse<ResultI<LmsLiveClassEnrollmentI[]>>(response)
}
