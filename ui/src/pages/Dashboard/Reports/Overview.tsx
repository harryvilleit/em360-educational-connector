import { useMemo } from "react"
import { AlertCircle } from "lucide-react"
import { PageHeader } from "@/components/general/PageHeader"
import { useSchoolId } from "@/contexts/SchoolContext"
import { ClassScoreChart } from "./components/overview/ClassScoreChart"
import { CompletenessCard } from "./components/overview/CompletenessCard"
import { DemoSourcesBanner } from "./components/shared/DemoSourcesBanner"
import { EnrolmentByClassChart } from "./components/overview/EnrolmentByClassChart"
import { FeeTrendChart } from "./components/overview/FeeTrendChart"
import { NeedsAttention } from "./components/overview/NeedsAttention"
import { OverviewKpis } from "./components/overview/OverviewKpis"
import { ReportFilters } from "./components/shared/ReportFilters"
import { SchoolProfileCard } from "./components/overview/SchoolProfileCard"
import { StaffQualificationChart } from "./components/overview/StaffQualificationChart"
import { DOMAIN_ORDER, metricsForDomain, sourcesFor } from "./metrics"
import { useReportData } from "./useReportData"
import { useReportFilters } from "./useReportFilters"
import { useSchoolProfile } from "./useSchoolProfile"

export default function ReportsOverviewPage() {
  const schoolId = useSchoolId()
  const filters = useReportFilters()
  const sources = useMemo(
    () => sourcesFor(DOMAIN_ORDER.flatMap((d) => metricsForDomain(d))),
    []
  )
  const data = useReportData(schoolId, filters.period, sources)
  const profile = useSchoolProfile(schoolId, data)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Analytics"
        description="School-wide figures across academics, finance, attendance, welfare and operations."
        actions={
          <div className="flex flex-wrap gap-2">
            <ReportFilters data={data} filters={filters} />
          </div>
        }
      />

      <DemoSourcesBanner data={data} />

      <SchoolProfileCard profile={profile} />
      <OverviewKpis data={data} />

      <div className="grid gap-6 xl:grid-cols-3">
        <EnrolmentByClassChart data={data} />
        <StaffQualificationChart data={data} />
      </div>

     

      <div className="grid gap-6 xl:grid-cols-3">
        <FeeTrendChart data={data} />
        <CompletenessCard data={data} />
      </div>

      <NeedsAttention data={data} />

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <AlertCircle className="size-3.5" />
        Figures follow the session and term selected above where the source
        supports it.
      </p>
    </div>
  )
}
