import { useEffect, useMemo, useRef, useState } from "react"
import { Lock, Save, Undo2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { PageHeader } from "@/components/general/PageHeader"
import { Spinner } from "@/components/ui/spinner"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useCurrentAcademicStore } from "@/store/currentAcademic.store"
import { useGetAllSchoolSessions } from "@/hooks/userMgt"
import {
  useGetAllClasses,
  useGetClassStudentsForGrading,
  useGetStudentSubjectScores,
  useSaveStudentScoresDraft,
} from "@/hooks/examAndRecords"
import type {
  AssessmentComponentInfoI,
  SaveStudentScoresDraftPayloadI,
  StudentSubjectScoreItemI,
  WorksheetStatus,
} from "@/api/examAndRecords.api/types"

type EditableScores = Record<string, Record<string, number>>

const WORKSHEET_STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  PENDING: "Submitted for Approval - Locked",
  APPROVED: "Approved - Locked",
  REJECTED: "Rejected",
}

const WORKSHEET_STATUS_CLASS: Record<string, string> = {
  DRAFT: "border-yellow-200 bg-yellow-50 text-yellow-800",
  PENDING: "border-blue-200 bg-blue-50 text-blue-800",
  APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-800",
  REJECTED: "border-red-200 bg-red-50 text-red-800",
}

function worksheetStatusLabel(status: WorksheetStatus) {
  if (!status) return "Not Started"
  return WORKSHEET_STATUS_LABEL[status] ?? status
}

function worksheetStatusClass(status: WorksheetStatus) {
  if (!status) return "border-gray-200 bg-gray-50 text-gray-600"
  return WORKSHEET_STATUS_CLASS[status] ?? "border-gray-200 bg-gray-50 text-gray-600"
}

function buildEditableScores(
  subjects: StudentSubjectScoreItemI[]
): EditableScores {
  const result: EditableScores = {}
  for (const subject of subjects) {
    if (!subject.canEdit) continue
    const entry: Record<string, number> = {}
    for (const s of subject.scores) entry[s.assessmentComponentId] = s.score
    result[subject.subjectId] = entry
  }
  return result
}

export default function StudentGradeEntryPage() {
  const schoolId = useSchoolId()
  const currentSessionId = useCurrentAcademicStore((s) => s.currentSessionId)
  const currentTermId = useCurrentAcademicStore((s) => s.currentTermId)

  const { sessions } = useGetAllSchoolSessions({ schoolId })
  const { classes, isLoading: classesLoading } = useGetAllClasses({
    schoolId,
    pageSize: 200,
  })

  const [selectedSessionId, setSelectedSessionId] = useState("")
  const [selectedTermId, setSelectedTermId] = useState("")
  const [selectedClassId, setSelectedClassId] = useState("")
  const [selectedStudentId, setSelectedStudentId] = useState("")

  const [editableScores, setEditableScores] = useState<EditableScores>({})
  const [baselineScores, setBaselineScores] = useState<EditableScores>({})
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  const identityKeyRef = useRef("")

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

  const { students, isLoading: studentsLoading } = useGetClassStudentsForGrading({
    schoolId,
    classId: selectedClassId,
    sessionId: selectedSessionId,
    schoolSessionTermId: selectedTermId,
  })

  const {
    scores: scoresData,
    isLoading: scoresLoading,
  } = useGetStudentSubjectScores({
    schoolId,
    sessionId: selectedSessionId,
    schoolSessionTermId: selectedTermId,
    classId: selectedClassId,
    studentId: selectedStudentId,
  })

  useEffect(() => {
 
    if (!scoresData?.studentInfo) {
      if (!scoresData) {
        identityKeyRef.current = ""
        setEditableScores({})
        setBaselineScores({})
      }
      return
    }

    const key = `${scoresData.studentInfo.studentId}|${selectedSessionId}|${selectedTermId}|${selectedClassId}`
    const isNewIdentity = key !== identityKeyRef.current
    identityKeyRef.current = key

    const fresh = buildEditableScores(scoresData.subjects ?? [])

    if (isNewIdentity) {
      setEditableScores(fresh)
      setBaselineScores(fresh)
      return
    }

    setBaselineScores(fresh)
    setEditableScores((prev) => {
      const next: EditableScores = {}
      for (const subjectId of Object.keys(fresh)) {
        next[subjectId] = prev[subjectId] ?? fresh[subjectId]
      }
      return next
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scoresData])

  const isDirty = useMemo(
    () => JSON.stringify(editableScores) !== JSON.stringify(baselineScores),
    [editableScores, baselineScores]
  )

  const assessmentComponents = useMemo(
    () => scoresData?.assessmentComponents ?? [],
    [scoresData]
  )

  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {}
    if (!scoresData) return errors
    for (const subject of scoresData.subjects ?? []) {
      if (!subject.canEdit) continue
      for (const component of assessmentComponents) {
        const value = editableScores[subject.subjectId]?.[component.id] ?? 0
        const automatedScore =
          subject.scores.find(
            (score) => score.assessmentComponentId === component.id
          )?.automatedScore ?? 0
        if (value < automatedScore) {
          errors[`${subject.subjectId}:${component.id}`] =
            `The automated score of ${automatedScore} is protected.`
        } else if (value < 0 || value > component.weightPercentage) {
          errors[`${subject.subjectId}:${component.id}`] =
            `Maximum score for ${component.name} is ${component.weightPercentage}.`
        }
      }
    }
    return errors
  }, [scoresData, assessmentComponents, editableScores])

  const hasValidationErrors = Object.keys(validationErrors).length > 0

  function handleScoreChange(
    subjectId: string,
    componentId: string,
    rawValue: string
  ) {
    const value = rawValue === "" ? 0 : Number(rawValue)
    if (Number.isNaN(value)) return
    setEditableScores((prev) => ({
      ...prev,
      [subjectId]: { ...prev[subjectId], [componentId]: value },
    }))
  }

  function computeTotal(subjectId: string) {
    const componentScores = editableScores[subjectId] ?? {}
    return assessmentComponents.reduce(
      (sum, c) => sum + (componentScores[c.id] ?? 0),
      0
    )
  }


  function guardedChange(action: () => void) {
    if (isDirty) setPendingAction(() => action)
    else action()
  }

  const handleSessionChange = (sessionId: string) =>
    guardedChange(() => {
      setSelectedSessionId(sessionId)
      const session = sessions.find((s) => s.Id === sessionId)
      const term = session?.Terms.find((t) => t.IsCurrent) ?? session?.Terms[0]
      setSelectedTermId(term?.Id ?? "")
      setSelectedClassId("")
      setSelectedStudentId("")
    })

  const handleTermChange = (termId: string) =>
    guardedChange(() => {
      setSelectedTermId(termId)
      setSelectedClassId("")
      setSelectedStudentId("")
    })

  const handleClassChange = (classId: string) =>
    guardedChange(() => {
      setSelectedClassId(classId)
      setSelectedStudentId("")
    })

  const handleStudentChange = (studentId: string) =>
    guardedChange(() => setSelectedStudentId(studentId))

  const { saveStudentScoresDraftAsync, isPending: isSaving } =
    useSaveStudentScoresDraft()

  function buildSavePayload(): SaveStudentScoresDraftPayloadI | null {
    if (!scoresData || !selectedStudentId) return null
    const dirtySubjectIds = Object.keys(editableScores).filter(
      (subjectId) =>
        JSON.stringify(editableScores[subjectId]) !==
        JSON.stringify(baselineScores[subjectId])
    )
    if (dirtySubjectIds.length === 0) return null

    return {
      schoolId,
      sessionId: selectedSessionId,
      schoolSessionTermId: selectedTermId,
      classId: selectedClassId,
      studentId: selectedStudentId,
      subjects: dirtySubjectIds.map((subjectId) => ({
        subjectId,
        scores: Object.entries(editableScores[subjectId]).map(
          ([assessmentComponentId, score]) => ({ assessmentComponentId, score })
        ),
      })),
    }
  }

  async function handleSaveDraft() {
    const payload = buildSavePayload()
    if (!payload) return
    try {
      await saveStudentScoresDraftAsync(payload)
    } catch {
      // toast already shown by useSaveStudentScoresDraft
    }
  }

  function handleDiscardChanges() {
    setEditableScores(baselineScores)
  }

  const editableSubjects =
    scoresData?.subjects?.filter((s) => s.canEdit) ?? []
  const allSubjectsLocked =
    !!scoresData &&
    (scoresData.subjects?.length ?? 0) > 0 &&
    editableSubjects.length === 0

  const saveDisabled =
    !selectedStudentId ||
    !scoresData ||
    editableSubjects.length === 0 ||
    !isDirty ||
    hasValidationErrors ||
    isSaving

  const studentPlaceholder = !selectedSessionId || !selectedTermId
    ? "Select academic filters first"
    : !selectedClassId
      ? "Select a class first"
      : studentsLoading
        ? "Loading students..."
        : students.length === 0
          ? "No students found for this class."
          : "Select a student"

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Grade Entry"
        description="Enter a single student's assessment scores across all their subjects"
      />

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Select Student</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Session</label>
              <Select value={selectedSessionId} onValueChange={handleSessionChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((session) => (
                    <SelectItem key={session.Id} value={session.Id}>
                      {session.SessionName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Term</label>
              <Select
                value={selectedTermId}
                onValueChange={handleTermChange}
                disabled={!selectedSessionId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>
                <SelectContent>
                  {selectedSession?.Terms.map((term) => (
                    <SelectItem key={term.Id} value={term.Id}>
                      {term.TermName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Class</label>
              <Select
                value={selectedClassId}
                onValueChange={handleClassChange}
                disabled={!selectedSessionId || !selectedTermId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={classesLoading ? "Loading…" : "Select class"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.Id} value={c.Id}>
                      {c.ClsName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Student</label>
              <Select
                value={selectedStudentId}
                onValueChange={handleStudentChange}
                disabled={
                  !selectedSessionId ||
                  !selectedTermId ||
                  !selectedClassId ||
                  studentsLoading ||
                  students.length === 0
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={studentPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.studentId} value={student.studentId}>
                      {student.studentName} ({student.admissionNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading grading sheet */}
      {selectedStudentId && scoresLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Spinner className="h-6 w-6" />
          </CardContent>
        </Card>
      )}

      {/* Grading sheet */}
      {selectedStudentId && !scoresLoading && scoresData && !scoresData.studentInfo && (
        <Card className="border-dashed border-destructive/40">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="font-semibold text-gray-900">
              Couldn't read this student's grading sheet
            </h3>
            <p className="mt-2 max-w-sm text-center text-sm text-gray-500">
              The server response was missing expected student information.
              Please try again or contact support if this continues.
            </p>
          </CardContent>
        </Card>
      )}

      {selectedStudentId && !scoresLoading && scoresData?.studentInfo && (
        <>
          {/* Student info + summary */}
          <Card>
            <CardContent className="grid gap-4 py-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">Student</p>
                <p className="font-medium text-gray-900">
                  {scoresData.studentInfo.studentName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {scoresData.studentInfo.admissionNumber}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Class</p>
                <p className="font-medium text-gray-900">
                  {scoresData.studentInfo.className}
                </p>
                <p className="text-xs text-muted-foreground">
                  {scoresData.studentInfo.sessionName} - {scoresData.studentInfo.termName}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Subjects</p>
                <p className="text-xl font-semibold text-gray-900">
                  {scoresData.summary?.totalSubjects ?? "–"}
                </p>
              </div>
              <div className="flex gap-6">
                <div>
                  <p className="text-xs text-muted-foreground">Cumulative Score</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {scoresData.summary?.totalScore ?? "–"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Average Score</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {scoresData.summary?.averageScore?.toFixed(1) ?? "–"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {(scoresData.subjects ?? []).length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                  <Users className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="mt-4 font-semibold text-gray-900">
                  No subjects available
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  No subjects are available for this student.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Subject Scores</CardTitle>
                {allSubjectsLocked && (
                  <p className="text-sm text-amber-700">
                    All subject worksheets for this student are currently
                    locked and cannot be edited.
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8">#</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Worksheet Status</TableHead>
                        {assessmentComponents.map((c) => (
                          <TableHead key={c.id} className="text-center">
                            {c.name} ({c.weightPercentage}%)
                          </TableHead>
                        ))}
                        <TableHead className="text-center">Total</TableHead>
                        <TableHead className="text-center">Grade</TableHead>
                        <TableHead>Remark</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(scoresData.subjects ?? []).map((subject, index) => (
                        <SubjectRow
                          key={subject.subjectId}
                          index={index + 1}
                          subject={subject}
                          assessmentComponents={assessmentComponents}
                          rowScores={editableScores[subject.subjectId]}
                          errors={validationErrors}
                          onScoreChange={handleScoreChange}
                          liveTotal={
                            subject.canEdit
                              ? computeTotal(subject.subjectId)
                              : subject.totalScore
                          }
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Action bar */}
                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={handleDiscardChanges}
                    disabled={!isDirty || isSaving}
                    className="cursor-pointer gap-2 py-4"
                  >
                    <Undo2 className="h-4 w-4" />
                    Discard Changes
                  </Button>
                  <Button
                    onClick={handleSaveDraft}
                    disabled={saveDisabled}
                    className="cursor-pointer gap-2 bg-chart-2 py-4 text-white"
                  >
                    {isSaving ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {isSaving ? "Saving..." : "Save as Draft"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* No students in class */}
      {selectedClassId &&
        !studentsLoading &&
        students.length === 0 &&
        !selectedStudentId && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                <Users className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="mt-4 font-semibold text-gray-900">No students</h3>
              <p className="mt-2 max-w-sm text-center text-sm text-gray-500">
                No students are enrolled in this class for the selected
                academic period.
              </p>
            </CardContent>
          </Card>
        )}

      {/* Nothing selected yet */}
      {!selectedStudentId && !(selectedClassId && students.length === 0) && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <Users className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="mt-4 font-semibold text-gray-900">No Student Selected</h3>
            <p className="mt-2 text-sm text-gray-500">
              Please select a session, term, class and student to start
              entering grades
            </p>
          </CardContent>
        </Card>
      )}

      {/* Unsaved changes guard */}
      <AlertDialog
        open={!!pendingAction}
        onOpenChange={(open) => !open && setPendingAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved score changes for{" "}
              <span className="font-medium text-gray-900">
                {scoresData?.studentInfo?.studentName ?? "this student"}
              </span>
              . Changing the selected student or academic filters will
              discard these changes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingAction(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                pendingAction?.()
                setPendingAction(null)
              }}
              className="bg-amber-600 text-white hover:bg-amber-700"
            >
              Discard & Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

interface SubjectRowProps {
  index: number
  subject: StudentSubjectScoreItemI
  assessmentComponents: AssessmentComponentInfoI[]
  rowScores: Record<string, number> | undefined
  errors: Record<string, string>
  onScoreChange: (subjectId: string, componentId: string, value: string) => void
  liveTotal: number
}

function SubjectRow({
  index,
  subject,
  assessmentComponents,
  rowScores,
  errors,
  onScoreChange,
  liveTotal,
}: SubjectRowProps) {
  const savedScoreByComponent = new Map(
    subject.scores.map((score) => [score.assessmentComponentId, score])
  )

  return (
    <TableRow>
      <TableCell className="text-sm text-muted-foreground">{index}</TableCell>
      <TableCell>
        <p className="font-medium text-gray-900">{subject.subjectName}</p>
        <p className="text-xs text-muted-foreground">
          {subject.isMandatory ? "Compulsory" : "Optional"}
        </p>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <Badge
            variant="outline"
            className={worksheetStatusClass(subject.worksheetStatus)}
          >
            {worksheetStatusLabel(subject.worksheetStatus)}
          </Badge>
          {subject.isLocked && subject.lockReason && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Lock className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                {subject.lockReason}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TableCell>

      {assessmentComponents.map((component) => {
        const errorKey = `${subject.subjectId}:${component.id}`
        const errorMessage = errors[errorKey]
        const savedScore = savedScoreByComponent.get(component.id)
        const automatedScore = savedScore?.automatedScore ?? 0

        if (!subject.canEdit) {
          return (
            <TableCell key={component.id} className="text-center align-top">
              <p className="font-medium">{savedScore?.score ?? "–"}</p>
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
                  Manual {savedScore?.manualScore ?? 0}
                </Badge>
              </div>
            </TableCell>
          )
        }

        const totalScore = rowScores?.[component.id] ?? savedScore?.score ?? 0
        const manualScore = Math.max(0, totalScore - automatedScore)

        return (
          <TableCell key={component.id} className="text-center align-top">
            <Input
              type="number"
              min={automatedScore}
              max={component.weightPercentage}
              step="0.5"
              value={rowScores?.[component.id] ?? ""}
              aria-invalid={!!errorMessage}
              onChange={(e) => {
                const value = e.target.value
                onScoreChange(
                  subject.subjectId,
                  component.id,
                  value === ""
                    ? String(automatedScore)
                    : String(Math.max(automatedScore, Number(value)))
                )
              }}
              className="mx-auto w-20 text-center"
              placeholder="-"
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
            {errorMessage && (
              <p className="mt-1 text-[10px] leading-tight text-destructive">
                {errorMessage}
              </p>
            )}
          </TableCell>
        )
      })}

      <TableCell className="text-center font-medium">
        {subject.canEdit ? liveTotal : subject.totalScore}
      </TableCell>
      <TableCell className="text-center">
        <Badge variant="outline">{subject.grade || "–"}</Badge>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {subject.remark || "–"}
      </TableCell>
    </TableRow>
  )
}
