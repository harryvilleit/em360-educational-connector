import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate } from "@/utils"
import { REPORT_TABS } from "../../reportTabs"
import type { ReportData } from "../../useReportData"
import { ReportSection, Tiles } from "../shared/ReportParts"

export function WelfareReport({
  data,
  tab,
  onTabChange,
}: {
  data: ReportData
  tab: string
  onTabChange: (tab: string) => void
}) {
  const safeguarding = data.safeguarding.data?.priorityCases ?? []
  const support = data.learnerSupport.data?.priorityCases ?? []

  return (
    <div className="space-y-6">
      <Tiles domain="welfare" data={data} />

      <Tabs value={tab} onValueChange={onTabChange} className="gap-4">
        <TabsList>
          {REPORT_TABS.welfare?.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="safeguarding">
          <ReportSection
            title="Priority Safeguarding Cases"
            columns={[
              { key: "n", header: "Case", render: (r) => r.caseNumber },
              { key: "s", header: "Student", render: (r) => r.studentName },
              { key: "c", header: "Class", render: (r) => r.className ?? "—" },
              { key: "r", header: "Risk", render: (r) => r.riskLevel },
              { key: "st", header: "Status", render: (r) => r.status },
              {
                key: "d",
                header: "Next action due",
                render: (r) =>
                  r.nextActionDueAtUtc
                    ? formatDate(r.nextActionDueAtUtc, "short")
                    : "—",
              },
            ]}
            rows={safeguarding}
            rowKey={(r) => r.id}
            loading={data.safeguarding.state === "loading"}
            empty="No priority safeguarding cases."
          />
        </TabsContent>

        <TabsContent value="support">
          <ReportSection
            title="Priority Learner Support Cases"
            columns={[
              { key: "n", header: "Case", render: (r) => r.caseNumber },
              { key: "s", header: "Student", render: (r) => r.studentName },
              { key: "c", header: "Class", render: (r) => r.className ?? "—" },
              { key: "st", header: "Status", render: (r) => r.status },
              {
                key: "o",
                header: "Case owner",
                render: (r) => r.caseOwnerName ?? "—",
              },
              {
                key: "d",
                header: "Next review",
                render: (r) =>
                  r.nextReviewDate
                    ? formatDate(r.nextReviewDate, "short")
                    : "—",
              },
            ]}
            rows={support}
            rowKey={(r) => r.id}
            loading={data.learnerSupport.state === "loading"}
            empty="No priority learner support cases."
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
