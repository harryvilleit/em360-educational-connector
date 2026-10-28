import type { ReportData } from "./useReportData"
import type { ReportFilters } from "./useReportFilters"

export function useActivePeriod(data: ReportData, filters: ReportFilters) {
  const sessions = data.school.data?.availableSessions ?? []
  const sessionId =
    filters.sessionId || data.school.data?.selectedSessionId || ""
  const terms = sessions.find((s) => s.id === sessionId)?.terms ?? []
  const termId = filters.termId || data.school.data?.selectedTermId || ""
  return { sessions, terms, sessionId, termId }
}
