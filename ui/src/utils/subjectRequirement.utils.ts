export const SUBJECT_REQUIREMENT = {
  Mandatory: 1,
  Optional: 2,
} as const

export type SubjectRequirementValue =
  (typeof SUBJECT_REQUIREMENT)[keyof typeof SUBJECT_REQUIREMENT]

const SUBJECT_REQUIREMENT_NAME_TO_NUMBER: Record<string, number> = {
  mandatory: SUBJECT_REQUIREMENT.Mandatory,
  optional: SUBJECT_REQUIREMENT.Optional,
}

// See classType.utils.ts — same defensive string-or-number handling for an
// enum-typed response field on this backend.
export function normalizeSubjectRequirement(
  value: number | string | null | undefined
): number | undefined {
  if (value === null || value === undefined) return undefined
  if (typeof value === "number") return value
  return SUBJECT_REQUIREMENT_NAME_TO_NUMBER[value.trim().toLowerCase()]
}

export function subjectRequirementLabel(
  value: number | string | null | undefined
): string {
  const normalized = normalizeSubjectRequirement(value)
  if (normalized === SUBJECT_REQUIREMENT.Mandatory) return "Mandatory"
  if (normalized === SUBJECT_REQUIREMENT.Optional) return "Optional"
  return "—"
}
