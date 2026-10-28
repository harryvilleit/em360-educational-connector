/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "../api"
import { normalizeResponse } from "@/utils/apiResponse"
import type {
  ResultI,
  PaginatedResultI,
  LiveClassDtoI,
  LiveClassJoinDtoI,
  LiveClassParticipantDtoI,
  LiveClassGuestLinkDtoI,
  GuestLinkPreviewDtoI,
  LiveClassEndSummaryDtoI,
  GetLiveClassesParams,
  GetLiveClassParticipantsParams,
  ScheduleLiveClassPayloadI,
  JoinLiveClassPayloadI,
  CreateGuestLinkPayloadI,
  RevokeGuestLinkParams,
  AdmitParticipantsPayloadI,
  RemoveParticipantPayloadI,
  MuteParticipantsPayloadI,
  UpdateLiveClassPolicyPayloadI,
  RedeemGuestLinkPayloadI,
} from "./types"

// The LiveClass module lives on the school-management API (BaseController),
// so it uses the shared `apiClient` (VITE_BASE_URL already includes /api/v1).

// ─── Schedule / list ──────────────────────────────────────────────────────────

export const scheduleLiveClassApi = async (
  payload: ScheduleLiveClassPayloadI
): Promise<ResultI<LiveClassDtoI>> => {
  const res = await apiClient.post("/LiveClass/Schedule", payload)
  return normalizeResponse<ResultI<LiveClassDtoI>>(res)
}

export const getLiveClassesApi = async (
  params: GetLiveClassesParams
): Promise<PaginatedResultI<LiveClassDtoI>> => {
  const res = await apiClient.get("/LiveClass/GetClasses", { params })
  return normalizeResponse<PaginatedResultI<LiveClassDtoI>>(res)
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

export const startLiveClassApi = async (
  liveClassId: string
): Promise<ResultI<LiveClassDtoI>> => {
  const res = await apiClient.post(`/LiveClass/${liveClassId}/Start`)
  return normalizeResponse<ResultI<LiveClassDtoI>>(res)
}

export const endLiveClassApi = async (
  liveClassId: string
): Promise<ResultI<LiveClassEndSummaryDtoI>> => {
  const res = await apiClient.post(`/LiveClass/${liveClassId}/End`)
  return normalizeResponse<ResultI<LiveClassEndSummaryDtoI>>(res)
}

// ─── Join / leave / roster ────────────────────────────────────────────────────

export const joinLiveClassApi = async (
  payload: JoinLiveClassPayloadI
): Promise<ResultI<LiveClassJoinDtoI>> => {
  const { liveClassId, ...body } = payload
  const res = await apiClient.post(`/LiveClass/${liveClassId}/Join`, body)
  return normalizeResponse<ResultI<LiveClassJoinDtoI>>(res)
}

export const leaveLiveClassApi = async (
  participantId: string
): Promise<ResultI<string>> => {
  const res = await apiClient.post(`/LiveClass/Leave/${participantId}`)
  return normalizeResponse<ResultI<string>>(res)
}

export const getLiveClassParticipantsApi = async (
  params: GetLiveClassParticipantsParams
): Promise<ResultI<LiveClassParticipantDtoI[]>> => {
  const { liveClassId, state } = params
  const res = await apiClient.get(`/LiveClass/${liveClassId}/Participants`, {
    params: state ? { state } : undefined,
  })
  return normalizeResponse<ResultI<LiveClassParticipantDtoI[]>>(res)
}

// ─── Moderation ───────────────────────────────────────────────────────────────

export const admitParticipantsApi = async (
  payload: AdmitParticipantsPayloadI
): Promise<ResultI<LiveClassParticipantDtoI[]>> => {
  const { liveClassId, ...body } = payload
  const res = await apiClient.post(`/LiveClass/${liveClassId}/Admit`, body)
  return normalizeResponse<ResultI<LiveClassParticipantDtoI[]>>(res)
}

export const removeParticipantApi = async (
  payload: RemoveParticipantPayloadI
): Promise<ResultI<LiveClassParticipantDtoI>> => {
  const { liveClassId, ...body } = payload
  const res = await apiClient.post(
    `/LiveClass/${liveClassId}/RemoveParticipant`,
    body
  )
  return normalizeResponse<ResultI<LiveClassParticipantDtoI>>(res)
}

export const muteParticipantsApi = async (
  payload: MuteParticipantsPayloadI
): Promise<ResultI<string>> => {
  const { liveClassId, ...body } = payload
  const res = await apiClient.post(`/LiveClass/${liveClassId}/Mute`, body)
  return normalizeResponse<ResultI<string>>(res)
}

export const updateLiveClassPolicyApi = async (
  payload: UpdateLiveClassPolicyPayloadI
): Promise<ResultI<any>> => {
  const { liveClassId, ...body } = payload
  const res = await apiClient.put(`/LiveClass/${liveClassId}/Policy`, body)
  return normalizeResponse<ResultI<any>>(res)
}

// ─── Guest links ──────────────────────────────────────────────────────────────

export const createGuestLinkApi = async (
  payload: CreateGuestLinkPayloadI
): Promise<ResultI<LiveClassGuestLinkDtoI>> => {
  const { liveClassId, ...body } = payload
  const res = await apiClient.post(`/LiveClass/${liveClassId}/GuestLink`, body)
  return normalizeResponse<ResultI<LiveClassGuestLinkDtoI>>(res)
}

export const revokeGuestLinkApi = async (
  params: RevokeGuestLinkParams
): Promise<ResultI<string>> => {
  const { liveClassId, disableOnly = false } = params
  const res = await apiClient.delete(`/LiveClass/${liveClassId}/GuestLink`, {
    params: { disableOnly },
  })
  return normalizeResponse<ResultI<string>>(res)
}

// ─── Public guest endpoints (unauthenticated) ─────────────────────────────────

export const previewGuestLinkApi = async (
  token: string
): Promise<ResultI<GuestLinkPreviewDtoI>> => {
  const res = await apiClient.get(`/public/liveclass/guest/${token}`)
  return normalizeResponse<ResultI<GuestLinkPreviewDtoI>>(res)
}

export const redeemGuestLinkApi = async (
  payload: RedeemGuestLinkPayloadI
): Promise<ResultI<LiveClassJoinDtoI>> => {
  const { token, displayName } = payload
  const res = await apiClient.post(`/public/liveclass/guest/${token}/join`, {
    displayName,
  })
  return normalizeResponse<ResultI<LiveClassJoinDtoI>>(res)
}

// ─── Enrolled student count (pre-join lobby) ─────────────────────────────────

export const getLiveClassEnrolledCountApi = async (
  liveClassId: string
): Promise<ResultI<number>> => {
  const res = await apiClient.get(`/LiveClass/${liveClassId}/EnrolledCount`)
  return normalizeResponse<ResultI<number>>(res)
}

// ─── Timetable slot → LiveClass bridge (ELearningController) ───────────────────

export const startClassFromSlotApi = async (
  payload: import("./types").StartClassFromSlotPayloadI
): Promise<ResultI<LiveClassDtoI>> => {
  const res = await apiClient.post("/ELearning/Classes/StartFromSlot", payload)
  return normalizeResponse<ResultI<LiveClassDtoI>>(res)
}
export interface TeacherCourseDtoI {
  id: string
  subjectId: string
  subjectName: string
  classId: string
  className: string
  studentCount: number
  teacherSubUserId: string
  teacherUserId: string
  teacherName: string
  teacherEmail: string
}

// The signed-in teacher's assigned subject/class pairs, or a selected teacher
// when the authenticated caller is that teacher or the school owner.
export const getTeacherCoursesApi = async (
  schoolId: string,
  teacherSubUserId?: string
): Promise<ResultI<TeacherCourseDtoI[]>> => {
  const path = teacherSubUserId
    ? `/TeacherPortal/Teachers/${encodeURIComponent(teacherSubUserId)}/Courses/${schoolId}`
    : `/TeacherPortal/Courses/${schoolId}`
  const res = await apiClient.get(path)
  return normalizeResponse<ResultI<TeacherCourseDtoI[]>>(res)
}
