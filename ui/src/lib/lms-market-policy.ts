export type LmsTutorCurrency = "NGN" | "GBP" | "EUR" | "USD"

export const LMS_LIVE_CLASS_MAX_DURATION_MINUTES = 4 * 60
export const LMS_CONFERENCE_MAX_DAILY_MINUTES = 10 * 60

const EUROPE_COUNTRY_CODES = new Set([
  "AD",
  "AL",
  "AT",
  "AX",
  "BA",
  "BE",
  "BG",
  "BY",
  "CH",
  "CY",
  "CZ",
  "DE",
  "DK",
  "EE",
  "ES",
  "FI",
  "FO",
  "FR",
  "GG",
  "GI",
  "GR",
  "HR",
  "HU",
  "IE",
  "IM",
  "IS",
  "IT",
  "JE",
  "LI",
  "LT",
  "LU",
  "LV",
  "MC",
  "MD",
  "ME",
  "MK",
  "MT",
  "NL",
  "NO",
  "PL",
  "PT",
  "RO",
  "RS",
  "RU",
  "SE",
  "SI",
  "SJ",
  "SK",
  "SM",
  "UA",
  "VA",
  "XK",
])

const AFRICA_COUNTRY_CODES = new Set([
  "AO",
  "BF",
  "BI",
  "BJ",
  "BW",
  "CD",
  "CF",
  "CG",
  "CI",
  "CM",
  "CV",
  "DJ",
  "DZ",
  "EG",
  "EH",
  "ER",
  "ET",
  "GA",
  "GH",
  "GM",
  "GN",
  "GQ",
  "GW",
  "KE",
  "KM",
  "LR",
  "LS",
  "LY",
  "MA",
  "MG",
  "ML",
  "MR",
  "MU",
  "MW",
  "MZ",
  "NA",
  "NE",
  "NG",
  "RE",
  "RW",
  "SC",
  "SD",
  "SH",
  "SL",
  "SN",
  "SO",
  "SS",
  "ST",
  "SZ",
  "TD",
  "TG",
  "TN",
  "TZ",
  "UG",
  "YT",
  "ZA",
  "ZM",
  "ZW",
])

function normaliseCountryCode(countryCode?: string | null) {
  const value = countryCode?.trim().toUpperCase()
  return value === "UK" ? "GB" : (value ?? "")
}

export function currencyForTutorCountry(
  countryCode?: string | null
): LmsTutorCurrency {
  const code = normaliseCountryCode(countryCode)
  if (code === "NG") return "NGN"
  if (code === "GB") return "GBP"
  if (EUROPE_COUNTRY_CODES.has(code)) return "EUR"
  return "USD"
}

export function liveClassPriceRule(
  tutorCurrency?: string | null,
  tutorCountryCode?: string | null
) {
  const value = tutorCurrency?.trim().toUpperCase()
  const currency: LmsTutorCurrency =
    value === "NGN" || value === "GBP" || value === "EUR" || value === "USD"
      ? value
      : currencyForTutorCountry(tutorCountryCode)

  const countryCode = normaliseCountryCode(tutorCountryCode)
  const minimumPrice =
    currency === "NGN"
      ? 300
      : currency === "GBP" || currency === "EUR"
        ? 1
        : AFRICA_COUNTRY_CODES.has(countryCode)
          ? 0.5
          : 1

  return { currency, minimumPrice }
}

export function conferencePriceRule(tutorCountryCode?: string | null) {
  const countryCode = normaliseCountryCode(tutorCountryCode)
  const currency = currencyForTutorCountry(countryCode)
  const minimumPrice =
    currency === "NGN"
      ? 5000
      : currency === "GBP" || currency === "EUR"
        ? 5
        : AFRICA_COUNTRY_CODES.has(countryCode)
          ? 2
          : 5
  return { currency, minimumPrice }
}
