import { percentOf } from "../../reportFormat"
import type { CompletenessItem } from "../../useReportData"
import { ReportSection } from "./ReportParts"

export function CompletenessSection({
  title,
  items,
}: {
  title: string
  items: CompletenessItem[]
}) {
  return (
    <ReportSection
      title={title}
      subtitle="How many records have the fields officials ask for"
      columns={[
        { key: "l", header: "Field", render: (r: CompletenessItem) => r.label },
        { key: "f", header: "Recorded", render: (r: CompletenessItem) => r.filled },
        { key: "t", header: "Total records", render: (r: CompletenessItem) => r.total },
        {
          key: "p",
          header: "Complete",
          render: (r: CompletenessItem) => percentOf(r.filled, r.total),
        },
      ]}
      rows={items}
      rowKey={(r) => r.label}
      empty="No records yet."
      searchBy={(r) => r.label}
      searchPlaceholder="Search fields"
      filters={[{
        placeholder: "Status",
        options: [
          { value: "complete", label: "Fully recorded" },
          { value: "incomplete", label: "Missing some" },
        ],
        matches: (r, v) => (r.filled >= r.total) === (v === "complete"),
      }]}
    />
  )
}
