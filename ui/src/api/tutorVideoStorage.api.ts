import { elearningApiClient as apiClient } from "./api"
import { normalizeResponse, type ApiResultI } from "@/utils/apiResponse"

type Result<T> = ApiResultI & { value: T }
export type VideoStorageOverview = {
  capacityMinutes: number; usedMinutes: number; reservedMinutes: number; availableMinutes: number
  unverifiedVideos: number; monthlyTotal: number; currency: string; status: string
  paidThroughUtc: string | null; cancelAtPeriodEnd: boolean; canManage: boolean; revision: string
  hasPendingPayment: boolean; paymentUrl: string | null; pendingMinutes: number
  paidCapacityMinutes: number; activePaidMinutes: number; freeCapacityMinutes: number
  nextFreeExpiryUtc: string | null; hasPaidSubscription: boolean
}
export type VideoStorageQuote = {
  targetBlocks: number; amountDue: number; monthlyTotal: number; prorationDate: number
  renewalAtUtc: string | null; revision: string
}
export type StorageVideo = {
  id: string; fileName: string; usedSeconds: number | null; reservedSeconds: number
  deleteRequested: boolean; attached: boolean; isPreview: boolean
}
export type StorageVideoPage = { items: StorageVideo[]; page: number; totalItems: number; totalPages: number }
const path = "/TutorVideoStorage"
function value<T>(response: unknown): T {
  const result = normalizeResponse<Result<T>>(response)
  if (!result.isSuccess) throw new Error(result.message || "Video storage request failed.")
  return result.value
}
export const getVideoStorage = async () => value<VideoStorageOverview>(await apiClient.get(path))
export const refreshVideoStorage = async () => value<VideoStorageOverview>(await apiClient.post(`${path}/refresh`, {}))
export const quoteVideoStorage = async (blocks: number) => value<VideoStorageQuote>(await apiClient.get(`${path}/quote`, { params: { blocks } }))
export const purchaseVideoStorage = async (quote: VideoStorageQuote) => value<{ url: string | null }>(await apiClient.post(`${path}/purchase`, quote))
export const resumeVideoStorage = async () => value<{ url: string | null }>(await apiClient.post(`${path}/resume`, {}))
export const manageVideoStorage = async () => value<{ url: string }>(await apiClient.post(`${path}/manage-payment`, {}))
export const cancelVideoStorage = async () => value<{ message: string }>(await apiClient.post(`${path}/cancel-renewal`, {}))
export const getStorageVideos = async (page: number) => value<StorageVideoPage>(await apiClient.get(`${path}/videos`, { params: { page } }))
export const deleteStorageVideo = async (id: string) => value<{ message: string }>(await apiClient.delete(`${path}/videos/${encodeURIComponent(id)}`))
