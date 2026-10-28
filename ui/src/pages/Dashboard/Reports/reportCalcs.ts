import type { ReportData } from "./useReportData"

// Pupils per teacher. Undefined when either side is missing, or when one side is
// live data and the other is sample data (the ratio would be meaningless).
export function pupilTeacherRatio(data: ReportData): number | undefined {
  const teachers = data.staff.data?.teaching
  const pupils = data.enrolment.data?.total
  if (!teachers || pupils === undefined) return undefined
  if (data.staff.isDemo !== data.enrolment.isDemo) return undefined
  return Math.round((pupils / teachers) * 10) / 10
}
