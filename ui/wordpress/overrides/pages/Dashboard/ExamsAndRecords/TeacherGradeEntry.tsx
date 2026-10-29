// WordPress version: reads the selected class's students for grading instead of every student in the school.
import { useState, useEffect, useMemo, useCallback } from "react"
import { useParams, useNavigate } from "react-router"
import { PageHeader } from "@/components/general/PageHeader"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import SubmitResultModal from "@/pages/Dashboard/ExamsAndRecords/components/SubmitResultModal"
import { TeacherGradeSelectionFilters } from "@/pages/Dashboard/ExamsAndRecords/components/TeacherGradeSelectionFilters"
import { TeacherGradeNoAssessmentStructure } from "@/pages/Dashboard/ExamsAndRecords/components/TeacherGradeNoAssessmentStructure"
import { TeacherGradeEntryTable } from "@/pages/Dashboard/ExamsAndRecords/components/TeacherGradeEntryTable"
import { TeacherGradeEmptyState } from "@/pages/Dashboard/ExamsAndRecords/components/TeacherGradeEmptyState"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useCurrentAcademicStore } from "@/store/currentAcademic.store"
import { useGetAllSchoolSessions } from "@/hooks/userMgt"
import {
  useGetMyGradeClasses,
  useGetClassStudentsForGrading,
  useGetMyGradeSubjects,
  useGetGradeWorksheet,
  useSubmitGradeWorksheet,
  useSaveGradeWorksheetDraft,
} from "@/hooks/examAndRecords"
import type { SubmitGradeWorksheetPayloadI } from "@/api/examAndRecords.api/types"

export default function TeacherGradeEntry() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const schoolId = useSchoolId()
  const currentSessionId = useCurrentAcademicStore((s) => s.currentSessionId)
  const currentTermId = useCurrentAcademicStore((s) => s.currentTermId)

  const { sessions } = useGetAllSchoolSessions({ schoolId })

  const [selectedSessionId, setSelectedSessionId] = useState<string>("")
  const [selectedTermId, setSelectedTermId] = useState<string>("")
  const [selectedClassId, setSelectedClassId] = useState<string>("")
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("")
  const [submitDialog, setSubmitDialog] = useState<boolean>(false)
  const [scores, setScores] = useState<Record<string, Record<string, number>>>(
    {}
  )

  // Default to the current session/term once sessions load
  useEffect(() => {
    if (!selectedSessionId && sessions.length > 0) {
      const session =
        sessions.find((s) => s.Id === currentSessionId) ?? sessions[0]
      setSelectedSessionId(session.Id)
      const term =
        session.Terms.find((t) => t.Id === currentTermId) ??
        session.Terms.find((t) => t.IsCurrent) ??
        session.Terms[0]
      if (term) setSelectedTermId(term.Id)
    }
  }, [sessions, currentSessionId, currentTermId, selectedSessionId])

  const selectedSession = sessions.find((s) => s.Id === selectedSessionId)

  const handleSessionChange = (sessionId: string) => {
    setSelectedSessionId(sessionId)
    const session = sessions.find((s) => s.Id === sessionId)
    const term = session?.Terms.find((t) => t.IsCurrent) ?? session?.Terms[0]
    setSelectedTermId(term?.Id ?? "")
  }

  const { classes, isLoading: classesLoading } = useGetMyGradeClasses({
    schoolId,
  })
  const { subjects, isLoading: subjectsLoading } = useGetMyGradeSubjects({
    classId: selectedClassId,
    schoolId,
  })

  const handleClassChange = (classId: string) => {
    setSelectedClassId(classId)
    setSelectedSubjectId("")
  }

  const { worksheet, isLoading: worksheetLoading } = useGetGradeWorksheet({
    schoolId,
    sessionId: selectedSessionId,
    schoolSessionTermId: selectedTermId,
    classId: selectedClassId,
    subjectId: selectedSubjectId,
  })

  // Only the selected class's students: the WordPress gateway does not return whole-school lists.
  const { students: schoolStudents } = useGetClassStudentsForGrading({
    schoolId,
    classId: selectedClassId,
    sessionId: selectedSessionId,
    schoolSessionTermId: selectedTermId,
  })

  const studentInfoMap = useMemo(() => {
    const map = new Map<string, { name: string; studentGivenId: string }>()
    schoolStudents.forEach((s) => {
      map.set(s.studentId, {
        name: s.studentName,
        studentGivenId: s.admissionNumber,
      })
    })
    return map
  }, [schoolStudents])

  const worksheetStudentIds = useMemo(() => {
    if (!worksheet) return []
    const ids = new Set<string>()
    worksheet.assessment.forEach((a) =>
      a.studentScores.forEach((ss) => ids.add(ss.studentId))
    )
    return Array.from(ids)
  }, [worksheet])

  useEffect(() => {
    if (!worksheet) {
      setScores({})
      return
    }
    const initial: Record<string, Record<string, number>> = {}
    worksheet.assessment.forEach((a) => {
      a.studentScores.forEach((ss) => {
        if (!initial[ss.studentId]) initial[ss.studentId] = {}
        initial[ss.studentId][a.id] = ss.score
      })
    })
    setScores(initial)
  }, [worksheet])

  const handleScoreChange = useCallback(
    (assessmentId: string, studentId: string, value: number) => {
      setScores((prev) => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          [assessmentId]: value,
        },
      }))
    },
    []
  )

  const { submitGradeWorksheet, isPending: isSubmitting } =
    useSubmitGradeWorksheet({
      onSuccess: () => {
        setSubmitDialog(false)
        navigate(`/dashboard/${productId}/exams_and_records`)
      },
    })

  const { saveGradeWorksheetDraft, isPending: isSavingDraft } =
    useSaveGradeWorksheetDraft()

  const buildWorksheetPayload =
    useCallback((): SubmitGradeWorksheetPayloadI | null => {
      if (!worksheet) return null

      return {
        schoolId,
        sessionId: selectedSessionId,
        termId: selectedTermId,
        classId: selectedClassId,
        subjectId: selectedSubjectId,
        assessment: worksheet.assessment.map((a) => ({
          id: a.id,
          studentScores: worksheetStudentIds.map((studentId) => ({
            studentId,
            score: scores[studentId]?.[a.id] ?? 0,
          })),
        })),
      }
    }, [
      worksheet,
      schoolId,
      selectedSessionId,
      selectedTermId,
      selectedClassId,
      selectedSubjectId,
      worksheetStudentIds,
      scores,
    ])

  const handleConfirmSubmit = () => {
    const payload = buildWorksheetPayload()
    if (!payload) return

    submitGradeWorksheet(payload)
  }

  const handleSaveAsDraft = () => {
    const payload = buildWorksheetPayload()
    if (!payload) return

    saveGradeWorksheetDraft(payload)
  }

  const handleExport = () => {
    if (!worksheet) return
    const headers = [
      "Student ID",
      "Name",
      ...worksheet.assessment.map((a) => a.name),
    ]
    const rows = worksheetStudentIds.map((studentId) => [
      studentInfoMap.get(studentId)?.studentGivenId ?? studentId,
      studentInfoMap.get(studentId)?.name ?? "Unknown Student",
      ...worksheet.assessment.map((a) => scores[studentId]?.[a.id] ?? ""),
    ])

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${selectedSubjectName ?? "grades"}_worksheet.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const selectedClassName = classes.find(
    (c) => c.classId === selectedClassId
  )?.className
  const selectedSubjectName = subjects.find(
    (s) => s.subjectId === selectedSubjectId
  )?.subjectName
  const selectedSessionName = selectedSession?.SessionName
  const selectedTermName = selectedSession?.Terms.find(
    (t) => t.Id === selectedTermId
  )?.TermName

  const statusLower = (worksheet?.status ?? "").toLowerCase()
  const isReadOnly = ["pending", "submitted", "approved"].includes(statusLower)

  const isReady = !!(
    selectedSessionId &&
    selectedTermId &&
    selectedClassId &&
    selectedSubjectId
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grade Entry"
        description="Input and manage student scores"
      />

      <TeacherGradeSelectionFilters
        sessions={sessions}
        selectedSessionId={selectedSessionId}
        selectedTermId={selectedTermId}
        selectedClassId={selectedClassId}
        selectedSubjectId={selectedSubjectId}
        selectedSession={selectedSession}
        classes={classes}
        subjects={subjects}
        classesLoading={classesLoading}
        subjectsLoading={subjectsLoading}
        onSessionChange={handleSessionChange}
        onTermChange={setSelectedTermId}
        onClassChange={handleClassChange}
        onSubjectChange={setSelectedSubjectId}
      />

      {/* Loading State */}
      {isReady && worksheetLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Spinner className="h-6 w-6" />
          </CardContent>
        </Card>
      )}

      {/* No Assessment Structure */}
      {isReady &&
        !worksheetLoading &&
        worksheet &&
        worksheet.assessment.length === 0 && (
          <TeacherGradeNoAssessmentStructure />
        )}

      {isReady &&
        !worksheetLoading &&
        worksheet &&
        worksheet.assessment.length > 0 && (
          <TeacherGradeEntryTable
            worksheet={worksheet}
            worksheetStudentIds={worksheetStudentIds}
            studentInfoMap={studentInfoMap}
            scores={scores}
            selectedSubjectName={selectedSubjectName}
            selectedClassName={selectedClassName}
            selectedTermName={selectedTermName}
            selectedSessionName={selectedSessionName}
            isReadOnly={isReadOnly}
            isSavingDraft={isSavingDraft}
            isSubmitting={isSubmitting}
            onExport={handleExport}
            onSaveAsDraft={handleSaveAsDraft}
            onSubmit={() => setSubmitDialog(true)}
            onScoreChange={handleScoreChange}
          />
        )}

      {!isReady && <TeacherGradeEmptyState />}

      {/* Submission Confirmation Dialog */}
      <SubmitResultModal
        open={submitDialog}
        onOpenChange={setSubmitDialog}
        selectedSubjectName={selectedSubjectName || ""}
        selectedClassName={selectedClassName || ""}
        studentCount={worksheetStudentIds.length}
        isLoading={isSubmitting}
        onConfirmSubmit={handleConfirmSubmit}
      />
    </div>
  )
}
