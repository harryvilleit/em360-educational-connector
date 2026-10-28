import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { percentOf } from "../../reportFormat"
import { REPORT_TABS } from "../../reportTabs"
import type { ReportData } from "../../useReportData"
import { CompletenessSection } from "../shared/CompletenessSection"
import { ReportSection, Tiles } from "../shared/ReportParts"

export function EnrolmentReport({
  data,
  tab,
  onTabChange,
}: {
  data: ReportData
  tab: string
  onTabChange: (tab: string) => void
}) {
  const e = data.enrolment.data
  const rows = e?.byClass ?? []
  const ages = e?.ageBands ?? []
  const ageTotal = ages.reduce((n, a) => n + a.count, 0)

  return (
    <div className="space-y-6">
      <Tiles domain="enrolment" data={data} />

      <Tabs value={tab} onValueChange={onTabChange} className="gap-4">
        <TabsList>
          {REPORT_TABS.enrolment?.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="register">
          <ReportSection
            title="Enrolment Register"
            subtitle="Class, boys, girls and total"
            columns={[
              { key: "c", header: "Class", render: (r) => r.className },
              { key: "b", header: "Boys", render: (r) => r.boys },
              { key: "g", header: "Girls", render: (r) => r.girls },
              { key: "t", header: "Total", render: (r) => r.total },
              {
                key: "p",
                header: "Share of school",
                render: (r) => percentOf(r.total, e?.total ?? 0),
              },
            ]}
            rows={rows}
            rowKey={(r) => r.className}
            loading={data.enrolment.state === "loading"}
            empty="No pupils on roll yet."
            searchBy={(r) => r.className}
            searchPlaceholder="Search class"
            filters={[
              {
                placeholder: "Gender balance",
                options: [
                  { value: "girls", label: "More girls than boys" },
                  { value: "boys", label: "More boys than girls" },
                  { value: "equal", label: "Equal" },
                ],
                matches: (r, v) =>
                  v === "girls"
                    ? r.girls > r.boys
                    : v === "boys"
                      ? r.boys > r.girls
                      : r.boys === r.girls,
              },
            ]}
            footer={
              e && `Grand total: ${e.boys} boys + ${e.girls} girls = ${e.total}`
            }
          />
        </TabsContent>

        <TabsContent value="age">
          <ReportSection
            title="Age Profile"
            subtitle="Pupils by age band, from recorded dates of birth"
            columns={[
              { key: "b", header: "Age band", render: (r) => r.band },
              { key: "c", header: "Pupils", render: (r) => r.count },
              {
                key: "p",
                header: "Share",
                render: (r) => percentOf(r.count, ageTotal),
              },
            ]}
            rows={ages.filter((a) => a.count > 0)}
            rowKey={(r) => r.band}
            empty="No dates of birth recorded."
            searchBy={(r) => r.band}
            searchPlaceholder="Search age band"
            filters={[
              {
                placeholder: "Share of pupils",
                options: [
                  { value: "high", label: "10% and above" },
                  { value: "low", label: "Below 10%" },
                ],
                matches: (r, v) =>
                  (ageTotal ? r.count / ageTotal >= 0.1 : false) ===
                  (v === "high"),
              },
            ]}
          />
        </TabsContent>

        <TabsContent value="completeness">
          {e && (
            <CompletenessSection
              title="Record Completeness"
              items={e.completeness}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
