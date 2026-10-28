import type { ReportSource } from "./useReportData"

export const SOURCE_LABEL: Record<ReportSource, string> = {
  school: "School overview",
  exam: "Exams",
  fee: "Fees",
  attendance: "Attendance",
  safeguarding: "Safeguarding",
  learnerSupport: "Learner support",
  health: "Health",
  hostel: "Hostel",
  library: "Library",
  cafeteria: "Cafeteria",
  enrolment: "Enrolment",
  staff: "Staff",
}

/**
 * Library and Cafeteria have no school records in the EM360 API yet, so the
 * reports never show figures for them (the in-app stores are demo data).
 */
export const NOT_CONNECTED: readonly ReportSource[] = ["library", "cafeteria"]

/**
 * Sources whose figures the API restricts beyond Reports access. Shown when the
 * source is refused, so leaders know which grant is missing.
 */
export const RESTRICTED_NOTE: Partial<Record<ReportSource, string>> = {
  safeguarding:
    "Safeguarding figures are only shown to the school's safeguarding lead (DSL) or deputy.",
  health: "Health figures need the Health Records Overview menu in your role.",
  learnerSupport:
    "Learner support figures are only shown to authorised learner-support staff (for example the SENCO).",
}

/** One line for a metric tile whose source returned nothing usable. */
export function unavailableNote(source: ReportSource): string {
  if (NOT_CONNECTED.includes(source))
    return "Not connected to EM360 records yet."
  return (
    RESTRICTED_NOTE[source] ??
    "Unavailable. You may not have access to this data, or it could not be loaded."
  )
}
