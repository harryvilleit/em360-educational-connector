import type { BroadsheetResponseDto } from "@/api/examAndRecords.api/types"
import type { BroadsheetGrid } from "../components/BroadsheetTable"

export function createGrid(data: BroadsheetResponseDto): BroadsheetGrid {
  return Object.fromEntries(
    data.students.map((student) => [
      student.studentId,
      Object.fromEntries(
        data.subjects.map((subject) => {
          const existing = student.subjectScores.find(
            (score) => score.subjectId === subject.subjectId
          )
          return [
            subject.subjectId,
            Object.fromEntries(
              data.assessmentComponents.map((component) => [
                component.id,
                existing?.scores.find(
                  (score) => score.assessmentComponentId === component.id
                )?.score ?? "",
              ])
            ),
          ]
        })
      ),
    ])
  )
}
