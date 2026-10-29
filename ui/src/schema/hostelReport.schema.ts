// Backend enum: 0 = PropertyDamage, 1 = Incident.
export const REPORT_TYPE = {
  PropertyDamage: 0,
  Incident: 1,
} as const

export const REPORT_TYPE_OPTIONS = [
  { value: REPORT_TYPE.PropertyDamage, label: "Property Damage" },
  { value: REPORT_TYPE.Incident, label: "Incident" },
] as const

// The read model serializes reportType/status as strings — this may come back
// as the numeric ordinal ("0") or the enum name ("PropertyDamage"), depending
// on backend JSON config. These helpers accept either form.
export function isPropertyDamageReport(reportType: string): boolean {
  return reportType === "0" || reportType.toLowerCase().includes("damage")
}

export function reportTypeLabel(reportType: string): string {
  return isPropertyDamageReport(reportType) ? "Property Damage" : "Incident"
}

// Backend enum: 0 = Reported, 1 = Billed, 2 = Waived.
export const REPORT_STATUS = {
  Reported: 0,
  Billed: 1,
  Waived: 2,
} as const

export function reportStatusLabel(status: string): string {
  if (status === "0") return "Reported"
  if (status === "1") return "Billed"
  if (status === "2") return "Waived"
  return status
}

export function isReportStatus(
  status: string,
  target: "Reported" | "Billed" | "Waived"
): boolean {
  const ordinal = String(REPORT_STATUS[target])
  return status === ordinal || status.toLowerCase() === target.toLowerCase()
}
