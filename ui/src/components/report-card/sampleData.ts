import { idCardIssuedDate } from "@/lib/idCards"
import type { ReportCardData } from "./types"

/** Placeholder student used to preview the design when no real result is open. */
export function sampleReportCardData(
  school: ReportCardData["school"]
): ReportCardData {
  const subject = (
    name: string,
    ca1: number,
    ca2: number,
    exam: number,
    grade: string
  ) => ({
    name,
    assessments: [
      { name: "CA 1", score: ca1 },
      { name: "CA 2", score: ca2 },
      { name: "Exam", score: exam },
    ],
    total: ca1 + ca2 + exam,
    grade,
  })

  return {
    school,
    student: {
      name: "Sample Student",
      admissionNumber: "ADM/001",
      className: "JSS 2",
      session: "2025/2026",
      term: "First Term",
    },
    subjects: [
      subject("Mathematics", 18, 17, 54, "A"),
      subject("English Language", 15, 16, 48, "B"),
      subject("Basic Science", 14, 15, 42, "B"),
      subject("Social Studies", 12, 14, 38, "C"),
    ],
    summary: {
      totalScore: 323,
      averageScore: 80.8,
      position: 3,
      totalStudents: 28,
    },
    remark: "A hardworking student. Keep it up.",
    issuedOn: idCardIssuedDate(),
  }
}
