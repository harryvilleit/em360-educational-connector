import { useMemo } from "react"
import { PageHeader } from "@/components/general/PageHeader"
import { useSchoolId } from "@/contexts/SchoolContext"
import { downloadReport, type ReportFormat } from "@/lib/reportDownload"
import { downloadReportPdf } from "@/lib/reportPdf"
import { useActivePeriod } from "./useActivePeriod"
import { useMetricFormatter } from "./useMetricFormatter"
import { AttendanceReport } from "./components/attendance/AttendanceReport"
import { FinancialReport } from "./components/financial/FinancialReport"
import { OperationsReport } from "./components/operations/OperationsReport"
import { DemoSourcesBanner } from "./components/shared/DemoSourcesBanner"
import { ExportSelect } from "./components/shared/ExportSelect"
import MyDashboard from "./components/my-dashboard/MyDashboard"
import { AcademicReport } from "./components/academic/AcademicReport"
import { EnrolmentReport } from "./components/enrolment/EnrolmentReport"
import { StaffReport } from "./components/staff/StaffReport"
import { WelfareReport } from "./components/welfare/WelfareReport"
import { ReportFilters } from "./components/shared/ReportFilters"
import {
  DOMAIN_META,
  pageMetrics,
  sourcesFor,
  type ReportDomain,
} from "./metrics"
import { buildExports } from "./reportExports"
import { resolveTab } from "./reportTabs"
import { useCasSheet } from "./useCasSheet"
import { useReportData,type ReportSource } from "./useReportData"
import { useReportFilters } from "./useReportFilters"

export type ReportsView = ReportDomain | "mine"

const SCHOOL_ONLY: ReadonlySet<ReportSource> = new Set(["school"])

const VIEW_TITLE: Record<ReportsView, string> = {
  mine: "My Dashboard",
  enrolment: "Enrolment Report",
  staff: "Staff Report",
  academic: "Academic Report",
  financial: "Financial Report",
  attendance: "Attendance Report",
  welfare: "Welfare Report",
  operations: "Operations Report",
}

export default function ReportsPage({ view }: { view: ReportsView }) {
  const schoolId = useSchoolId()
  const filters = useReportFilters()
  const formatMetric = useMetricFormatter()

  const needed = useMemo(() => {
    if (view === "mine") return SCHOOL_ONLY
    const sources = sourcesFor(pageMetrics(view))
    sources.add("school")
    return sources
  }, [view])
  const data = useReportData(
    schoolId,
    filters.period,
    needed,
    filters.attendanceDate
  )
  const { sessions, terms, sessionId, termId } = useActivePeriod(data, filters)

  const activeTab = view === "mine" ? undefined : resolveTab(view, filters.tab)
  const cas = useCasSheet(
    view === "academic" && activeTab?.value === "cas",
    schoolId,
    filters.classId,
    sessionId,
    termId
  )

  const tables = useMemo(
    () =>
      view === "mine"
        ? []
        : buildExports(view, data, filters.attendanceDate, cas),
    [view, data, filters.attendanceDate, cas]
  )
  const changeTab = (tab: string) => filters.update({ tab })

  function exportAs(format: ReportFormat) {
    if (view === "mine") return
    const summary = pageMetrics(view).map((m): [string, string] => {
      const value = m.select(data)
      return [m.label, formatMetric(value ?? 0, m.format)]
    })
    const title = `${DOMAIN_META[view].label} report${activeTab ? ` - ${activeTab.label}` : ""}`
    const subtitle = [
      data.school.data?.schoolName,
      sessions.find((s) => s.id === sessionId)?.sessionName,
      terms.find((t) => t.id === termId)?.termName,
    ]
      .filter(Boolean)
      .join(" · ")
    const filled = tables.filter(
      (t) => t.rows.length > 0 && (!activeTab || t.tab === activeTab.value)
    )

    if (format === "pdf") {
      downloadReportPdf(
        `${view}${activeTab ? `-${activeTab.value}` : ""}-report.pdf`,
        title,
        subtitle,
        [
          { heading: "Summary", rows: summary },
          ...filled.map((t) => ({
            heading: t.label,
            header: t.header,
            rows: t.rows.map((r) => r.map((c) => String(c ?? ""))),
          })),
        ]
      )
    } else {
      downloadReport(
        format,
        `${view}${activeTab ? `-${activeTab.value}` : ""}-report`,
        {
          title,
          subtitle,
          summary,
          tables: filled,
        }
      )
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={VIEW_TITLE[view]}
        description="School-wide figures across academics, finance, attendance, welfare and operations."
        actions={
          <div className="flex flex-wrap gap-2">
            {view !== "mine" && (
              <ExportSelect
                reportName={`${VIEW_TITLE[view].toLowerCase()}${activeTab ? ` (${activeTab.label} tab)` : ""}`}
                onExport={exportAs}
              />
            )}
            <ReportFilters data={data} filters={filters} />
          </div>
        }
      />

      <DemoSourcesBanner data={data} />

      {view === "enrolment" && activeTab && (
        <EnrolmentReport
          data={data}
          tab={activeTab.value}
          onTabChange={changeTab}
        />
      )}
      {view === "staff" && activeTab && (
        <StaffReport
          data={data}
          tab={activeTab.value}
          onTabChange={changeTab}
        />
      )}
      {view === "academic" && activeTab && (
        <AcademicReport
          data={data}
          tab={activeTab.value}
          onTabChange={changeTab}
          cas={cas}
          classId={filters.classId}
          onClassChange={(classId) => filters.update({ class: classId })}
          periodReady={!!(sessionId && termId)}
        />
      )}
      {view === "financial" && <FinancialReport data={data} />}
      {view === "attendance" && (
        <AttendanceReport
          data={data}
          date={filters.attendanceDate}
          onDateChange={(v) => filters.update({ date: v })}
        />
      )}
      {view === "welfare" && activeTab && (
        <WelfareReport
          data={data}
          tab={activeTab.value}
          onTabChange={changeTab}
        />
      )}
      {view === "operations" && activeTab && (
        <OperationsReport data={data} tab={activeTab.value} onTabChange={changeTab} />
      )}
      {view === "mine" && (
        <MyDashboard schoolId={schoolId} period={filters.period} />
      )}
    </div>
  )
}
