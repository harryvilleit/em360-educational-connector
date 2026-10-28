import type { BroadsheetResponseDto } from "@/api/examAndRecords.api/types"

export interface CasColumn {
  key: string
  subject: string
  component: string
  max: number
}

export interface CasRow {
  id: string
  name: string
  admissionNumber: string
  gender: string
  // Keyed by CasColumn.key; null when the student does not offer the subject
  scores: Record<string, number | null>
}

export interface CasSheetModel {
  school: string
  className: string
  columns: CasColumn[]
  rows: CasRow[]
}

export function buildCasSheet(data: BroadsheetResponseDto): CasSheetModel {
  const columns = data.subjects.flatMap((s) =>
    data.assessmentComponents.map((c) => ({
      key: `${s.subjectId}:${c.id}`,
      subject: s.subjectName,
      component: c.name,
      max: c.weightPercentage,
    }))
  )

  const rows = data.students.map((st): CasRow => {
    const scores: CasRow["scores"] = {}
    for (const s of data.subjects) {
      const entry = st.subjectScores.find((x) => x.subjectId === s.subjectId)
      for (const c of data.assessmentComponents) {
        scores[`${s.subjectId}:${c.id}`] = entry?.isOffering
          ? (entry.scores.find((x) => x.assessmentComponentId === c.id)
              ?.score ?? null)
          : null
      }
    }
    return {
      id: st.studentId,
      name: st.studentName,
      admissionNumber: st.admissionNumber,
      gender: st.gender,
      scores,
    }
  })

  return { school: data.schoolName, className: data.className, columns, rows }
}

export const casHeader = (c: CasColumn) =>
  `${c.subject} ${c.component} (${c.max})`
