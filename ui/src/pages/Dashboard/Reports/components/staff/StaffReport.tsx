import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMemo } from "react"
import type { DataTableColumn } from "@/components/ui/data-table"
import { formatDate } from "@/utils"
import { qualificationBucket } from "../../peopleSummaries"
import { REPORT_TABS } from "../../reportTabs"
import type { ReportData, StaffRosterRow } from "../../useReportData"
import { CompletenessSection } from "../shared/CompletenessSection"
import { ReportSection, Tiles } from "../shared/ReportParts"

const NOT_RECORDED = "Not recorded"

const QUALIFICATION_OPTIONS = [
  "Grade II",
  "NCE",
  "Degree & above",
  "Other",
  NOT_RECORDED,
].map((label) => ({ value: label, label }))

const date = (value: string) =>
  value ? formatDate(value, "short") : NOT_RECORDED

function staffColumns(
  serial: Map<string, number>
): DataTableColumn<StaffRosterRow>[] {
  return [
    { key: "n", header: "S/N", render: (r) => serial.get(r.id) ?? "" },
    { key: "name", header: "Name", render: (r) => r.name },
    { key: "sex", header: "Sex", render: (r) => r.sex || NOT_RECORDED },
    {
      key: "dob",
      header: "Date of birth",
      render: (r) => (r.dob ? formatDate(r.dob, "short") : NOT_RECORDED),
    },
    {
      key: "q",
      header: "Qualification",
      render: (r) => r.qualification || NOT_RECORDED,
    },
    { key: "role", header: "Role", render: (r) => r.role },
    { key: "cat", header: "Category", render: (r) => r.category },
    { key: "st", header: "Status", render: (r) => r.status },
    {
      key: "sb",
      header: "SB number",
      render: (r) => r.serviceNumber || NOT_RECORDED,
    },
    {
      key: "gl",
      header: "GL / Step",
      render: (r) => r.gradeLevel || NOT_RECORDED,
    },
    {
      key: "fa",
      header: "First appointment",
      render: (r) => date(r.firstAppointment),
    },
    {
      key: "pa",
      header: "Present appointment",
      render: (r) => date(r.presentAppointment),
    },
    { key: "dp", header: "Date posted", render: (r) => date(r.datePosted) },
    {
      key: "or",
      header: "State / LGA",
      render: (r) => r.origin || NOT_RECORDED,
    },
    { key: "tw", header: "Town", render: (r) => r.town || NOT_RECORDED },
  ]
}

export function StaffReport({
  data,
  tab,
  onTabChange,
}: {
  data: ReportData
  tab: string
  onTabChange: (tab: string) => void
}) {
  const s = data.staff.data
  const roster = useMemo(() => s?.roster ?? [], [s])
  const serial = useMemo(
    () => new Map(roster.map((r, i) => [r.id, i + 1])),
    [roster]
  )
  const columns = useMemo(() => staffColumns(serial), [serial])

  return (
    <div className="space-y-6">
      <Tiles domain="staff" data={data} />

      <Tabs value={tab} onValueChange={onTabChange} className="gap-4">
        <TabsList>
          {REPORT_TABS.staff?.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="roster">
          <ReportSection
            title="Staff Nominal Roll"
            subtitle="Every staff member on record"
            columns={columns}
            rows={roster}
            rowKey={(r) => r.id}
            loading={data.staff.state === "loading"}
            empty="No staff records yet."
            searchBy={(r) => `${r.name} ${r.role} ${r.department}`}
            searchPlaceholder="Search staff"
            countLabel="staff"
            filters={[
              {
                placeholder: "Qualification",
                options: QUALIFICATION_OPTIONS,
                matches: (r, v) => qualificationBucket(r.qualification) === v,
              },
              {
                placeholder: "Role",
                options: (s?.byRole ?? []).map((x) => ({
                  value: x.label,
                  label: x.label,
                })),
                matches: (r, v) => r.role === v,
              },
              {
                placeholder: "Gender",
                options: [
                  { value: "M", label: "Male" },
                  { value: "F", label: "Female" },
                  { value: "none", label: NOT_RECORDED },
                ],
                matches: (r, v) => (v === "none" ? !r.sex : r.sex === v),
              },
              {
                placeholder: "Status",
                options: (s?.byStatus ?? []).map((x) => ({
                  value: x.label,
                  label: x.label,
                })),
                matches: (r, v) => r.status === v,
              },
            ]}
          />
        </TabsContent>

        <TabsContent value="completeness">
          {s && (
            <CompletenessSection
              title="Record Completeness"
              items={s.completeness}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
