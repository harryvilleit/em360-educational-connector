import { useCallback } from "react"
import {
  useSchoolCurrency,
  useSchoolCurrencyConfigured,
} from "@/contexts/SchoolContext"
import { formatCompactCurrency, formatCurrency } from "@/utils/currency"

const finite = (amount: number) => (Number.isFinite(amount) ? amount : 0)

/**
 * Money formatting for reports. When the school has not set its base currency,
 * amounts are shown as plain numbers instead of in an assumed currency.
 */
export function useReportMoney() {
  const currencyCode = useSchoolCurrency()
  const configured = useSchoolCurrencyConfigured()

  const formatMoney = useCallback(
    (amount: number) =>
      configured
        ? formatCurrency(amount, currencyCode)
        : new Intl.NumberFormat(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(finite(amount)),
    [configured, currencyCode]
  )
  const formatCompactMoney = useCallback(
    (amount: number) =>
      configured
        ? formatCompactCurrency(amount, currencyCode)
        : new Intl.NumberFormat(undefined, {
            notation: "compact",
            maximumFractionDigits: 1,
          }).format(finite(amount)),
    [configured, currencyCode]
  )

  return { configured, currencyCode, formatMoney, formatCompactMoney }
}
