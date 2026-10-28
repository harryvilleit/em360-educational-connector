import type { ExamRecordsOverviewValueI } from "@/api/examAndRecords.api/types"

export interface PerformanceRow {
  id: string
  name: string
  type: "Class" | "Subject"
  avgScore: number
  passRate: number
}

// Classes first, then subjects; the Performance tab and its downloads share this list
export function performanceRows(
  exam: ExamRecordsOverviewValueI | undefined
): PerformanceRow[] {
  return [
    ...(exam?.performanceByClass ?? []).map((c): PerformanceRow => ({
      id: `class-${c.classId}`,
      name: c.className,
      type: "Class",
      avgScore: c.avgScore,
      passRate: c.passRate,
    })),
    ...(exam?.performanceBySubject ?? []).map((s): PerformanceRow => ({
      id: `subject-${s.subjectId}`,
      name: s.subjectName,
      type: "Subject",
      avgScore: s.avgScore,
      passRate: s.passRate,
    })),
  ]
}
