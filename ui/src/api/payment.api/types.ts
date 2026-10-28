export interface InitialiseWalletFundingPayloadI {
  studentId: string
  schoolId: string
  amount: number
  schoolStudentBillId?: string
}

export interface WalletFundingDetailsI {
  reference: string
  providerKey: string
  providerReference?: string | null
  authorizationUrl: string
  accessCode?: string | null
  studentId: string
  schoolId: string
  amount: number
  walletAmount: number
  customerChargedAmount: number
  platformFeeAmount: number
  estimatedSchoolSettlementAmount: number
  currencyCode: string
  platformFeeChargeMode: PlatformFeeChargeMode
}

export interface InitialiseWalletFundingResponseI {
  isSuccess: boolean
  message?: string
  error?: string
  isFailure?: boolean
  statusCode: number
  value: WalletFundingDetailsI
}

export const PaymentProviderAccountStatus = {
  NotStarted: 0,
  Pending: 1,
  Active: 2,
  Restricted: 3,
  Disabled: 4,
} as const
export type PaymentProviderAccountStatus =
  (typeof PaymentProviderAccountStatus)[keyof typeof PaymentProviderAccountStatus]

export const PaymentTransactionStatus = {
  Pending: 0,
  Processing: 1,
  Succeeded: 2,
  Failed: 3,
  Cancelled: 4,
  Refunded: 5,
  PartiallyRefunded: 6,
} as const
export type PaymentTransactionStatus =
  (typeof PaymentTransactionStatus)[keyof typeof PaymentTransactionStatus]

export const PaymentRefundStatus = {
  Requested: 0,
  Processing: 1,
  RequiresAction: 2,
  Succeeded: 3,
  Failed: 4,
  Cancelled: 5,
} as const
export type PaymentRefundStatus =
  (typeof PaymentRefundStatus)[keyof typeof PaymentRefundStatus]

export const PaymentDisputeStatus = {
  Open: 0,
  NeedsResponse: 1,
  UnderReview: 2,
  Won: 3,
  Lost: 4,
  Accepted: 5,
  Closed: 6,
} as const
export type PaymentDisputeStatus =
  (typeof PaymentDisputeStatus)[keyof typeof PaymentDisputeStatus]

export const PaymentDisputeResolution = {
  Accept: 0,
  Challenge: 1,
} as const
export type PaymentDisputeResolution =
  (typeof PaymentDisputeResolution)[keyof typeof PaymentDisputeResolution]

export const PaymentSettlementStatus = {
  Pending: 0,
  Processing: 1,
  Succeeded: 2,
  Failed: 3,
  Cancelled: 4,
} as const
export type PaymentSettlementStatus =
  (typeof PaymentSettlementStatus)[keyof typeof PaymentSettlementStatus]

export const PaymentReconciliationMatchStatus = {
  Unmatched: 0,
  Matched: 1,
  AmountMismatch: 2,
  CurrencyMismatch: 3,
} as const
export type PaymentReconciliationMatchStatus =
  (typeof PaymentReconciliationMatchStatus)[keyof typeof PaymentReconciliationMatchStatus]

export const PlatformFeeChargeMode = {
  DeductFromSettlement: 0,
  AddToPayer: 1,
} as const
export type PlatformFeeChargeMode =
  (typeof PlatformFeeChargeMode)[keyof typeof PlatformFeeChargeMode]

export interface PaymentResultI<T> {
  isSuccess: boolean
  message?: string
  error?: string
  isFailure?: boolean
  statusCode: number
  value: T
}

export interface PaginatedPaymentValueI<T> {
  items: T[]
  pageNumber: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface VerifyPaymentDetailsI {
  message?: string
  reference: string
  providerKey: string
  walletAmount?: number
  amount?: number
  customerChargedAmount?: number
  platformFeeAmount?: number
  estimatedSchoolSettlementAmount?: number
  currencyCode: string
  newWalletBalance?: number
  purposeType?: "WalletFunding" | "SchoolFeePayment"
  purposeStatus?: "Pending" | "Processing" | "Succeeded" | "Failed"
  purposeAppliedAmount?: number
  purposeSchoolId?: string
  purposeStudentId?: string
  purposeSchoolStudentBillId?: string
  purposeFailureReason?: string | null
}

export type VerifyPaymentResponseI = PaymentResultI<VerifyPaymentDetailsI>

export interface PaymentProviderMarketI {
  routeId: string
  countryCode: string
  currencyCode: string
  priority: number
  allowOnboarding: boolean
  allowPayments: boolean
  allowRefunds: boolean
  allowDisputes: boolean
  allowSettlementReconciliation: boolean
  allowSettlementBankDiscovery: boolean
  allowSettlementAccountResolution: boolean
  currencyDecimalPlaces: number
  providerMinorUnitDecimalPlaces: number
  minimumPaymentAmount?: number | null
  maximumPaymentAmount?: number | null
}

export interface PaymentProviderDescriptorI {
  key: string
  displayName: string
  isConfigured: boolean
  supportsConnectedAccounts: boolean
  supportsManagedSubAccounts: boolean
  supportsPlatformFees: boolean
  supportsDirectSettlement: boolean
  supportsRefunds: boolean
  supportsPartialRefunds: boolean
  supportsDisputes: boolean
  supportsSettlementReconciliation: boolean
  supportsSettlementBankDiscovery: boolean
  supportedCurrencies: string[]
  markets: PaymentProviderMarketI[]
}

export type GetPaymentProvidersResponseI = PaymentResultI<
  PaymentProviderDescriptorI[]
>

export interface SchoolPaymentProviderAccountI {
  id: string
  schoolId: string
  providerKey: string
  countryCode: string
  currencyCode: string
  externalAccountId?: string | null
  connectionType: number
  accountStatus: PaymentProviderAccountStatus
  paymentsEnabled: boolean
  payoutsEnabled: boolean
  isDefault: boolean
  displayName?: string | null
  settlementAccountLast4?: string | null
  onboardingUrl?: string | null
  lastVerifiedAtUtc?: string | null
}

export type GetSchoolPaymentProviderAccountsResponseI = PaymentResultI<
  SchoolPaymentProviderAccountI[]
>

export interface UpdateSchoolFinancialProfilePayloadI {
  schoolId: string
  countryCode: string
  baseCurrency: string
}

export interface SchoolFinancialProfileI {
  id: string
  countryCode: string | null
  baseCurrency: string | null
}

export type GetSchoolFinancialProfileResponseI =
  PaymentResultI<SchoolFinancialProfileI>

export type UpdateSchoolFinancialProfileResponseI =
  PaymentResultI<SchoolFinancialProfileI>

export interface SettlementBankI {
  code: string
  name: string
  countryCode?: string | null
  currencyCode?: string | null
  type?: string | null
}

export type GetSettlementBanksResponseI = PaymentResultI<SettlementBankI[]>

export interface ResolveSettlementAccountPayloadI {
  schoolId: string
  providerKey: string
  bankCode: string
  accountNumber: string
}

export interface SettlementAccountResolutionI {
  success: boolean
  message: string
  accountName?: string | null
  accountNumber?: string | null
}

export type ResolveSettlementAccountResponseI =
  PaymentResultI<SettlementAccountResolutionI>

export interface OnboardSchoolPaymentProviderPayloadI {
  schoolId: string
  providerKey: string
  countryCode?: string
  currencyCode?: string
  isDefault?: boolean
  existingExternalAccountId?: string
  providerParameters?: Record<string, string>
}

export type OnboardSchoolPaymentProviderResponseI =
  PaymentResultI<SchoolPaymentProviderAccountI>

export interface RefreshSchoolPaymentProviderPayloadI {
  schoolId: string
  accountId: string
  createOnboardingLink?: boolean
}

export type RefreshSchoolPaymentProviderResponseI =
  PaymentResultI<SchoolPaymentProviderAccountI>

export interface DisconnectSchoolPaymentProviderPayloadI {
  schoolId: string
  accountId: string
}

export type DisconnectSchoolPaymentProviderResponseI = PaymentResultI<unknown>

export interface PaymentTransactionI {
  id: string
  reference: string
  schoolId: string
  studentId: string
  guardianId?: string | null
  providerKey: string
  providerReference?: string | null
  walletAmount: number
  customerChargedAmount: number
  platformFeeAmount: number
  providerFeeAmount?: number | null
  estimatedSchoolSettlementAmount: number
  currencyCode: string
  platformFeeChargeMode: PlatformFeeChargeMode
  paymentStatus: PaymentTransactionStatus
  walletCredited: boolean
  dateCreated: string
  paidAtUtc?: string | null
}

export interface GetSchoolPaymentTransactionsParamsI {
  schoolId: string
  status?: PaymentTransactionStatus
  pageNumber?: number
  pageSize?: number
}

export type GetSchoolPaymentTransactionsResponseI = PaymentResultI<
  PaginatedPaymentValueI<PaymentTransactionI>
>

export interface PaymentRefundI {
  id: string
  paymentTransactionId: string
  schoolId: string
  studentId: string
  providerKey: string
  providerRefundId?: string | null
  amount: number
  providerRefundAmount: number
  platformFeeRefundAmount: number
  outstandingWalletAmount: number
  currencyCode: string
  refundStatus: PaymentRefundStatus
  walletReversed: boolean
  reason?: string | null
  failureReason?: string | null
  requestedAtUtc: string
  refundedAtUtc?: string | null
}

export interface RequestPaymentRefundPayloadI {
  schoolId: string
  paymentTransactionId: string
  amount: number
  reason?: string
}

export type RequestPaymentRefundResponseI = PaymentResultI<PaymentRefundI>

export interface GetSchoolPaymentRefundsParamsI {
  schoolId: string
  status?: PaymentRefundStatus
  pageNumber?: number
  pageSize?: number
}

export type GetSchoolPaymentRefundsResponseI = PaymentResultI<
  PaginatedPaymentValueI<PaymentRefundI>
>

export interface PaymentDisputeI {
  id: string
  paymentTransactionId: string
  schoolId: string
  studentId: string
  providerKey: string
  providerDisputeId: string
  disputedAmount: number
  walletImpactAmount: number
  walletRecoveredAmount: number
  outstandingWalletAmount: number
  currencyCode: string
  disputeStatus: PaymentDisputeStatus
  reason?: string | null
  evidenceDueAtUtc?: string | null
  openedAtUtc: string
  resolvedAtUtc?: string | null
}

export interface GetSchoolPaymentDisputesParamsI {
  schoolId: string
  status?: PaymentDisputeStatus
  pageNumber?: number
  pageSize?: number
}

export type GetSchoolPaymentDisputesResponseI = PaymentResultI<
  PaginatedPaymentValueI<PaymentDisputeI>
>

export interface ResolvePaymentDisputePayloadI {
  schoolId: string
  disputeId: string
  resolution: PaymentDisputeResolution
  message?: string
  evidence?: Record<string, string>
}

export type ResolvePaymentDisputeResponseI = PaymentResultI<PaymentDisputeI>

export interface PaymentSettlementItemI {
  id: string
  itemType: number
  matchStatus: PaymentReconciliationMatchStatus
  paymentTransactionId?: string | null
  paymentRefundId?: string | null
  paymentDisputeId?: string | null
  externalItemId: string
  providerReference?: string | null
  grossAmount: number
  providerFeeAmount: number
  netAmount: number
  currencyCode: string
  matchMessage?: string | null
  occurredAtUtc?: string | null
}

export interface PaymentSettlementI {
  id: string
  schoolId: string
  providerKey: string
  externalSettlementId: string
  settlementStatus: PaymentSettlementStatus
  currencyCode: string
  grossAmount: number
  providerFeeAmount: number
  netAmount: number
  matchedNetAmount: number
  unmatchedNetAmount: number
  isReconciled: boolean
  settlementDateUtc?: string | null
  lastReconciledAtUtc: string
  items: PaymentSettlementItemI[]
}

export interface GetSchoolPaymentSettlementsParamsI {
  schoolId: string
  providerAccountId?: string
  reconciled?: boolean
  pageNumber?: number
  pageSize?: number
}

export type GetSchoolPaymentSettlementsResponseI = PaymentResultI<
  PaginatedPaymentValueI<PaymentSettlementI>
>

export interface ReconcileSchoolSettlementsPayloadI {
  schoolId: string
  accountId: string
  fromUtc: string
  toUtc: string
}

export interface PaymentReconciliationResultI {
  success: boolean
  message: string
  settlementCount: number
  matchedItemCount: number
  unmatchedItemCount: number
}

export type ReconcileSchoolSettlementsResponseI =
  PaymentResultI<PaymentReconciliationResultI>

export interface PendingWalletFundingReturnI {
  reference: string
  returnUrl: string
  currencyCode: string
  createdAtUtc: string
}
