import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { serviceRows } from "../../operationsServices"
import { REPORT_TABS } from "../../reportTabs"
import type { ReportData } from "../../useReportData"
import { ReportSection, Tiles } from "../shared/ReportParts"

export function OperationsReport({
  data,
  tab,
  onTabChange,
}: {
  data: ReportData
  tab: string
  onTabChange: (tab: string) => void
}) {
  const levels = data.school.data?.enrollmentBreakdown.levels ?? []
  const hostels = data.hostel.data?.hostelBreakdowns ?? []
  const services = serviceRows(data.library.data, data.cafeteria.data)

  return (
    <div className="space-y-6">
      <Tiles domain="operations" data={data} />

      <Tabs value={tab} onValueChange={onTabChange} className="gap-4">
        <TabsList>
          {REPORT_TABS.operations?.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="levels">
          <ReportSection
            title="Enrolment by Level"
            columns={[
              { key: "l", header: "Level", render: (r) => r.levelName },
              { key: "s", header: "Students", render: (r) => r.studentCount },
              { key: "p", header: "Share", render: (r) => `${r.percentage}%` },
            ]}
            rows={levels}
            rowKey={(r) => r.levelName}
            loading={data.school.state === "loading"}
            empty="No enrolment data yet."
          />
        </TabsContent>

        <TabsContent value="hostel">
          <ReportSection
            title="Hostel Occupancy"
            columns={[
              { key: "h", header: "Hostel", render: (r) => r.hostelName },
              { key: "c", header: "Category", render: (r) => r.categoryName },
              { key: "b", header: "Beds", render: (r) => r.totalBeds },
              { key: "o", header: "Occupied", render: (r) => r.occupied },
              { key: "a", header: "Available", render: (r) => r.available },
              {
                key: "r",
                header: "Occupancy",
                render: (r) => `${r.occupancyRate}%`,
              },
            ]}
            rows={hostels}
            rowKey={(r) => r.hostelId}
            loading={data.hostel.state === "loading"}
            empty="No hostels set up yet."
          />
        </TabsContent>

        <TabsContent value="services">
          <ReportSection
            title="Library and Cafeteria"
            subtitle="Figures from the in-app library and cafeteria records"
            columns={[
              { key: "a", header: "Area", render: (r) => r.area },
              { key: "m", header: "Measure", render: (r) => r.measure },
              {
                key: "v",
                header: "Value",
                render: (r) => r.value.toLocaleString(),
              },
            ]}
            rows={services}
            rowKey={(r) => r.area + r.measure}
            empty="No library or cafeteria records yet."
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
