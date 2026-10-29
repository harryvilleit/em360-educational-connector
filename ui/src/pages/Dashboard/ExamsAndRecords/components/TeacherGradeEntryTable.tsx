import { memo } from "react"
import { Download, Save, Send } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { GradeWorksheetAssessmentI } from "@/api/examAndRecords.api/types"

interface GradeEntryRowProps {
  studentId: string
  studentGivenId: string
  studentName: string
  assessments: GradeWorksheetAssessmentI[]
  rowScores: Record<string, number> | undefined
  isReadOnly: boolean
  onScoreChange: (assessmentId: string, studentId: string, value: number) => void
}

const GradeEntryRow = memo(function GradeEntryRow({
  studentId,
  studentGivenId,
  studentName,
  assessments,
  rowScores,
  isReadOnly,
  onScoreChange,
}: GradeEntryRowProps) {
  return (
    <TableRow>
      <TableCell className="font-mono text-sm">{studentGivenId}</TableCell>
      <TableCell className="font-medium">{studentName}</TableCell>
      {assessments.map((a) => {
        const saved = a.studentScores.find((score) => score.studentId === studentId)
        const automatedScore = saved?.automatedScore ?? 0
        const totalScore = rowScores?.[a.id] ?? saved?.score ?? 0
        const manualScore = Math.max(0, totalScore - automatedScore)

        return (
          <TableCell key={a.id} className="text-center align-top">
            <Input
              type="number"
              min={automatedScore}
              max={a.weightPercentage}
              value={rowScores?.[a.id] ?? ""}
              onChange={(e) =>
                onScoreChange(
                  a.id,
                  studentId,
                  Math.min(
                    a.weightPercentage,
                    Math.max(
                      automatedScore,
                      e.target.value ? Number(e.target.value) : automatedScore
                    )
                  )
                )
              }
              disabled={isReadOnly}
              className="mx-auto w-20 text-center"
              placeholder="-"
              aria-label={`${a.name} total score for ${studentName}`}
            />
            <div className="mt-1.5 flex flex-wrap justify-center gap-1">
              <Badge
                variant="outline"
                className="border-blue-200 bg-blue-50 px-1.5 text-[10px] text-blue-700"
              >
                Auto {automatedScore}
              </Badge>
              <Badge
                variant="outline"
                className="border-gray-200 bg-gray-50 px-1.5 text-[10px] text-gray-700"
              >
                Manual {manualScore}
              </Badge>
            </div>
          </TableCell>
        )
      })}
    </TableRow>
  )
})

interface TeacherGradeEntryTableProps {
  worksheet: {
    assessment: GradeWorksheetAssessmentI[]
    status?: string
  }
  worksheetStudentIds: string[]
  studentInfoMap: Map<string, { name: string; studentGivenId: string }>
  scores: Record<string, Record<string, number>>
  selectedSubjectName?: string
  selectedClassName?: string
  selectedTermName?: string
  selectedSessionName?: string
  isReadOnly: boolean
  isSavingDraft: boolean
  isSubmitting: boolean
  onExport: () => void
  onSaveAsDraft: () => void
  onSubmit: () => void
  onScoreChange: (assessmentId: string, studentId: string, value: number) => void
}

export function TeacherGradeEntryTable({
  worksheet,
  worksheetStudentIds,
  studentInfoMap,
  scores,
  selectedSubjectName,
  selectedClassName,
  selectedTermName,
  selectedSessionName,
  isReadOnly,
  isSavingDraft,
  isSubmitting,
  onExport,
  onSaveAsDraft,
  onSubmit,
  onScoreChange,
}: TeacherGradeEntryTableProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {selectedSubjectName}
              {worksheet.status && (
                <Badge variant="outline" className="capitalize">
                  {worksheet.status}
                </Badge>
              )}
            </CardTitle>
            <p className="mt-1 text-sm text-gray-500">
              <span className="font-medium">{selectedClassName}</span> • {" "}
              {selectedTermName} • {selectedSessionName}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onExport} className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-32">Student ID</TableHead>
                <TableHead>Name</TableHead>
                {worksheet.assessment.map((a) => (
                  <TableHead key={a.id} className="text-center">
                    {a.name} ({a.weightPercentage}%)
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {worksheetStudentIds.map((studentId) => (
                <GradeEntryRow
                  key={studentId}
                  studentId={studentId}
                  studentGivenId={
                    studentInfoMap.get(studentId)?.studentGivenId ?? studentId
                  }
                  studentName={studentInfoMap.get(studentId)?.name ?? "Unknown Student"}
                  assessments={worksheet.assessment}
                  rowScores={scores[studentId]}
                  isReadOnly={isReadOnly}
                  onScoreChange={onScoreChange}
                />
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onSaveAsDraft}
            disabled={isSavingDraft || isSubmitting || isReadOnly}
            className="cursor-pointer gap-2 py-4"
          >
            {isSavingDraft ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSavingDraft ? "Saving..." : "Save as Draft"}
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isSubmitting || isSavingDraft || isReadOnly}
            className="cursor-pointer gap-2 bg-chart-2 py-4 text-white"
          >
            {isSubmitting ? (
              <Spinner className="h-4 w-4" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {isSubmitting ? "Submitting..." : "Submit for Approval"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
