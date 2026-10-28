import type { SchoolStudentSupportSettingsI } from "@/api/studentSupportSettings.api"

export function labelFromCode(value?: string) {
  if (!value) return "—"
  return value.replace(/([a-z])([A-Z])/g, "$1 $2")
}

export function learnerSupportLabel(
  value: string,
  settings?: Pick<
    SchoolStudentSupportSettingsI,
    "formalAssessmentLabel" | "formalPlanLabel"
  >
) {
  if (value === "StatutoryAssessment")
    return settings?.formalAssessmentLabel ?? "Formal Support Assessment"
  if (value === "StatutoryPlanActive")
    return `${settings?.formalPlanLabel ?? "Individual Support Plan"} Active`
  if (value === "RequestStatutoryAssessment")
    return `Request ${settings?.formalAssessmentLabel ?? "Formal Support Assessment"}`
  if (value === "UpdateStatutoryPlan")
    return `Update ${settings?.formalPlanLabel ?? "Individual Support Plan"}`
  return labelFromCode(value)
}

export function formatDate(value?: string) {
  if (!value) return "—"
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value.slice(0, 10)}T00:00:00`))
}

export const inputClass =
  "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
export const textareaClass = `${inputClass} h-auto min-h-24 py-2`

export const today = () => new Date().toISOString().slice(0, 10)
