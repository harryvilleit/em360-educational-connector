import type { Gender, EnrollmentStatus } from "@/types/student"


export const GENDER_TO_API: Record<Gender, number> = {
  Male: 1,
  Female: 2,
  Other: 3,
}

export const API_TO_GENDER: Record<number, Gender> = {
  1: "Male",
  2: "Female",
  3 : "Other",
}


export const STATUS_TO_API: Record<EnrollmentStatus, number> = {
  Active: 13,
  Graduated: 25,
  Withdrawn: 26,
  Suspended: 11,
}

export const API_TO_STATUS: Record<number, EnrollmentStatus> = {
  13: "Active",
  25: "Graduated",
  26: "Withdrawn",
  11: "Suspended",
}

export function genderToApi(gender: Gender | ""): number {
  return GENDER_TO_API[gender as Gender] ?? GENDER_TO_API.Male
}

// The backend serializes this field as its string enum name ("Male",
// "Female", "Other") on responses, not the numeric value the numeric
// GENDER_TO_API/API_TO_GENDER maps (and the write-side payloads) use —
// so a plain numeric lookup silently misses and always fell back to Male.
export function genderFromApi(
  value: number | string | undefined | null
): Gender {
  if (typeof value === "string") {
    const known = (["Male", "Female", "Other"] as const).find(
      (g) => g.toLowerCase() === value.trim().toLowerCase()
    )
    if (known) return known

    const numeric = Number(value)
    return Number.isNaN(numeric) ? "Male" : (API_TO_GENDER[numeric] ?? "Male")
  }

  return API_TO_GENDER[value ?? 0] ?? "Male"
}

export function statusToApi(status: EnrollmentStatus | ""): number {
  return STATUS_TO_API[status as EnrollmentStatus] ?? STATUS_TO_API.Active
}

// The backend serializes this field as its string enum name ("Active",
// "Graduated", ...) on responses, not the numeric value the numeric
// STATUS_TO_API/API_TO_STATUS maps (and the write-side payloads) use — same
// gotcha as genderFromApi above, live-verified on Student/GetById.
export function statusFromApi(
  value: number | string | undefined | null
): EnrollmentStatus {
  if (typeof value === "string") {
    const known = (
      ["Active", "Graduated", "Withdrawn", "Suspended"] as const
    ).find((s) => s.toLowerCase() === value.trim().toLowerCase())
    if (known) return known

    const numeric = Number(value)
    return Number.isNaN(numeric) ? "Active" : (API_TO_STATUS[numeric] ?? "Active")
  }

  return API_TO_STATUS[value ?? 0] ?? "Active"
}
