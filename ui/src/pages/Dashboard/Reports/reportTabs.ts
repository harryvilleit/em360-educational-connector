import type { ReportDomain } from "./metrics"

export interface ReportTab {
  value: string
  label: string
}

// Pages that split their tables into tabs; exports follow the active tab
export const REPORT_TABS: Partial<Record<ReportDomain, ReportTab[]>> = {
  operations: [
    { value: "levels", label: "Enrolment by Level" },
    { value: "hostel", label: "Hostel Occupancy" },
    { value: "services", label: "Library and Cafeteria" },
  ],
  welfare: [
    { value: "safeguarding", label: "Priority Safeguarding Cases" },
    { value: "support", label: "Priority Learner Support Cases" },
  ],
  academic: [
    { value: "summary", label: "Academic Summary" },
    { value: "grades", label: "Grade Distribution" },
    { value: "performance", label: "Performance" },
    { value: "cas", label: "CAS Sheet" },
  ],
  enrolment: [
    { value: "register", label: "Enrolment Register" },
    { value: "age", label: "Age Profile" },
    { value: "completeness", label: "Record Completeness" },
  ],
  staff: [
    { value: "roster", label: "Staff Nominal Roll" },
    { value: "completeness", label: "Record Completeness" },
  ],
}

export function resolveTab(view: ReportDomain, requested: string): ReportTab | undefined {
  const tabs = REPORT_TABS[view]
  return tabs?.find((t) => t.value === requested) ?? tabs?.[0]
}
