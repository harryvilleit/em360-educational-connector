export const CLASS_TYPE = {
  Primary: 1,
  Secondary: 2,
} as const

export type ClassTypeValue = (typeof CLASS_TYPE)[keyof typeof CLASS_TYPE]

const CLASS_TYPE_NAME_TO_NUMBER: Record<string, number> = {
  primary: CLASS_TYPE.Primary,
  secondary: CLASS_TYPE.Secondary,
}

// Response fields for enum-typed values on this backend are sometimes
// serialized as the string name ("Primary") instead of the numeric ordinal
// Swagger examples show — see write-up in feedback_backend_enum_serialization
// memory (confirmed for transaction/timetable/gender fields already). Accept
// either shape on reads; writes stay numeric.
export function normalizeClassType(
  value: number | string | null | undefined
): number | undefined {
  if (value === null || value === undefined) return undefined
  if (typeof value === "number") return value
  return CLASS_TYPE_NAME_TO_NUMBER[value.trim().toLowerCase()]
}

export function classTypeLabel(value: number | string | null | undefined): string {
  const normalized = normalizeClassType(value)
  if (normalized === CLASS_TYPE.Primary) return "Primary"
  if (normalized === CLASS_TYPE.Secondary) return "Secondary"
  return "—"
}
