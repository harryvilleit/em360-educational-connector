import { ChartCard, ChartEmpty } from "@/components/charts/ChartCard"
import { Donut } from "@/components/charts/Donut"
import type { ReportData } from "../../useReportData"
import { useReportPath } from "../../useReportPath"

export function StaffQualificationChart({ data }: { data: ReportData }) {
  const to = useReportPath()
  const staff = data.staff.data

  return (
    <ChartCard title="Staff by Qualification" to={to("staff")}>
      {staff && staff.byQualification.length > 0 ? (
        <Donut data={staff.byQualification} nameKey="label" valueKey="count" />
      ) : (
        <ChartEmpty text="No staff records yet" />
      )}
    </ChartCard>
  )
}
