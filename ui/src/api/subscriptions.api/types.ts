import type { ApiResultI } from "@/utils/apiResponse"

export type SubscriptionBillingCycle = "Monthly"

export type SchoolSubscriptionStatus =
  | "PendingPayment"
  | "Active"
  | "PastDue"
  | "Cancelled"
  | "Expired"

export interface SubscriptionPlanFeatureI {
  code: string
  name: string
}

export interface SubscriptionPlanI {
  id: string
  code: string
  name: string
  description: string
  currency: string
  pricingUnit: string
  pricePerUserPerMonth: number
  marketCode: string
  marketName: string
  resolvedCountryCode: string | null
  countrySource: string
  maxStudents: number | null
  maxStaff: number | null
  storageLimitGb: number
  isRecommended: boolean
  features: SubscriptionPlanFeatureI[]
}

export interface SchoolSubscriptionI {
  id: string
  schoolId: string
  status: SchoolSubscriptionStatus
  billingCycle: SubscriptionBillingCycle
  currency: string
  pricingMarketCode: string | null
  billableUserCount: number
  unitPrice: number
  monthlyTotal: number
  startedAtUtc: string | null
  currentPeriodStartUtc: string | null
  currentPeriodEndUtc: string | null
  cancelAtPeriodEnd: boolean
  plan: SubscriptionPlanI
}

export interface SchoolSubscriptionOverviewI {
  currentSubscription: SchoolSubscriptionI | null
  pendingSelection: SchoolSubscriptionI | null
  studentAdditions: StudentAdditionPaymentI[]
  currentStudents: number
  currentStaff: number
  canManageSubscription: boolean
  access?: {
    canLaunch: boolean
    reason: string
    accessEndsAtUtc: string | null
    isTrial: boolean
  }
}

export interface SubscriptionApiResultI<T> extends ApiResultI {
  value: T
  message?: string
  statusCode?: number
}

export type GetSubscriptionPlansResponseI = SubscriptionApiResultI<
  SubscriptionPlanI[]
>

export interface SubscriptionPricingMarketI {
  code: string
  name: string
  currency: string
  countryCodes: string[]
  isFallback: boolean
  sortOrder: number
}

export type GetSubscriptionPricingMarketsResponseI = SubscriptionApiResultI<
  SubscriptionPricingMarketI[]
>

export type GetSchoolSubscriptionOverviewResponseI =
  SubscriptionApiResultI<SchoolSubscriptionOverviewI>

export type SelectSchoolSubscriptionResponseI =
  SubscriptionApiResultI<SchoolSubscriptionI>

export interface SelectSchoolSubscriptionPayloadI {
  schoolId: string
  planCode: string
}

export interface SchoolSubscriptionCheckoutI {
  paymentReference: string
  providerKey: string
  checkoutUrl: string
  amount: number
  currency: string
  expiresAtUtc: string | null
}

export interface InitializeSchoolSubscriptionCheckoutPayloadI {
  schoolId: string
  subscriptionId: string
  idempotencyKey: string
  providerKey?: "stripe" | "paystack"
}

export type InitializeSchoolSubscriptionCheckoutResponseI =
  SubscriptionApiResultI<SchoolSubscriptionCheckoutI>

export interface VerifySchoolSubscriptionCheckoutPayloadI {
  schoolId: string
  paymentReference: string
}

export interface SchoolSubscriptionPaymentResultI {
  paymentReference: string
  isPaid: boolean
  isStudentAddition: boolean
  additionState: StudentAdditionState
  subscription: SchoolSubscriptionI
}

export type VerifySchoolSubscriptionCheckoutResponseI =
  SubscriptionApiResultI<SchoolSubscriptionPaymentResultI>

export interface StudentAdditionQuoteI {
  addedStudents: number
  periodDays: number
  usedDays: number
  remainingDays: number
  unitPrice: number
  amountDue: number
  nextMonthlyTotal: number
  currency: string
  periodStartUtc: string
  periodEndUtc: string
  effectiveAtUtc: string
}

export type StudentAdditionState =
  | "None"
  | "AwaitingPayment"
  | "SyncPending"
  | "Applied"
  | "ReviewRequired"
  | "ClosedUnpaid"

export interface StudentAdditionPaymentI {
  paymentReference: string
  addedStudents: number
  amount: number
  currency: string
  state: StudentAdditionState
  isPaid: boolean
  message: string | null
  checkoutUrl: string | null
}
