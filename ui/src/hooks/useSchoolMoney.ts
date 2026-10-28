import { useCallback } from "react"
import { useSchoolCurrency } from "@/contexts/SchoolContext"
import { formatCurrency, getCurrencySymbol } from "@/utils/currency"

export function useSchoolMoney() {
  const currencyCode = useSchoolCurrency()
  const currencySymbol = getCurrencySymbol(currencyCode)
  const formatMoney = useCallback(
    (amount: number, options?: Intl.NumberFormatOptions) =>
      formatCurrency(amount, currencyCode, options),
    [currencyCode]
  )

  return { currencyCode, currencySymbol, formatMoney }
}
