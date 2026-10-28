import type { ExamRecordsOverviewValueI } from "@/api/examAndRecords.api/types"

const num = (n: number) => n.toLocaleString()

export interface SummaryRow {
  label: string
  value: string
}

// The same rows feed the Academic Summary tab and its downloads
export function academicSummary(
  exam: ExamRecordsOverviewValueI | undefined
): SummaryRow[] {
  if (!exam) return []
  return [
    { label: "Students on record", value: num(exam.totalStudents) },
    {
      label: "Students passed",
      value: `${num(exam.studentsPassed)} of ${num(exam.studentsPassedTotal)}`,
    },
    { label: "Overall pass rate", value: `${exam.overallPassRate}%` },
    { label: "Exams conducted", value: num(exam.examsConducted) },
    { label: "Classes", value: num(exam.totalClasses) },
    { label: "Subjects", value: num(exam.totalSubjects) },
    { label: "Departments", value: num(exam.totalDepartments) },
    { label: "At-risk students", value: num(exam.atRiskStudents) },
  ]
}
