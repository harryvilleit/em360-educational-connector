import type { PendingWalletFundingReturnI } from "@/api/payment.api/types"

const WALLET_FUNDING_PREFIX = "em360-wallet-funding:"
const ONBOARDING_KEY = "em360-payment-onboarding-return"
const MAX_AGE_MS = 24 * 60 * 60 * 1000

export function createPaymentIdempotencyKey(scope: string) {
  const randomPart =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  return `${scope}:${randomPart}`
}

function storageAvailable() {
  return typeof window !== "undefined" && !!window.sessionStorage
}

export function saveWalletFundingReturn(value: PendingWalletFundingReturnI) {
  if (!storageAvailable()) return
  window.sessionStorage.setItem(
    `${WALLET_FUNDING_PREFIX}${value.reference}`,
    JSON.stringify(value)
  )
}

export function getWalletFundingReturn(
  reference: string
): PendingWalletFundingReturnI | null {
  if (!storageAvailable() || !reference) return null
  const raw = window.sessionStorage.getItem(
    `${WALLET_FUNDING_PREFIX}${reference}`
  )
  if (!raw) return null

  try {
    const value = JSON.parse(raw) as PendingWalletFundingReturnI
    const age = Date.now() - new Date(value.createdAtUtc).getTime()
    if (!Number.isFinite(age) || age > MAX_AGE_MS) {
      clearWalletFundingReturn(reference)
      return null
    }
    return value
  } catch {
    clearWalletFundingReturn(reference)
    return null
  }
}

export function clearWalletFundingReturn(reference: string) {
  if (!storageAvailable() || !reference) return
  window.sessionStorage.removeItem(`${WALLET_FUNDING_PREFIX}${reference}`)
}

export interface PaymentOnboardingReturnI {
  schoolId: string
  productId: string
  accountId?: string
  providerKey: string
  returnUrl: string
}

export function savePaymentOnboardingReturn(value: PaymentOnboardingReturnI) {
  if (!storageAvailable()) return
  window.sessionStorage.setItem(ONBOARDING_KEY, JSON.stringify(value))
}

export function getPaymentOnboardingReturn(): PaymentOnboardingReturnI | null {
  if (!storageAvailable()) return null
  const raw = window.sessionStorage.getItem(ONBOARDING_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as PaymentOnboardingReturnI
  } catch {
    return null
  }
}

export function clearPaymentOnboardingReturn() {
  if (!storageAvailable()) return
  window.sessionStorage.removeItem(ONBOARDING_KEY)
}
