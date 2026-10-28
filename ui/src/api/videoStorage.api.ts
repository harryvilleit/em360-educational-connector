import apiClient from "./api"
import { normalizeResponse, type ApiResultI } from "@/utils/apiResponse"

type Result<T> = ApiResultI & { value: T }
export type VideoStorageOverview = {
  capacityMinutes: number; paidCapacityMinutes: number; freeCapacityMinutes: number; freeExpiresAtUtc: string | null; subscribedMinutes: number; hasPaidSubscription: boolean; usedMinutes: number; reservedMinutes: number; availableMinutes: number
  unverifiedVideos: number; monthlyTotal: number; currency: string; status: string
  paidThroughUtc: string | null; cancelAtPeriodEnd: boolean; canManage: boolean; revision: string
  hasPendingPayment: boolean; paymentUrl: string | null; pendingMinutes: number
}
export type VideoStorageQuote = {
  targetBlocks: number; amountDue: number; monthlyTotal: number; prorationDate: number
  renewalAtUtc: string | null; revision: string
}
export type StorageVideo = {
  id: string; fileName: string; usedSeconds: number | null; reservedSeconds: number
  deleteRequested: boolean; attached: boolean
}
export type StorageVideoPage = { items: StorageVideo[]; page: number; totalItems: number; totalPages: number }
const path = (schoolId: string) => `/SchoolVideoStorage/schools/${encodeURIComponent(schoolId)}`
function value<T>(response: unknown): T {
  const result = normalizeResponse<Result<T>>(response)
  if (!result.isSuccess) throw new Error(result.message || "Video storage request failed.")
  return result.value
}
export const getVideoStorage = async (schoolId: string) => value<VideoStorageOverview>(await apiClient.get(path(schoolId)))
export const refreshVideoStorage = async (schoolId: string) => value<VideoStorageOverview>(await apiClient.post(`${path(schoolId)}/refresh`, {}))
export const quoteVideoStorage = async (schoolId: string, blocks: number) => value<VideoStorageQuote>(await apiClient.get(`${path(schoolId)}/quote`, { params: { blocks } }))
export const purchaseVideoStorage = async (schoolId: string, quote: VideoStorageQuote) => value<{ url: string | null }>(await apiClient.post(`${path(schoolId)}/purchase`, quote))
export const resumeVideoStorage = async (schoolId: string) => value<{ url: string | null }>(await apiClient.post(`${path(schoolId)}/resume`, {}))
export const manageVideoStorage = async (schoolId: string) => value<{ url: string }>(await apiClient.post(`${path(schoolId)}/manage-payment`, {}))
export const cancelVideoStorage = async (schoolId: string) => value<{ message: string }>(await apiClient.post(`${path(schoolId)}/cancel-renewal`, {}))
export const getStorageVideos = async (schoolId: string, page: number) => value<StorageVideoPage>(await apiClient.get(`${path(schoolId)}/videos`, { params: { page } }))
export const deleteStorageVideo = async (schoolId: string, id: string) => value<{ message: string }>(await apiClient.delete(`${path(schoolId)}/videos/${encodeURIComponent(id)}`))
