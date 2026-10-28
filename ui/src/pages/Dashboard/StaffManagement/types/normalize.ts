
export function splitFullName(fullName: string): {
  firstName: string
  lastName: string
} {
  const trimmed = fullName.trim()
  const spaceIndex = trimmed.indexOf(" ")
  if (spaceIndex === -1) return { firstName: trimmed, lastName: "" }
  return {
    firstName: trimmed.slice(0, spaceIndex),
    lastName: trimmed.slice(spaceIndex + 1),
  }
}

export function isActiveStatusLabel(
  label: string | number | null | undefined
): boolean {
  return String(label ?? "").trim().toLowerCase() === "active"
}

const GENDER_LABELS: Record<number, string> = {
  1: "Male",
  2: "Female",
  3: "Other",
}

export function normalizeGenderLabel(
  value: number | string | null | undefined
): string {
  if (value === null || value === undefined || value === "") return "—"

  if (typeof value === "number") return GENDER_LABELS[value] ?? "—"

  const trimmed = value.trim()
  const known = ["Male", "Female", "Other"].find(
    (g) => g.toLowerCase() === trimmed.toLowerCase()
  )
  if (known) return known

  const numeric = Number(trimmed)
  return Number.isNaN(numeric) ? trimmed : (GENDER_LABELS[numeric] ?? trimmed)
}
