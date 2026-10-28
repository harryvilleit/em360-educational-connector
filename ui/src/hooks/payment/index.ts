import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"
import { queryKeys } from "@/utils/queryKeys"
import { publicSchoolKeys } from "@/hooks/publicSchools"
import {
  disconnectSchoolPaymentProviderApi,
  getPaymentProvidersApi,
  getSchoolFinancialProfileApi,
  getSchoolPaymentDisputesApi,
  getSchoolPaymentProviderAccountsApi,
  getSchoolPaymentRefundsApi,
  getSchoolPaymentSettlementsApi,
  getSchoolPaymentTransactionsApi,
  getSettlementBanksApi,
  initialiseWalletFundingApi,
  onboardSchoolPaymentProviderApi,
  reconcileSchoolSettlementsApi,
  refreshSchoolPaymentProviderApi,
  requestPaymentRefundApi,
  resolvePaymentDisputeApi,
  resolveSettlementAccountApi,
  updateSchoolFinancialProfileApi,
  verifyPaymentApi,
} from "@/api/payment.api"
import type {
  DisconnectSchoolPaymentProviderPayloadI,
  GetSchoolPaymentDisputesParamsI,
  GetSchoolPaymentRefundsParamsI,
  GetSchoolPaymentSettlementsParamsI,
  GetSchoolPaymentTransactionsParamsI,
  InitialiseWalletFundingPayloadI,
  InitialiseWalletFundingResponseI,
  OnboardSchoolPaymentProviderPayloadI,
  ReconcileSchoolSettlementsPayloadI,
  RefreshSchoolPaymentProviderPayloadI,
  RequestPaymentRefundPayloadI,
  ResolvePaymentDisputePayloadI,
  ResolveSettlementAccountPayloadI,
  UpdateSchoolFinancialProfilePayloadI,
} from "@/api/payment.api/types"

export const paymentQueryKeys = {
  root: ["payments"] as const,
  providers: (countryCode?: string, currencyCode?: string) =>
    ["payments", "providers", countryCode ?? "", currencyCode ?? ""] as const,
  accounts: (schoolId: string) => ["payments", "accounts", schoolId] as const,
  financialProfile: (schoolId: string) =>
    ["payments", "financial-profile", schoolId] as const,
  banks: (schoolId: string, providerKey: string) =>
    ["payments", "banks", schoolId, providerKey] as const,
  transactions: (params: GetSchoolPaymentTransactionsParamsI) =>
    ["payments", "transactions", params] as const,
  refunds: (params: GetSchoolPaymentRefundsParamsI) =>
    ["payments", "refunds", params] as const,
  disputes: (params: GetSchoolPaymentDisputesParamsI) =>
    ["payments", "disputes", params] as const,
  settlements: (params: GetSchoolPaymentSettlementsParamsI) =>
    ["payments", "settlements", params] as const,
}

export const useInitialiseWalletFunding = (options?: {
  onSuccess?: (data: InitialiseWalletFundingResponseI) => void
}) => {
  const mutation = useMutation<
    InitialiseWalletFundingResponseI,
    Error,
    InitialiseWalletFundingPayloadI
  >({
    mutationFn: initialiseWalletFundingApi,
    onSuccess: options?.onSuccess,
    onError: (error) => {
      toast.error(error.message || "Unable to start wallet funding.")
    },
  })

  return {
    initialiseWalletFundingAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
  }
}
export const useVerifyPayment = () => {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: verifyPaymentApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentQueryKeys.root })
    },
  })
  return {
    verifyPaymentAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  }
}

export const useGetPaymentProviders = (params?: {
  countryCode?: string
  currencyCode?: string
  enabled?: boolean
}) => {
  const countryCode = params?.countryCode
  const currencyCode = params?.currencyCode
  const query = useQuery({
    queryKey: paymentQueryKeys.providers(countryCode, currencyCode),
    queryFn: () => getPaymentProvidersApi({ countryCode, currencyCode }),
    enabled: params?.enabled ?? true,
    staleTime: 5 * 60 * 1000,
  })
  return {
    providers: query.data?.value ?? [],
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export const useGetSchoolPaymentProviderAccounts = (schoolId: string) => {
  const query = useQuery({
    queryKey: paymentQueryKeys.accounts(schoolId),
    queryFn: () => getSchoolPaymentProviderAccountsApi(schoolId),
    enabled: !!schoolId,
    staleTime: 60 * 1000,
  })
  return {
    accounts: query.data?.value ?? [],
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export const useGetSchoolFinancialProfile = (schoolId: string) => {
  const query = useQuery({
    queryKey: paymentQueryKeys.financialProfile(schoolId),
    queryFn: () => getSchoolFinancialProfileApi(schoolId),
    enabled: !!schoolId,
    staleTime: 60 * 1000,
  })
  return {
    financialProfile: query.data?.value,
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export const useUpdateSchoolFinancialProfile = () => {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (payload: UpdateSchoolFinancialProfilePayloadI) =>
      updateSchoolFinancialProfileApi(payload),
    onSuccess: (data, payload) => {
      queryClient.setQueryData(
        paymentQueryKeys.financialProfile(payload.schoolId),
        data
      )
      queryClient.invalidateQueries({
        queryKey: paymentQueryKeys.accounts(payload.schoolId),
      })
      queryClient.invalidateQueries({
        queryKey: paymentQueryKeys.financialProfile(payload.schoolId),
      })
      queryClient.invalidateQueries({ queryKey: ["payments", "providers"] })
      queryClient.invalidateQueries({
        queryKey: [queryKeys.userDashboard, payload.schoolId],
      })
      queryClient.invalidateQueries({ queryKey: [queryKeys.userProducts] })
      toast.success("School financial profile saved.")
      queryClient.invalidateQueries({ queryKey: publicSchoolKeys.all })
    },
    onError: (error: Error) => toast.error(error.message),
  })
  return {
    updateFinancialProfileAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
  }
}

export const useGetSettlementBanks = (
  schoolId: string,
  providerKey: string,
  enabled = true
) => {
  const query = useQuery({
    queryKey: paymentQueryKeys.banks(schoolId, providerKey),
    queryFn: () => getSettlementBanksApi({ schoolId, providerKey }),
    enabled: enabled && !!schoolId && !!providerKey,
    staleTime: 30 * 60 * 1000,
  })
  return {
    banks: query.data?.value ?? [],
    isLoading: query.isPending,
    isError: query.isError,
  }
}

export const useResolveSettlementAccount = () => {
  const mutation = useMutation({
    mutationFn: (payload: ResolveSettlementAccountPayloadI) =>
      resolveSettlementAccountApi(payload),
    onError: (error: Error) => toast.error(error.message),
  })
  return {
    resolveSettlementAccountAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
  }
}

export const useOnboardSchoolPaymentProvider = () => {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (payload: OnboardSchoolPaymentProviderPayloadI) =>
      onboardSchoolPaymentProviderApi(payload),
    onSuccess: (_data, payload) => {
      queryClient.invalidateQueries({
        queryKey: paymentQueryKeys.accounts(payload.schoolId),
      })
      toast.success("Payment provider onboarding started.")
    },
    onError: (error: Error) => toast.error(error.message),
  })
  return {
    onboardProviderAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  }
}

export const useRefreshSchoolPaymentProvider = () => {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (payload: RefreshSchoolPaymentProviderPayloadI) =>
      refreshSchoolPaymentProviderApi(payload),
    onSuccess: (_data, payload) => {
      queryClient.invalidateQueries({
        queryKey: paymentQueryKeys.accounts(payload.schoolId),
      })
      toast.success("Provider status refreshed.")
    },
    onError: (error: Error) => toast.error(error.message),
  })
  return {
    refreshProviderAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
  }
}

export const useDisconnectSchoolPaymentProvider = () => {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (payload: DisconnectSchoolPaymentProviderPayloadI) =>
      disconnectSchoolPaymentProviderApi(payload),
    onSuccess: (_data, payload) => {
      queryClient.invalidateQueries({
        queryKey: paymentQueryKeys.accounts(payload.schoolId),
      })
      toast.success("Payment provider disconnected from routing.")
    },
    onError: (error: Error) => toast.error(error.message),
  })
  return {
    disconnectProviderAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
  }
}

export const useGetSchoolPaymentTransactions = (
  params: GetSchoolPaymentTransactionsParamsI
) => {
  const query = useQuery({
    queryKey: paymentQueryKeys.transactions(params),
    queryFn: () => getSchoolPaymentTransactionsApi(params),
    enabled: !!params.schoolId,
    placeholderData: keepPreviousData,
  })
  return {
    transactions: query.data?.value?.items ?? [],
    pagination: query.data?.value,
    isLoading: query.isPending,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export const useRequestPaymentRefund = () => {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (payload: RequestPaymentRefundPayloadI) =>
      requestPaymentRefundApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentQueryKeys.root })
      toast.success("Refund request submitted.")
    },
    onError: (error: Error) => toast.error(error.message),
  })
  return {
    requestRefundAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
  }
}

export const useGetSchoolPaymentRefunds = (
  params: GetSchoolPaymentRefundsParamsI
) => {
  const query = useQuery({
    queryKey: paymentQueryKeys.refunds(params),
    queryFn: () => getSchoolPaymentRefundsApi(params),
    enabled: !!params.schoolId,
    placeholderData: keepPreviousData,
  })
  return {
    refunds: query.data?.value?.items ?? [],
    pagination: query.data?.value,
    isLoading: query.isPending,
  }
}

export const useGetSchoolPaymentDisputes = (
  params: GetSchoolPaymentDisputesParamsI
) => {
  const query = useQuery({
    queryKey: paymentQueryKeys.disputes(params),
    queryFn: () => getSchoolPaymentDisputesApi(params),
    enabled: !!params.schoolId,
    placeholderData: keepPreviousData,
  })
  return {
    disputes: query.data?.value?.items ?? [],
    pagination: query.data?.value,
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
  }
}

export const useResolvePaymentDispute = () => {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (payload: ResolvePaymentDisputePayloadI) =>
      resolvePaymentDisputeApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentQueryKeys.root })
      toast.success("Dispute response submitted.")
    },
    onError: (error: Error) => toast.error(error.message),
  })
  return {
    resolveDisputeAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
  }
}

export const useGetSchoolPaymentSettlements = (
  params: GetSchoolPaymentSettlementsParamsI
) => {
  const query = useQuery({
    queryKey: paymentQueryKeys.settlements(params),
    queryFn: () => getSchoolPaymentSettlementsApi(params),
    enabled: !!params.schoolId,
    placeholderData: keepPreviousData,
  })
  return {
    settlements: query.data?.value?.items ?? [],
    pagination: query.data?.value,
    isLoading: query.isPending,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    // PaymentSettlements destructures `refetch` to refresh after reconciling.
    // It was never returned here, so `tsc -b` failed on that page — the only
    // type error in the repo before this session's changes.
    refetch: query.refetch,
  }
}

export const useReconcileSchoolSettlements = () => {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: (payload: ReconcileSchoolSettlementsPayloadI) =>
      reconcileSchoolSettlementsApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentQueryKeys.root })
      toast.success("Settlement reconciliation completed.")
    },
    onError: (error: Error) => toast.error(error.message),
  })
  return {
    reconcileSettlementsAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
  }
}
