import apiClient from "../api"
import { normalizeResponse } from "@/utils/apiResponse"
import type {
  SubscriptionApiResultI,
  StudentAdditionQuoteI,
  GetSchoolSubscriptionOverviewResponseI,
  GetSubscriptionPricingMarketsResponseI,
  GetSubscriptionPlansResponseI,
  SelectSchoolSubscriptionPayloadI,
  SelectSchoolSubscriptionResponseI,
  InitializeSchoolSubscriptionCheckoutPayloadI,
  InitializeSchoolSubscriptionCheckoutResponseI,
  VerifySchoolSubscriptionCheckoutPayloadI,
  VerifySchoolSubscriptionCheckoutResponseI,
} from "./types"

export async function getSubscriptionPlansApi(params?: {
  marketCode?: string
  schoolId?: string
}): Promise<GetSubscriptionPlansResponseI> {
  const query = new URLSearchParams()
  if (params?.marketCode) query.set("marketCode", params.marketCode)
  if (params?.schoolId) query.set("schoolId", params.schoolId)
  const suffix = query.size > 0 ? `?${query.toString()}` : ""
  const response = await apiClient.get(`/SubscriptionPlans${suffix}`)
  return normalizeResponse<GetSubscriptionPlansResponseI>(response)
}

export async function initializeSchoolSubscriptionCheckoutApi(
  payload: InitializeSchoolSubscriptionCheckoutPayloadI
): Promise<InitializeSchoolSubscriptionCheckoutResponseI> {
  const response = await apiClient.post(
    `/SchoolSubscriptions/schools/${encodeURIComponent(payload.schoolId)}/checkout`,
    {
      subscriptionId: payload.subscriptionId,
      idempotencyKey: payload.idempotencyKey,
      providerKey: payload.providerKey,
    }
  )
  return normalizeResponse<InitializeSchoolSubscriptionCheckoutResponseI>(
    response
  )
}

export async function verifySchoolSubscriptionCheckoutApi(
  payload: VerifySchoolSubscriptionCheckoutPayloadI
): Promise<VerifySchoolSubscriptionCheckoutResponseI> {
  const response = await apiClient.post(
    `/SchoolSubscriptions/schools/${encodeURIComponent(payload.schoolId)}/verify`,
    { paymentReference: payload.paymentReference }
  )
  return normalizeResponse<VerifySchoolSubscriptionCheckoutResponseI>(response)
}

export async function getSubscriptionPricingMarketsApi(): Promise<GetSubscriptionPricingMarketsResponseI> {
  const response = await apiClient.get("/SubscriptionPlans/markets")
  return normalizeResponse<GetSubscriptionPricingMarketsResponseI>(response)
}

export async function getSchoolSubscriptionOverviewApi(
  schoolId: string
): Promise<GetSchoolSubscriptionOverviewResponseI> {
  const response = await apiClient.get(
    `/SchoolSubscriptions/schools/${encodeURIComponent(schoolId)}`
  )
  return normalizeResponse<GetSchoolSubscriptionOverviewResponseI>(response)
}

export async function selectSchoolSubscriptionApi(
  payload: SelectSchoolSubscriptionPayloadI
): Promise<SelectSchoolSubscriptionResponseI> {
  const response = await apiClient.post(
    `/SchoolSubscriptions/schools/${encodeURIComponent(payload.schoolId)}/select`,
    {
      planCode: payload.planCode,
    }
  )
  return normalizeResponse<SelectSchoolSubscriptionResponseI>(response)
}

export async function getStudentAdditionQuoteApi(schoolId: string, addedStudents: number) {
  const response = await apiClient.get(
    `/SchoolSubscriptions/schools/${encodeURIComponent(schoolId)}/student-addition-quote?addedStudents=${addedStudents}`
  )
  return normalizeResponse<SubscriptionApiResultI<StudentAdditionQuoteI>>(response)
}

export async function createSubscriptionBillingPortalApi(schoolId: string) {
  const response = await apiClient.post(
    `/SchoolSubscriptions/schools/${encodeURIComponent(schoolId)}/manage-payment`, {}
  )
  return normalizeResponse<SubscriptionApiResultI<{ url: string }>>(response)
}

export async function purchaseStudentPlacesApi(
  schoolId: string,
  quote: StudentAdditionQuoteI,
  idempotencyKey: string
): Promise<InitializeSchoolSubscriptionCheckoutResponseI> {
  const response = await apiClient.post(
    `/SchoolSubscriptions/schools/${encodeURIComponent(schoolId)}/student-additions`,
    {
      addedStudents: quote.addedStudents,
      expectedAmount: quote.amountDue,
      expectedMonthlyTotal: quote.nextMonthlyTotal,
      expectedPeriodEndUtc: quote.periodEndUtc,
      idempotencyKey,
    }
  )
  return normalizeResponse<InitializeSchoolSubscriptionCheckoutResponseI>(response)
}
