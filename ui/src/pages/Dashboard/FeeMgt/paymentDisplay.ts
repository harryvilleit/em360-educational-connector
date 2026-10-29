import {
  PaymentDisputeStatus,
  PaymentProviderAccountStatus,
  PaymentReconciliationMatchStatus,
  PaymentRefundStatus,
  PaymentSettlementStatus,
  PaymentTransactionStatus,
} from "@/api/payment.api/types"

export const transactionStatusLabels: Record<number, string> = {
  [PaymentTransactionStatus.Pending]: "Pending",
  [PaymentTransactionStatus.Processing]: "Processing",
  [PaymentTransactionStatus.Succeeded]: "Succeeded",
  [PaymentTransactionStatus.Failed]: "Failed",
  [PaymentTransactionStatus.Cancelled]: "Cancelled",
  [PaymentTransactionStatus.Refunded]: "Refunded",
  [PaymentTransactionStatus.PartiallyRefunded]: "Partially refunded",
}

export const refundStatusLabels: Record<number, string> = {
  [PaymentRefundStatus.Requested]: "Requested",
  [PaymentRefundStatus.Processing]: "Processing",
  [PaymentRefundStatus.RequiresAction]: "Requires action",
  [PaymentRefundStatus.Succeeded]: "Succeeded",
  [PaymentRefundStatus.Failed]: "Failed",
  [PaymentRefundStatus.Cancelled]: "Cancelled",
}

export const disputeStatusLabels: Record<number, string> = {
  [PaymentDisputeStatus.Open]: "Open",
  [PaymentDisputeStatus.NeedsResponse]: "Needs response",
  [PaymentDisputeStatus.UnderReview]: "Under review",
  [PaymentDisputeStatus.Won]: "Won",
  [PaymentDisputeStatus.Lost]: "Lost",
  [PaymentDisputeStatus.Accepted]: "Accepted",
  [PaymentDisputeStatus.Closed]: "Closed",
}

export const settlementStatusLabels: Record<number, string> = {
  [PaymentSettlementStatus.Pending]: "Pending",
  [PaymentSettlementStatus.Processing]: "Processing",
  [PaymentSettlementStatus.Succeeded]: "Succeeded",
  [PaymentSettlementStatus.Failed]: "Failed",
  [PaymentSettlementStatus.Cancelled]: "Cancelled",
}

export const providerAccountStatusLabels: Record<number, string> = {
  [PaymentProviderAccountStatus.NotStarted]: "Not started",
  [PaymentProviderAccountStatus.Pending]: "Pending",
  [PaymentProviderAccountStatus.Active]: "Active",
  [PaymentProviderAccountStatus.Restricted]: "Restricted",
  [PaymentProviderAccountStatus.Disabled]: "Disabled",
}

export const reconciliationStatusLabels: Record<number, string> = {
  [PaymentReconciliationMatchStatus.Unmatched]: "Unmatched",
  [PaymentReconciliationMatchStatus.Matched]: "Matched",
  [PaymentReconciliationMatchStatus.AmountMismatch]: "Amount mismatch",
  [PaymentReconciliationMatchStatus.CurrencyMismatch]: "Currency mismatch",
}

type NumericEnumDefinition = Readonly<Record<string, number>>

function normalizeNumericEnum(
  value: unknown,
  definition: NumericEnumDefinition
): number | undefined {
  const allowedValues = Object.values(definition)

  if (typeof value === "number") {
    return allowedValues.includes(value) ? value : undefined
  }

  if (typeof value !== "string") return undefined
  const text = value.trim()
  if (!text) return undefined

  const numeric = Number(text)
  if (Number.isInteger(numeric) && allowedValues.includes(numeric)) {
    return numeric
  }

  const enumEntry = Object.entries(definition).find(
    ([name]) => name.toLowerCase() === text.toLowerCase()
  )
  return enumEntry?.[1]
}

function enumLabel(
  value: unknown,
  definition: NumericEnumDefinition,
  labels: Record<number, string>
): string {
  const normalized = normalizeNumericEnum(value, definition)
  return normalized === undefined ? "Unknown" : labels[normalized] ?? "Unknown"
}

export const transactionStatusValue = (value: unknown) =>
  normalizeNumericEnum(value, PaymentTransactionStatus)
export const transactionStatusLabel = (value: unknown) =>
  enumLabel(value, PaymentTransactionStatus, transactionStatusLabels)

export const refundStatusLabel = (value: unknown) =>
  enumLabel(value, PaymentRefundStatus, refundStatusLabels)

export const disputeStatusValue = (value: unknown) =>
  normalizeNumericEnum(value, PaymentDisputeStatus)
export const disputeStatusLabel = (value: unknown) =>
  enumLabel(value, PaymentDisputeStatus, disputeStatusLabels)

export const settlementStatusLabel = (value: unknown) =>
  enumLabel(value, PaymentSettlementStatus, settlementStatusLabels)

export const providerAccountStatusValue = (value: unknown) =>
  normalizeNumericEnum(value, PaymentProviderAccountStatus)
export const providerAccountStatusLabel = (value: unknown) =>
  enumLabel(value, PaymentProviderAccountStatus, providerAccountStatusLabels)

export const reconciliationStatusLabel = (value: unknown) =>
  enumLabel(
    value,
    PaymentReconciliationMatchStatus,
    reconciliationStatusLabels
  )

export function paymentStatusClass(label: string): string {
  const value = label.toLowerCase()
  if (value.includes("succeed") || value === "active" || value === "matched" || value === "won")
    return "bg-green-50 text-green-700"
  if (value.includes("fail") || value === "lost" || value === "restricted")
    return "bg-red-50 text-red-700"
  if (value.includes("cancel") || value === "disabled" || value === "closed")
    return "bg-gray-100 text-gray-700"
  if (value.includes("action") || value.includes("response") || value.includes("mismatch"))
    return "bg-amber-50 text-amber-700"
  return "bg-blue-50 text-blue-700"
}

export function formatPaymentDate(value?: string | null): string {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}
