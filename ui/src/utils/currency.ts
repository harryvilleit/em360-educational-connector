const FALLBACK_CURRENCY = "NGN"

export function normaliseCurrencyCode(currencyCode?: string | null): string {
  const value = currencyCode?.trim().toUpperCase()
  return value && value.length === 3 ? value : FALLBACK_CURRENCY
}

export function formatCurrency(
  amount: number,
  currencyCode?: string | null,
  options?: Intl.NumberFormatOptions
): string {
  const currency = normaliseCurrencyCode(currencyCode)

  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      ...options,
    }).format(Number.isFinite(amount) ? amount : 0)
  } catch {
    return `${currency} ${(Number.isFinite(amount) ? amount : 0).toLocaleString()}`
  }
}

export function getCurrencySymbol(currencyCode?: string | null): string {
  const currency = normaliseCurrencyCode(currencyCode)

  try {
    const symbol = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      maximumFractionDigits: 0,
    })
      .formatToParts(0)
      .find((part) => part.type === "currency")?.value

    return symbol || currency
  } catch {
    return currency
  }
}

export function formatCompactCurrency(
  amount: number,
  currencyCode?: string | null
): string {
  return formatCurrency(amount, currencyCode, {
    notation: "compact",
    maximumFractionDigits: 1,
  })
}
