import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  getSchoolSubscriptionOverviewApi,
  getSubscriptionPricingMarketsApi,
  getSubscriptionPlansApi,
  selectSchoolSubscriptionApi,
  initializeSchoolSubscriptionCheckoutApi,
  verifySchoolSubscriptionCheckoutApi,
} from "@/api/subscriptions.api"
import type {
  InitializeSchoolSubscriptionCheckoutPayloadI,
  SelectSchoolSubscriptionPayloadI,
  VerifySchoolSubscriptionCheckoutPayloadI,
} from "@/api/subscriptions.api/types"

export const subscriptionQueryKeys = {
  root: ["subscriptions"] as const,
  plans: (marketCode?: string, schoolId?: string) =>
    ["subscriptions", "plans", marketCode ?? "auto", schoolId ?? "public"] as const,
  markets: ["subscriptions", "pricing-markets"] as const,
  school: (schoolId: string) => ["subscriptions", "school", schoolId] as const,
}

export function useInitializeSchoolSubscriptionCheckout() {
  const mutation = useMutation({
    mutationFn: (payload: InitializeSchoolSubscriptionCheckoutPayloadI) =>
      initializeSchoolSubscriptionCheckoutApi(payload),
    onError: (error: Error) => {
      toast.error(error.message || "Subscription checkout could not be started.")
    },
  })
  return {
    initializeCheckoutAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
  }
}

export function useVerifySchoolSubscriptionCheckout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: VerifySchoolSubscriptionCheckoutPayloadI) =>
      verifySchoolSubscriptionCheckoutApi(payload),
    onSuccess: (_data, payload) => {
      queryClient.invalidateQueries({
        queryKey: subscriptionQueryKeys.school(payload.schoolId),
      })
    },
  })
}

export function useSubscriptionPlans(marketCode?: string, schoolId?: string) {
  const query = useQuery({
    queryKey: subscriptionQueryKeys.plans(marketCode, schoolId),
    queryFn: () => getSubscriptionPlansApi({ marketCode, schoolId }),
    staleTime: 5 * 60 * 1000,
  })

  return {
    plans: query.data?.value ?? [],
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useSubscriptionPricingMarkets() {
  const query = useQuery({
    queryKey: subscriptionQueryKeys.markets,
    queryFn: getSubscriptionPricingMarketsApi,
    staleTime: 15 * 60 * 1000,
  })

  return {
    markets: query.data?.value ?? [],
    isLoading: query.isPending,
    isError: query.isError,
  }
}

export function useSchoolSubscription(schoolId: string) {
  const query = useQuery({
    queryKey: subscriptionQueryKeys.school(schoolId),
    queryFn: () => getSchoolSubscriptionOverviewApi(schoolId),
    enabled: !!schoolId,
    staleTime: 60 * 1000,
  })

  return {
    overview: query.data?.value,
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useSelectSchoolSubscription() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (payload: SelectSchoolSubscriptionPayloadI) =>
      selectSchoolSubscriptionApi(payload),
    onSuccess: (data, payload) => {
      queryClient.invalidateQueries({
        queryKey: subscriptionQueryKeys.school(payload.schoolId),
      })
      toast.success(
        data.message ||
          "Plan selected. Complete payment before the subscription is activated."
      )
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "The subscription plan could not be selected."
      )
    },
  })

  return {
    selectSubscriptionAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
  }
}
