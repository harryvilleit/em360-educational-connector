import apiClient from "../api"
import { normalizeResponse } from "@/utils/apiResponse"
import type {
  DisconnectSchoolPaymentProviderPayloadI,
  DisconnectSchoolPaymentProviderResponseI,
  GetPaymentProvidersResponseI,
  GetSchoolFinancialProfileResponseI,
  GetSchoolPaymentDisputesParamsI,
  GetSchoolPaymentDisputesResponseI,
  GetSchoolPaymentProviderAccountsResponseI,
  GetSchoolPaymentRefundsParamsI,
  GetSchoolPaymentRefundsResponseI,
  GetSchoolPaymentSettlementsParamsI,
  GetSchoolPaymentSettlementsResponseI,
  GetSchoolPaymentTransactionsParamsI,
  GetSchoolPaymentTransactionsResponseI,
  GetSettlementBanksResponseI,
  InitialiseWalletFundingPayloadI,
  InitialiseWalletFundingResponseI,
  OnboardSchoolPaymentProviderPayloadI,
  OnboardSchoolPaymentProviderResponseI,
  ReconcileSchoolSettlementsPayloadI,
  ReconcileSchoolSettlementsResponseI,
  RefreshSchoolPaymentProviderPayloadI,
  RefreshSchoolPaymentProviderResponseI,
  RequestPaymentRefundPayloadI,
  RequestPaymentRefundResponseI,
  ResolvePaymentDisputePayloadI,
  ResolvePaymentDisputeResponseI,
  ResolveSettlementAccountPayloadI,
  ResolveSettlementAccountResponseI,
  UpdateSchoolFinancialProfilePayloadI,
  UpdateSchoolFinancialProfileResponseI,
  VerifyPaymentResponseI,
} from "./types"

export const initialiseWalletFundingApi = async (
  payload: InitialiseWalletFundingPayloadI
): Promise<InitialiseWalletFundingResponseI> => {
  const response = await apiClient.post(
    "/Payment/initialise-wallet-funding",
    payload
  )
  return normalizeResponse<InitialiseWalletFundingResponseI>(response)
}

export const verifyPaymentApi = async (
  reference: string
): Promise<VerifyPaymentResponseI> => {
  const response = await apiClient.get("/Payment/verify", {
    params: { reference },
  })
  return normalizeResponse<VerifyPaymentResponseI>(response)
}

export const getPaymentProvidersApi = async (params?: {
  countryCode?: string
  currencyCode?: string
}): Promise<GetPaymentProvidersResponseI> => {
  const response = await apiClient.get("/Payment/providers", { params })
  return normalizeResponse<GetPaymentProvidersResponseI>(response)
}

export const getSchoolPaymentProviderAccountsApi = async (
  schoolId: string
): Promise<GetSchoolPaymentProviderAccountsResponseI> => {
  const response = await apiClient.get(`/Payment/schools/${schoolId}/providers`)
  return normalizeResponse<GetSchoolPaymentProviderAccountsResponseI>(response)
}

export const getSchoolFinancialProfileApi = async (
  schoolId: string
): Promise<GetSchoolFinancialProfileResponseI> => {
  const response = await apiClient.get(
    `/Payment/schools/${schoolId}/financial-profile`
  )
  return normalizeResponse<GetSchoolFinancialProfileResponseI>(response)
}

export const updateSchoolFinancialProfileApi = async (
  payload: UpdateSchoolFinancialProfilePayloadI
): Promise<UpdateSchoolFinancialProfileResponseI> => {
  const response = await apiClient.put(
    `/Payment/schools/${payload.schoolId}/financial-profile`,
    {
      countryCode: payload.countryCode,
      baseCurrency: payload.baseCurrency,
    }
  )
  return normalizeResponse<UpdateSchoolFinancialProfileResponseI>(response)
}

export const getSettlementBanksApi = async (params: {
  schoolId: string
  providerKey: string
}): Promise<GetSettlementBanksResponseI> => {
  const response = await apiClient.get(
    `/Payment/schools/${params.schoolId}/providers/${params.providerKey}/settlement-banks`
  )
  return normalizeResponse<GetSettlementBanksResponseI>(response)
}

export const resolveSettlementAccountApi = async (
  payload: ResolveSettlementAccountPayloadI
): Promise<ResolveSettlementAccountResponseI> => {
  const response = await apiClient.post(
    `/Payment/schools/${payload.schoolId}/providers/${payload.providerKey}/resolve-settlement-account`,
    {
      // Older API builds bind the MediatR query before applying route values.
      schoolId: payload.schoolId,
      providerKey: payload.providerKey,
      bankCode: payload.bankCode,
      accountNumber: payload.accountNumber,
    }
  )
  return normalizeResponse<ResolveSettlementAccountResponseI>(response)
}

export const onboardSchoolPaymentProviderApi = async (
  payload: OnboardSchoolPaymentProviderPayloadI
): Promise<OnboardSchoolPaymentProviderResponseI> => {
  const url =
    `/Payment/schools/${payload.schoolId}` +
    `/providers/${payload.providerKey}/onboard`
  const requestBody = {
    // Keep these in the body for compatibility with API builds that bind the
    // MediatR command directly. Current API builds use the route values as
    // authoritative and safely ignore these duplicate JSON properties.
    schoolId: payload.schoolId,
    providerKey: payload.providerKey,
    countryCode: payload.countryCode,
    currencyCode: payload.currencyCode,
    isDefault: payload.isDefault ?? true,
    existingExternalAccountId: payload.existingExternalAccountId,
    providerParameters: payload.providerParameters ?? {},
  }

  const response = await apiClient.post(url, requestBody)
  return normalizeResponse<OnboardSchoolPaymentProviderResponseI>(response)
}

export const refreshSchoolPaymentProviderApi = async (
  payload: RefreshSchoolPaymentProviderPayloadI
): Promise<RefreshSchoolPaymentProviderResponseI> => {
  const response = await apiClient.post(
    `/Payment/schools/${payload.schoolId}/providers/accounts/${payload.accountId}/refresh`,
    undefined,
    { params: { createOnboardingLink: payload.createOnboardingLink ?? false } }
  )
  return normalizeResponse<RefreshSchoolPaymentProviderResponseI>(response)
}

export const disconnectSchoolPaymentProviderApi = async (
  payload: DisconnectSchoolPaymentProviderPayloadI
): Promise<DisconnectSchoolPaymentProviderResponseI> => {
  const response = await apiClient.post(
    `/Payment/schools/${payload.schoolId}/providers/accounts/${payload.accountId}/disconnect`
  )
  return normalizeResponse<DisconnectSchoolPaymentProviderResponseI>(response)
}

export const getSchoolPaymentTransactionsApi = async (
  params: GetSchoolPaymentTransactionsParamsI
): Promise<GetSchoolPaymentTransactionsResponseI> => {
  const { schoolId, ...query } = params
  const response = await apiClient.get(
    `/Payment/schools/${schoolId}/transactions`,
    { params: query }
  )
  return normalizeResponse<GetSchoolPaymentTransactionsResponseI>(response)
}

export const requestPaymentRefundApi = async (
  payload: RequestPaymentRefundPayloadI
): Promise<RequestPaymentRefundResponseI> => {
  const response = await apiClient.post(
    `/Payment/schools/${payload.schoolId}/transactions/${payload.paymentTransactionId}/refunds`,
    { amount: payload.amount, reason: payload.reason }
  )
  return normalizeResponse<RequestPaymentRefundResponseI>(response)
}

export const getSchoolPaymentRefundsApi = async (
  params: GetSchoolPaymentRefundsParamsI
): Promise<GetSchoolPaymentRefundsResponseI> => {
  const { schoolId, ...query } = params
  const response = await apiClient.get(`/Payment/schools/${schoolId}/refunds`, {
    params: query,
  })
  return normalizeResponse<GetSchoolPaymentRefundsResponseI>(response)
}

export const getSchoolPaymentDisputesApi = async (
  params: GetSchoolPaymentDisputesParamsI
): Promise<GetSchoolPaymentDisputesResponseI> => {
  const { schoolId, ...query } = params
  const response = await apiClient.get(
    `/Payment/schools/${schoolId}/disputes`,
    {
      params: query,
    }
  )
  return normalizeResponse<GetSchoolPaymentDisputesResponseI>(response)
}

export const resolvePaymentDisputeApi = async (
  payload: ResolvePaymentDisputePayloadI
): Promise<ResolvePaymentDisputeResponseI> => {
  const response = await apiClient.post(
    `/Payment/schools/${payload.schoolId}/disputes/${payload.disputeId}/resolve`,
    {
      resolution: payload.resolution,
      message: payload.message,
      evidence: payload.evidence ?? {},
    }
  )
  return normalizeResponse<ResolvePaymentDisputeResponseI>(response)
}

export const reconcileSchoolSettlementsApi = async (
  payload: ReconcileSchoolSettlementsPayloadI
): Promise<ReconcileSchoolSettlementsResponseI> => {
  const response = await apiClient.post(
    `/Payment/schools/${payload.schoolId}/providers/accounts/${payload.accountId}/reconcile`,
    undefined,
    { params: { fromUtc: payload.fromUtc, toUtc: payload.toUtc } }
  )
  return normalizeResponse<ReconcileSchoolSettlementsResponseI>(response)
}

export const getSchoolPaymentSettlementsApi = async (
  params: GetSchoolPaymentSettlementsParamsI
): Promise<GetSchoolPaymentSettlementsResponseI> => {
  const { schoolId, ...query } = params
  const response = await apiClient.get(
    `/Payment/schools/${schoolId}/settlements`,
    { params: query }
  )
  return normalizeResponse<GetSchoolPaymentSettlementsResponseI>(response)
}
