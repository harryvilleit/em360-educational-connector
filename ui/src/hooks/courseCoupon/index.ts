import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  createCourseCouponApi,
  deleteCourseCouponApi,
  getCourseCouponsApi,
  updateCourseCouponApi,
} from "@/api/courseCoupon.api"

const couponKey = (courseId: string) =>
  ["lms", "course-coupons", courseId] as const

export function useCourseCoupons(courseId: string, enabled = true) {
  const query = useQuery({
    queryKey: couponKey(courseId),
    queryFn: () => getCourseCouponsApi(courseId),
    enabled: enabled && Boolean(courseId),
    staleTime: 30_000,
  })
  return { ...query, coupons: query.data?.value ?? [] }
}

export function useCourseCouponActions(courseId: string) {
  const client = useQueryClient()
  const refresh = () =>
    client.invalidateQueries({ queryKey: couponKey(courseId) })
  const reportError = (error: Error) =>
    toast.error(error.message || "The coupon request could not be completed")

  const create = useMutation({
    mutationFn: createCourseCouponApi,
    onSuccess: async (response) => {
      toast.success(response.message || "Coupon created")
      await refresh()
    },
    onError: reportError,
  })
  const update = useMutation({
    mutationFn: updateCourseCouponApi,
    onSuccess: async (response) => {
      toast.success(response.message || "Coupon updated")
      await refresh()
    },
    onError: reportError,
  })
  const remove = useMutation({
    mutationFn: deleteCourseCouponApi,
    onSuccess: async (response) => {
      toast.success(response.message || "Coupon deleted")
      await refresh()
    },
    onError: reportError,
  })

  return { create, update, remove }
}
