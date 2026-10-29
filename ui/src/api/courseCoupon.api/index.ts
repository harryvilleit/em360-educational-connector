import { elearningApiClient } from "../api"
import { normalizeResponse, type ApiResultI } from "@/utils/apiResponse"

export interface CourseCouponI {
  id: string
  courseId: string
  courseTitle: string
  code: string
  discountPercent: number
  startsAtUtc?: string | null
  expiresAtUtc: string
  isActive: boolean
  status: "Active" | "Scheduled" | "Expired" | "Inactive"
  redemptionCount: number
  dateCreatedUtc: string
  dateModifiedUtc: string
}

export interface SaveCourseCouponI {
  code: string
  discountPercent: number
  startsAtUtc?: string | null
  expiresAtUtc: string
  isActive: boolean
}

interface ResultI<T> extends ApiResultI {
  message?: string
  value: T
}

export async function getCourseCouponsApi(courseId: string) {
  const response = await elearningApiClient.get(
    `/CourseCoupon/Course/${encodeURIComponent(courseId)}`
  )
  return normalizeResponse<ResultI<CourseCouponI[]>>(response)
}

export async function createCourseCouponApi(input: {
  courseId: string
  coupon: SaveCourseCouponI
}) {
  const response = await elearningApiClient.post(
    `/CourseCoupon/Course/${encodeURIComponent(input.courseId)}`,
    input.coupon
  )
  return normalizeResponse<ResultI<CourseCouponI>>(response)
}

export async function updateCourseCouponApi(input: {
  id: string
  coupon: SaveCourseCouponI
}) {
  const response = await elearningApiClient.put(
    `/CourseCoupon/${encodeURIComponent(input.id)}`,
    input.coupon
  )
  return normalizeResponse<ResultI<CourseCouponI>>(response)
}

export async function deleteCourseCouponApi(id: string) {
  const response = await elearningApiClient.delete(
    `/CourseCoupon/${encodeURIComponent(id)}`
  )
  return normalizeResponse<ApiResultI & { message?: string }>(response)
}
