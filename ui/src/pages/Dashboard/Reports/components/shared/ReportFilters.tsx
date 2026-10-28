import { FilterSelect } from "@/components/ui/filter-select"
import { useActivePeriod } from "../../useActivePeriod"
import type { ReportFilters as Filters } from "../../useReportFilters"
import type { ReportData } from "../../useReportData"

export function ReportFilters({
  data,
  filters,
}: {
  data: ReportData
  filters: Filters
}) {
  const { sessions, terms, sessionId, termId } = useActivePeriod(data, filters)

  return (
    <>
      <FilterSelect
        value={sessionId}
        onChange={(v) => filters.update({ session: v, term: "" })}
        options={sessions.map((s) => ({ value: s.id, label: s.sessionName }))}
        placeholder="Session"
        disabled={sessions.length === 0}
      />
      <FilterSelect
        value={termId}
        onChange={(v) => filters.update({ term: v })}
        options={terms.map((t) => ({ value: t.id, label: t.termName }))}
        placeholder="Term"
        disabled={terms.length === 0}
      />
    </>
  )
}
