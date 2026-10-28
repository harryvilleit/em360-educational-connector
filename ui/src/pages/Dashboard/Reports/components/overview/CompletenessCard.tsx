import { ChartCard } from "@/components/charts/ChartCard"
import { CompletenessList } from "@/components/charts/CompletenessList"
import type { ReportData } from "../../useReportData"

export function CompletenessCard({ data }: { data: ReportData }) {
  const items = [
    ...(data.enrolment.data?.completeness ?? []),
    ...(data.staff.data?.completeness ?? []),
  ]

  return (
    <ChartCard
      title="Records Completeness"
      subtitle="How much of what officials ask for is on file"
    >
      <CompletenessList items={items} />
    </ChartCard>
  )
}
