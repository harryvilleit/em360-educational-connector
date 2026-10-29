import type { GuardianStudentResultI } from "@/api/guardian.api/types"
import type { ReportCardData } from "./types"

type ReportCardResult = Omit<ReportCardData, "school" | "issuedOn">

/** Maps the Parent Portal result onto the shared report card shape. */
export function reportCardFromGuardianResult(
  result: GuardianStudentResultI
): ReportCardResult {
  const { student, summary, subjectResults } = result
  return {
    student: {
      name: student.fullName,
      admissionNumber: student.admissionNumber,
      className: student.className,
      session: student.sessionName,
      term: student.termName,
    },
    subjects: subjectResults.map((subject) => ({
      name: subject.subjectName,
      assessments: subject.assessments.map((a) => ({
        name: a.assessmentName,
        score: a.score,
      })),
      total: subject.score,
      grade: subject.grade,
    })),
    summary: {
      totalScore: summary.totalScore,
      averageScore: summary.averageScore,
      position: summary.position,
      totalStudents: summary.totalStudentsInClass,
    },
  }
}
