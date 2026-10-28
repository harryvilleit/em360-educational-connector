import { currencyForTutorCountry } from "@/lib/lms-market-policy"
import { COUNTRY_CALLING_OPTIONS } from "@/utils/phone"

export const SCHOOL_COUNTRY_OPTIONS = COUNTRY_CALLING_OPTIONS.map(
  (country) => ({
    value: country.iso,
    label: `${country.name} (${country.iso})`,
  })
)

export const SCHOOL_CURRENCY_OPTIONS = [
  { value: "NGN", label: "Nigerian naira (NGN)" },
  { value: "USD", label: "US dollar (USD)" },
  { value: "GBP", label: "British pound (GBP)" },
  { value: "EUR", label: "Euro (EUR)" },
]

export function defaultSchoolCurrency(countryCode?: string | null) {
  return currencyForTutorCountry(countryCode)
}

export function financialCountryLabel(countryCode: string) {
  const code = countryCode.trim().toUpperCase()
  const known = SCHOOL_COUNTRY_OPTIONS.find((country) => country.value === code)
  if (known) return known.label

  try {
    const name = new Intl.DisplayNames(undefined, { type: "region" }).of(code)
    return name && name !== code ? `${name} (${code})` : code
  } catch {
    return code
  }
}

export function financialCurrencyLabel(currencyCode: string) {
  const code = currencyCode.trim().toUpperCase()
  const known = SCHOOL_CURRENCY_OPTIONS.find(
    (currency) => currency.value === code
  )
  if (known) return known.label

  try {
    const name = new Intl.DisplayNames(undefined, { type: "currency" }).of(code)
    return name && name !== code ? `${name} (${code})` : code
  } catch {
    return code
  }
}
