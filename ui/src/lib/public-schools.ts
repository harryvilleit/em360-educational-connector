import type { PublicSchoolCard } from "@/types/public-schools"

export function formatRatingCount(count: number) {
  return new Intl.NumberFormat("en", { notation: "compact" }).format(count)
}

export function formatSchoolType(level: string) {
  return level || "School"
}

export function formatSchoolLocation(
  school: Pick<PublicSchoolCard, "city" | "state" | "localGovernment">
) {
  return (
    [school.city, school.state].filter(Boolean).join(", ") ||
    school.localGovernment ||
    "Location unavailable"
  )
}

export function countryName(countryCode: string) {
  try {
    return (
      new Intl.DisplayNames(
        [typeof navigator === "undefined" ? "en" : navigator.language || "en"],
        { type: "region" }
      ).of(countryCode.toUpperCase()) ?? countryCode
    )
  } catch {
    return countryCode
  }
}
