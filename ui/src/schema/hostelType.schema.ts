export type HostelGender = "male" | "female"

function isBoysHostelType(hostelType: number | string | null | undefined): boolean {
  if (typeof hostelType === "number") return hostelType === 1
  return !!hostelType?.toLowerCase().startsWith("boy")
}

export function hostelTypeLabel(hostelType: number | string | null | undefined): string {
  if (typeof hostelType === "string" && hostelType) return hostelType
  if (!hostelType) return "Unspecified"
  return isBoysHostelType(hostelType) ? "Boys Hostel" : "Girls Hostel"
}

export function hostelTypeToGender(hostelType: number | string | null | undefined): HostelGender {
  return isBoysHostelType(hostelType) ? "male" : "female"
}
