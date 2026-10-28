import {
  getCountries,
  getCountryCallingCode,
  validatePhoneNumberLength,
  type CountryCode,
} from "libphonenumber-js/min"

export type { CountryCode }

export interface CountryCallingOption {
  iso: CountryCode
  name: string
  callingCode: string
}

const regionNames =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : undefined

function countryDisplayName(iso: CountryCode): string {
  return regionNames?.of(iso) ?? iso
}

export const COUNTRY_CALLING_OPTIONS: CountryCallingOption[] = getCountries()
  .map((iso) => ({
    iso,
    name: countryDisplayName(iso),
    callingCode: getCountryCallingCode(iso),
  }))
  .sort((a, b) => a.name.localeCompare(b.name))

// Text label for the searchable dropdown list. The flag itself is rendered
// as an SVG icon alongside this (see PhoneInput) rather than as an emoji
// character, since flag emoji don't render as flags on Windows.
export function formatCallingOption(option: CountryCallingOption): string {
  return `${option.name} (+${option.callingCode})`
}

// Compact label for the closed/selected state: dial code only, no name.
export function formatCompactCallingOption(option: CountryCallingOption): string {
  return `+${option.callingCode}`
}

export const DEFAULT_COUNTRY: CountryCode = "NG"

// A handful of calling codes are shared by several countries (NANP, Russia/
// Kazakhstan, UK/Crown dependencies...). Prefer the best-known country for
// display purposes when we only have the dial code to go on.
const PREFERRED_ISO_FOR_CALLING_CODE: Partial<Record<string, CountryCode>> = {
  "1": "US",
  "7": "RU",
  "44": "GB",
  "61": "AU",
}

export function isoForCallingCode(callingCode: string): CountryCode | undefined {
  return (
    PREFERRED_ISO_FOR_CALLING_CODE[callingCode] ??
    COUNTRY_CALLING_OPTIONS.find((c) => c.callingCode === callingCode)?.iso
  )
}

export function formatPhoneValue(iso: CountryCode, local: string): string {
  if (!local.trim()) return ""
  return `+${getCountryCallingCode(iso)} ${local.trim()}`
}

export function parsePhoneValue(
  value: string,
  fallbackIso: CountryCode = DEFAULT_COUNTRY
): { iso: CountryCode; local: string } {
  const trimmed = (value ?? "").trim()
  if (!trimmed) return { iso: fallbackIso, local: "" }

  // Our own canonical format: "+<callingCode> <local>"
  const spaced = trimmed.match(/^\+(\d{1,3})\s+(.*)$/)
  if (spaced) {
    const [, code, rest] = spaced
    return { iso: isoForCallingCode(code) ?? fallbackIso, local: rest.trim() }
  }

  // Legacy/pasted values with no separator, e.g. "+2348012345678"
  const compact = trimmed.match(/^\+(\d+)$/)
  if (compact) {
    const digits = compact[1]
    const longestFirst = [...COUNTRY_CALLING_OPTIONS].sort(
      (a, b) => b.callingCode.length - a.callingCode.length
    )
    const match = longestFirst.find((c) => digits.startsWith(c.callingCode))
    if (match) {
      return { iso: match.iso, local: digits.slice(match.callingCode.length) }
    }
  }

  // Bare local number typed with a trunk "0", e.g. "08012345678"
  return { iso: fallbackIso, local: trimmed.replace(/^0/, "") }
}

// The backend only knows the old plain-text phone format it has always
// received: a bare Nigerian local number with the trunk "0" (e.g.
// "08012345678"), no country code, no separators. Until the backend adds
// real support for the country/dial-code picker, convert back to that
// exact shape before submitting so existing API validation keeps passing.
// Non-Nigerian numbers have no prior format to match, so they're sent as a
// plain "+<callingCode><local>" string (no space) as the safest fallback.
export function toLegacyPhoneFormat(value: string): string {
  const { iso, local } = parsePhoneValue(value)
  if (!local) return ""
  if (iso === "NG") return `0${local}`
  return `+${getCountryCallingCode(iso)}${local}`
}

export function validatePhoneValue(value: string): string | undefined {
  const trimmed = (value ?? "").trim()
  if (!trimmed) return "Phone number is required"

  const { iso, local } = parsePhoneValue(trimmed)
  const digitsOnly = local.replace(/\D/g, "")
  if (!digitsOnly) return "Phone number is required"

  const result = validatePhoneNumberLength(digitsOnly, iso)
  switch (result) {
    case undefined:
      return undefined
    case "TOO_SHORT":
      return "Phone number is too short for the selected country"
    case "TOO_LONG":
      return "Phone number is too long for the selected country"
    default:
      return "Enter a valid phone number"
  }
}
