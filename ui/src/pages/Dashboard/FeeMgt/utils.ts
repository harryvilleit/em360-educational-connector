import type { PaymentReminderStatus } from "./components/StatusBadge"
import { TransactionMode } from "@/api/feeManagement.api/types"
import { formatCompactCurrency } from "@/utils/currency"

export function getPaymentReminderStatus(
  outstandingBalance: number,
  amountPaid: number
): PaymentReminderStatus {
  if (outstandingBalance <= 0) return "paid"
  if (amountPaid > 0) return "partial"
  return "owing"
}

export function isIncomeCategory(category: string): boolean {
  return category === "Income"
}

export function getTransactionCategoryLabel(category: string): string {
  return category || "Unknown"
}

const TRANSACTION_MODE_LABELS: Record<number, string> = {
  [TransactionMode.Cash]: "Cash",
  [TransactionMode.Transfer]: "Transfer",
}

export function getTransactionModeLabel(mode: number): string {
  return TRANSACTION_MODE_LABELS[mode] ?? "Unknown"
}

export function isTransactionTypeActive(status: string | number): boolean {
  return status === 1 || String(status).toLowerCase() === "active"
}

export function formatCompactMoney(
  amount: number,
  currencyCode: string
): string {
  return formatCompactCurrency(amount, currencyCode)
}
