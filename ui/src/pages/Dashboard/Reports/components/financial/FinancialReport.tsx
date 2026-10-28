import { useReportMoney } from "../../useReportMoney"
import { formatDate } from "@/utils"
import { percentOf } from "../../reportFormat"
import type { ReportData } from "../../useReportData"
import { ReportSection, Tiles } from "../shared/ReportParts"

const num = (n: number) => n.toLocaleString()

export function FinancialReport({ data }: { data: ReportData }) {
  const { formatMoney } = useReportMoney()
  const fee = data.fee.data
  const loading = data.fee.state === "loading"
  const trend = fee?.collectionTrend ?? []
  const levels = fee?.byLevel ?? []
  const outstanding = fee?.outstandingFees ?? []
  const recent = fee?.recentPayments ?? []

  const summary = fee
    ? [
        { label: "Total expected", value: formatMoney(fee.totalExpected) },
        { label: "Total collected", value: formatMoney(fee.totalCollected) },
        { label: "Outstanding", value: formatMoney(fee.outstanding) },
        { label: "Collection rate", value: `${fee.collectionRatePercent}%` },
        { label: "Unpaid rate", value: `${fee.unpaidRatePercent}%` },
        {
          label: "Collected this term",
          value: formatMoney(fee.thisTermCollected),
        },
        {
          label: "Payments today",
          value: `${formatMoney(fee.paymentsTodayAmount)} (${fee.paymentsTodayCount})`,
        },
        { label: "Students with overdue fees", value: num(fee.defaulterCount) },
      ]
    : []

  return (
    <div className="space-y-6">
      <Tiles domain="financial" data={data} />

      <ReportSection
        title="Fee Summary"
        columns={[
          { key: "l", header: "Measure", render: (r) => r.label },
          { key: "v", header: "Value", render: (r) => r.value },
        ]}
        rows={summary}
        rowKey={(r) => r.label}
        loading={loading}
        empty="No fee records for this period yet."
      />

      <ReportSection
        title="Monthly Collection"
        subtitle="Collected and outstanding by month"
        columns={[
          { key: "m", header: "Month", render: (r) => r.month },
          {
            key: "c",
            header: "Collected",
            render: (r) => formatMoney(r.collected),
          },
          {
            key: "o",
            header: "Outstanding",
            render: (r) => formatMoney(r.outstanding),
          },
          {
            key: "p",
            header: "Share collected",
            render: (r) => percentOf(r.collected, r.collected + r.outstanding),
          },
        ]}
        rows={trend}
        rowKey={(r) => r.month}
        loading={loading}
        empty="No payments recorded for this period yet."
      />

      <ReportSection
        title="Collection by Level"
        columns={[
          { key: "l", header: "Level", render: (r) => r.level },
          {
            key: "e",
            header: "Expected",
            render: (r) => formatMoney(r.totalExpected),
          },
          {
            key: "c",
            header: "Collected",
            render: (r) => formatMoney(r.totalCollected),
          },
        ]}
        rows={levels}
        rowKey={(r) => r.level}
        loading={loading}
        empty="No fee data for this period yet."
      />

      <ReportSection
        title="Recent Payments"
        columns={[
          { key: "s", header: "Student", render: (r) => r.studentName },
          { key: "c", header: "Class / term", render: (r) => r.classTerm },
          { key: "a", header: "Amount", render: (r) => formatMoney(r.amount) },
          { key: "m", header: "Method", render: (r) => r.paymentMethod },
          {
            key: "d",
            header: "Date",
            render: (r) => formatDate(r.paymentDate, "short"),
          },
        ]}
        rows={recent}
        rowKey={(r) => `${r.studentId}-${r.paymentDate}-${r.amount}`}
        loading={loading}
        empty="No recent payments."
      />

      <ReportSection
        title="Outstanding Balances"
        columns={[
          { key: "s", header: "Student", render: (r) => r.studentName },
          { key: "c", header: "Class", render: (r) => r.className },
          {
            key: "b",
            header: "Outstanding",
            render: (r) => formatMoney(r.outstandingBalance),
          },
          { key: "d", header: "Days overdue", render: (r) => r.daysOverdue },
        ]}
        rows={outstanding}
        rowKey={(r) => r.studentId}
        loading={loading}
        empty="No outstanding balances."
      />
    </div>
  )
}
