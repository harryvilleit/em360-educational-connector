import { CalendarCheck2, Users, Wallet } from "lucide-react"
import { StatCard } from "@/components/general/StatCard"
import { useReportMoney } from "../../useReportMoney"
import type { ReportData } from "../../useReportData"

export function OverviewKpis({ data }: { data: ReportData }) {
  const { formatCompactMoney } = useReportMoney()
  const enrol = data.enrolment.data
  const staff = data.staff.data
  const kpis = data.school.data?.kpis
  const fee = data.fee.data

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        label="Pupils on Roll"
        value={
          enrol
            ? enrol.total.toLocaleString()
            : data.enrolment.state === "error"
              ? "—"
              : "0"
        }
        meta={enrol ? `${enrol.boys} boys · ${enrol.girls} girls` : undefined}
        icon={Users}
        color="blue"
      />
      <StatCard
        label="Staff"
        value={
          staff
            ? staff.total.toLocaleString()
            : data.staff.state === "error"
              ? "—"
              : "0"
        }
        meta={
          staff
            ? `${staff.teaching} teaching · ${staff.nonTeaching} other`
            : undefined
        }
        icon={Users}
        color="blue"
      />
      <StatCard
        label="Avg. Attendance"
        value={
          kpis
            ? `${kpis.averageAttendancePercentage}%`
            : data.school.state === "error"
              ? "—"
              : "0%"
        }
        icon={CalendarCheck2}
        color="blue"
      />
      <StatCard
        label="Fees Collected"
        value={
          fee
            ? `${fee.collectionRatePercent}%`
            : data.fee.state === "error"
              ? "—"
              : "0%"
        }
        meta={
          fee ? `${formatCompactMoney(fee.outstanding)} outstanding` : undefined
        }
        icon={Wallet}
        color="blue"
      />
    </div>
  )
}
