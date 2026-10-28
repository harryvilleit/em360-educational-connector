import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { academicSummary } from "../../academicSummary"
import { performanceRows, type PerformanceRow } from "../../academicPerformance"
import { REPORT_TABS } from "../../reportTabs"
import type { CasSheetState } from "../../useCasSheet"
import type { ReportData } from "../../useReportData"
import { CasSheetTab } from "./CasSheetTab"
import { ReportSection, Tiles, type SectionFilter } from "../shared/ReportParts"

const num = (n: number) => n.toLocaleString()

const BANDS = [
  { value: "low", label: "Below 50%", test: (v: number) => v < 50 },
  { value: "mid", label: "50% to 74%", test: (v: number) => v >= 50 && v < 75 },
  { value: "high", label: "75% and above", test: (v: number) => v >= 75 },
]

// One filter per score column, reused for classes and subjects
function bandFilter<T>(
  placeholder: string,
  pick: (row: T) => number
): SectionFilter<T> {
  return {
    placeholder,
    options: BANDS.map(({ value, label }) => ({ value, label })),
    matches: (row, value) =>
      !!BANDS.find((b) => b.value === value)?.test(pick(row)),
  }
}

export function AcademicReport({
  data,
  tab,
  onTabChange,
  cas,
  classId,
  onClassChange,
  periodReady,
}: {
  data: ReportData
  tab: string
  onTabChange: (tab: string) => void
  cas: CasSheetState
  classId: string
  onClassChange: (classId: string) => void
  periodReady: boolean
}) {
  const exam = data.exam.data
  const loading = data.exam.state === "loading"
  const grades = exam?.gradeDistribution ?? []
  const performance = performanceRows(exam)

  return (
    <div className="space-y-6">
      <Tiles domain="academic" data={data} />

      <Tabs value={tab} onValueChange={onTabChange} className="gap-4">
        <TabsList>
          {REPORT_TABS.academic?.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="summary">
          <ReportSection
            title="Academic Summary"
            columns={[
              { key: "l", header: "Measure", render: (r) => r.label },
              { key: "v", header: "Value", render: (r) => r.value },
            ]}
            rows={academicSummary(exam)}
            rowKey={(r) => r.label}
            loading={loading}
            empty="No exam records for this period yet."
            searchBy={(r) => r.label}
            searchPlaceholder="Search measure"
          />
        </TabsContent>

        <TabsContent value="grades">
          <ReportSection
            title="Grade Distribution"
            subtitle="Number of students at each grade"
            columns={[
              { key: "g", header: "Grade", render: (r) => r.grade },
              { key: "r", header: "Score range", render: (r) => r.scoreRange },
              { key: "d", header: "Description", render: (r) => r.label },
              { key: "c", header: "Students", render: (r) => num(r.count) },
              { key: "p", header: "Share", render: (r) => `${r.percentage}%` },
            ]}
            rows={grades}
            rowKey={(r) => r.grade}
            loading={loading}
            empty="No graded results for this period yet."
            searchBy={(r) => `${r.grade} ${r.label} ${r.scoreRange}`}
            searchPlaceholder="Search grade"
            filters={[
              {
                placeholder: "Share of students",
                options: [
                  { value: "high", label: "10% and above" },
                  { value: "low", label: "Below 10%" },
                ],
                matches: (r, v) => r.percentage >= 10 === (v === "high"),
              },
            ]}
          />
        </TabsContent>

        <TabsContent value="performance">
          <ReportSection
            title="Performance"
            subtitle="Average score and pass rate for each class and subject"
            columns={[
              { key: "n", header: "Name", render: (r) => r.name },
              { key: "t", header: "Type", render: (r) => r.type },
              {
                key: "a",
                header: "Average score",
                render: (r) => `${r.avgScore}%`,
              },
              {
                key: "p",
                header: "Pass rate",
                render: (r) => `${r.passRate}%`,
              },
            ]}
            rows={performance}
            rowKey={(r) => r.id}
            loading={loading}
            empty="No class or subject results for this period yet."
            searchBy={(r) => r.name}
            searchPlaceholder="Search class or subject"
            filters={[
              {
                placeholder: "Type",
                options: [
                  { value: "Class", label: "Classes" },
                  { value: "Subject", label: "Subjects" },
                ],
                matches: (r, v) => r.type === v,
              },
              bandFilter("Average score", (r: PerformanceRow) => r.avgScore),
              bandFilter("Pass rate", (r: PerformanceRow) => r.passRate),
            ]}
          />
        </TabsContent>

        <TabsContent value="cas">
          <CasSheetTab
            cas={cas}
            classId={classId}
            onClassChange={onClassChange}
            periodReady={periodReady}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
