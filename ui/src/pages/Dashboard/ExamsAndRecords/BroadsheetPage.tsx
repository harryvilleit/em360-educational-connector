import { useMemo, useState, useEffect } from "react"
import {
  Calculator,
  Download,
  RotateCcw,
  Save,
  Send,
  Table2,
} from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/general/PageHeader"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSchoolId } from "@/contexts/SchoolContext"
import {
  useGetAllClasses,
  useGetBroadsheet,
  useSaveBroadsheetDraft,
  useSubmitBroadsheet,
} from "@/hooks/examAndRecords"
import { useGetAllSchoolSessions } from "@/hooks/userMgt"
import type {
  SaveBroadsheetDraftCommand,
  SubmitBroadsheetCommand,
} from "@/api/examAndRecords.api/types"
import {
  BroadsheetTable,
  type BroadsheetComputedRow,
  type BroadsheetGrid,
} from "./components/BroadsheetTable"

import { createGrid } from "./broadsheet/createGrid"

export default function BroadsheetPage() {
  const schoolId = useSchoolId()
  const [classId, setClassId] = useState("")
  const [schoolSessionTermId, setSchoolSessionTermId] = useState("")
  const [sessionId, setSessionId] = useState("")
  const [status, setStatus] = useState<
    "draft" | "calculated" | "saved" | "submitted"
  >("draft")
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)

  const { classes: rawClasses, isLoading: classesLoading } = useGetAllClasses({
    schoolId,
  })
  const { sessions: rawSessions, isLoading: sessionsLoading } =
    useGetAllSchoolSessions({ schoolId })

  const classes = useMemo(
    () => rawClasses.map((cls) => ({ id: cls.Id, name: cls.ClsName })),
    [rawClasses]
  )

  const sessions = useMemo(
    () =>
      rawSessions.map((sess) => ({
        id: sess.Id,
        name: sess.SessionName,
        isCurrent: sess.IsCurrent === true || sess.Status === "Active",
        terms: (sess.Terms ?? []).map((term) => ({
          id: term.Id,
          name: term.TermName,
          isCurrent: term.IsCurrent === true,
        })),
      })),
    [rawSessions]
  )

  // Default to the first class once classes load.
  useEffect(() => {
    if (classes.length === 0) return
    setClassId((current) => current || classes[0].id)
  }, [classes])

  useEffect(() => {
    if (sessions.length === 0) return
    const current = sessions.find((item) => item.isCurrent) ?? sessions[0]
    setSessionId((selected) => selected || current.id)
  }, [sessions])

  const terms = useMemo(() => {
    const selectedSession = sessions.find((item) => item.id === sessionId)
    return selectedSession?.terms ?? []
  }, [sessions, sessionId])

  useEffect(() => {
    const current = terms.find((item) => item.isCurrent) ?? terms[0]
    setSchoolSessionTermId(current?.id ?? "")
  }, [terms])

  const broadsheetParams = useMemo(
    () => ({ schoolId, classId, sessionId, schoolSessionTermId }),
    [schoolId, classId, sessionId, schoolSessionTermId]
  )

  const { broadsheet: broadsheetData, isLoading: broadsheetLoading } =
    useGetBroadsheet(broadsheetParams)

  const { saveBroadsheetDraftAsync, isPending: isSaving } =
    useSaveBroadsheetDraft()
  const { submitBroadsheetAsync, isPending: isSubmitting } =
    useSubmitBroadsheet()
  const busy = isSaving || isSubmitting

  const [computed, setComputed] = useState<BroadsheetComputedRow[] | null>(null)
  const [grid, setGrid] = useState<BroadsheetGrid>({})

  // Rebuild the grid whenever a fresh Broadsheet loads (new filters or a refetch).
  useEffect(() => {
    if (broadsheetData) {
      setGrid(createGrid(broadsheetData))
      setComputed(null)
      setStatus("draft")
    }
  }, [broadsheetData])

  const computeResults = (grid: BroadsheetGrid) => {
    if (!broadsheetData) return null

    const students = broadsheetData.students.map((student) => {
      const offeredSubjects = student.subjectScores.filter(
        (subject) => subject.isOffering
      )
      const totals = offeredSubjects.map((subject) => {
        const score = grid[student.studentId]?.[subject.subjectId] ?? {}
        return Object.values(score).reduce<number>(
          (sum, value) => sum + (typeof value === "number" ? value : 0),
          0
        )
      })
      const total = totals.reduce((sum, n) => sum + n, 0)
      const average = offeredSubjects.length
        ? total / offeredSubjects.length
        : 0
      const gradeObj = (broadsheetData.gradingScale ?? []).find(
        (grade) => average >= grade.minScore && average <= grade.maxScore
      )
      const grade = gradeObj?.grade ?? "–"
      return {
        studentId: student.studentId,
        total,
        average: Math.round(average * 100) / 100,
        grade,
        position: 0,
      }
    })

    const sorted = [...students].sort((a, b) => b.total - a.total)
    let lastTotal = Number.NaN
    let lastPosition = 0
    sorted.forEach((row, index) => {
      if (row.total !== lastTotal) {
        lastPosition = index + 1
        lastTotal = row.total
      }
      row.position = lastPosition
    })

    const byId = new Map(sorted.map((r) => [r.studentId, r]))
    const finalResults = broadsheetData.students.map((student) =>
      byId.get(student.studentId)!
    )

    return { studentResults: finalResults }
  }

  const updateScore = (
    studentId: string,
    subjectId: string,
    field: string,
    raw: string,
    max: number,
    min: number
  ) => {
    const nextValue =
      raw.trim() === ""
        ? min > 0
          ? min
          : ""
        : Math.min(Math.max(Number(raw) || 0, min), max)
    setGrid((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectId]: {
          ...prev[studentId][subjectId],
          [field]: nextValue,
        },
      },
    }))
    setComputed(null)
    setStatus("draft")
  }

  const handleCalculate = () => {
    if (!broadsheetData) return
    const rows = computeResults(grid)
    if (rows) {
      setComputed(rows.studentResults)
      setStatus("calculated")
      toast.success("Class totals, averages, grades and positions calculated")
    }
  }

  const handleSaveProgress = async () => {
    if (!broadsheetData) return
    const payload: SaveBroadsheetDraftCommand = {
      schoolId,
      classId,
      sessionId,
      schoolSessionTermId,
      subjects: broadsheetData.subjects
        .filter((subject) => subject.canEdit && !subject.isApproved)
        .map((subject) => ({
          subjectId: subject.subjectId,
          studentScores: broadsheetData.students
            .filter(
              (student) =>
                student.subjectScores.find(
                  (score) => score.subjectId === subject.subjectId
                )?.isOffering
            )
            .map((student) => ({
              studentId: student.studentId,
              componentScores: broadsheetData.assessmentComponents.map(
                (ac) => ({
                  assessmentComponentId: ac.id,
                  score: Number(
                    grid[student.studentId]?.[subject.subjectId]?.[ac.id] || 0
                  ),
                })
              ),
            })),
        })),
    }
    try {
      const res = await saveBroadsheetDraftAsync(payload)
      setStatus("saved")
      setLastSavedAt(new Date().toLocaleString())
      toast.success(res.message || "Broadsheet progress saved")
    } catch {
      // Errors are already toasted by useSaveBroadsheetDraft.
    }
  }

  const handleSubmit = async () => {
    if (!broadsheetData) return
    const payload: SubmitBroadsheetCommand = {
      schoolId,
      classId,
      sessionId,
      schoolSessionTermId,
      subjects: broadsheetData.subjects
        .filter((subject) => subject.canSubmit)
        .map((subject) => ({
          subjectId: subject.subjectId,
          studentScores: broadsheetData.students
            .filter(
              (student) =>
                student.subjectScores.find(
                  (score) => score.subjectId === subject.subjectId
                )?.isOffering
            )
            .map((student) => ({
              studentId: student.studentId,
              componentScores: broadsheetData.assessmentComponents.map(
                (ac) => ({
                  assessmentComponentId: ac.id,
                  score: Number(
                    grid[student.studentId]?.[subject.subjectId]?.[ac.id] || 0
                  ),
                })
              ),
            })),
        })),
    }
    try {
      const res = await submitBroadsheetAsync(payload)
      setStatus("submitted")
      setLastSavedAt(new Date().toLocaleString())
      if (res.submittedSubjectCount > 0 && res.skippedSubjectCount === 0) {
        toast.success(
          res.message ||
            `${res.submittedSubjectCount} subjects submitted for approval.`
        )
      } else if (res.skippedSubjectCount > 0) {
        const skippedList = res.skippedSubjects
          .map((subject) => `${subject.subjectName}: ${subject.reason}`)
          .join("; ")
        toast.warning(`${res.message} ${skippedList}`)
      }
    } catch {
      // Errors are already toasted by useSubmitBroadsheet.
    }
  }

  const handleReset = () => {
    if (broadsheetData) {
      setGrid(createGrid(broadsheetData))
    }
    setComputed(null)
    setStatus("draft")
    toast.message("Unsaved changes cleared")
  }

  const handleExport = () => {
    if (!broadsheetData) return
    const resultMap = new Map(
      computed?.map((row) => [row.studentId, row]) ?? []
    )
    const quote = (value: string | number) =>
      `"${String(value).replaceAll('"', '""')}"`
    const headers = [
      "#",
      "Student",
      "Gender",
      "Admission No",
      ...broadsheetData.subjects.flatMap((subject) => [
        ...broadsheetData.assessmentComponents.map(
          (component) => `${subject.subjectName} ${component.name}`
        ),
        `${subject.subjectName} Total`,
      ]),
      "Overall",
      "Average",
      "Grade",
      "Position",
    ]
    const rows = broadsheetData.students.map((student, index) => {
      const result = resultMap.get(student.studentId)
      const scores = broadsheetData.subjects.flatMap((subject) => {
        const offering = student.subjectScores.find(
          (item) => item.subjectId === subject.subjectId
        )?.isOffering
        if (!offering)
          return [...broadsheetData.assessmentComponents.map(() => "--"), "--"]
        const score = grid[student.studentId]?.[subject.subjectId]
        const values = broadsheetData.assessmentComponents.map(
          (component) => score?.[component.id] ?? ""
        )
        return [
          ...values,
          values.every((value) => value !== "")
            ? values.reduce<number>((sum, value) => sum + Number(value), 0)
            : "",
        ]
      })
      return [
        index + 1,
        student.studentName,
        student.gender,
        student.admissionNumber,
        ...scores,
        result?.total ?? "",
        result?.average ?? "",
        result?.grade ?? "",
        result?.position ?? "",
      ]
    })
    const csv = [headers, ...rows]
      .map((row) => row.map(quote).join(","))
      .join("\r\n")
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" })
    )
    const link = document.createElement("a")
    link.href = url
    link.download = `${broadsheetData.className}-${broadsheetData.termName}-broadsheet.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success("Broadsheet exported")
  }

  const STATUS_STYLE: Record<typeof status, string> = {
    draft: "bg-slate-100 text-slate-700",
    calculated: "bg-sky-50 text-sky-700",
    saved: "bg-amber-50 text-amber-700",
    submitted: "bg-emerald-50 text-emerald-700",
  }

  const STATUS_LABEL: Record<typeof status, string> = {
    draft: "Draft",
    calculated: "Calculated",
    saved: "Progress saved",
    submitted: "Submitted",
  }

  const computedStats = useMemo(() => {
    if (!computed?.length) return null

    const averages = computed.map((row) => row.average)
    return {
      classAvg: Number(
        (
          averages.reduce((sum, average) => sum + average, 0) / averages.length
        ).toFixed(2)
      ),
      highest: Math.max(...averages),
      lowest: Math.min(...averages),
      gradeBands: broadsheetData?.gradingScale?.length ?? 0,
    }
  }, [broadsheetData?.gradingScale?.length, computed])

  const allEligibleScoresEntered = useMemo(() => {
    if (!broadsheetData) return false
    return broadsheetData.students.every((student) =>
      student.subjectScores.every((subject) => {
        if (!subject.isOffering) return true
        const score = grid[student.studentId]?.[subject.subjectId]
        return broadsheetData.assessmentComponents.every(
          (component) =>
            score?.[component.id] !== "" && score?.[component.id] !== undefined
        )
      })
    )
  }, [broadsheetData, grid])

  const canCalculate =
    !!broadsheetData &&
    (broadsheetData.allSubjectsApproved || allEligibleScoresEntered)

  const showLoadingBadge = broadsheetLoading && !broadsheetData

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Broadsheet"
        description="Enter scores across the school's dynamic assessment components."
        badge={showLoadingBadge ? "Loading" : STATUS_LABEL[status]}
        badgeColor={
          showLoadingBadge
            ? "bg-slate-100 text-slate-700"
            : STATUS_STYLE[status]
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="h-9 gap-2"
              onClick={handleReset}
              disabled={!broadsheetData}
              type="button"
            >
              <RotateCcw className="size-4" />
              Clear
            </Button>
            <Button
              variant="outline"
              className="h-9 gap-2"
              onClick={handleExport}
              disabled={!broadsheetData}
              type="button"
            >
              <Download className="size-4" />
              Export
            </Button>
            <Button
              variant="outline"
              className="h-9 gap-2 border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100"
              onClick={handleCalculate}
              disabled={!canCalculate}
              type="button"
            >
              <Calculator className="size-4" />
              Calculate
            </Button>
            <Button
              variant="outline"
              className="h-9 gap-2"
              onClick={handleSaveProgress}
              disabled={busy || !broadsheetData?.canEditAny}
              type="button"
            >
              <Save className="size-4" />
              Save progress
            </Button>
            <Button
              className="h-9 gap-2"
              onClick={handleSubmit}
              disabled={busy || !broadsheetData?.canSubmitAny}
              type="button"
            >
              <Send className="size-4" />
              Submit
            </Button>
          </div>
        }
        stats={
          computedStats
            ? [
                { label: "Class avg", value: computedStats.classAvg },
                { label: "Highest", value: computedStats.highest },
                { label: "Lowest", value: computedStats.lowest },
                { label: "Grade bands", value: computedStats.gradeBands },
              ]
            : [
                {
                  label: "Students",
                  value: broadsheetData?.students.length ?? 0,
                },
                {
                  label: "Subjects",
                  value: broadsheetData?.subjects.length ?? 0,
                },
                {
                  label: "Boxes per subject",
                  value: (broadsheetData?.assessmentComponents.length ?? 0) + 1,
                },
                { label: "Status", value: STATUS_LABEL[status] },
              ]
        }
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="mb-3 text-sm font-semibold text-slate-900">
          How to read one subject
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {(broadsheetData?.assessmentComponents ?? []).map(
            (component, index, components) => (
              <div key={component.id} className="contents">
                <div className="rounded-xl border-2 border-sky-300 bg-sky-50 px-4 py-3 text-center">
                  <p className="font-bold text-sky-900">
                    {index + 1}. {component.name}
                  </p>
                  <p className="mt-1 text-sky-700">
                    Total allowed: {component.weightPercentage}
                  </p>
                  <p className="mt-2 font-semibold text-sky-950">
                    Manual + automated
                  </p>
                </div>
                {index < components.length - 1 && (
                  <span className="text-lg font-bold text-slate-400">+</span>
                )}
              </div>
            )
          )}
          {(broadsheetData?.assessmentComponents.length ?? 0) > 0 && (
            <span className="text-lg font-bold text-slate-400">=</span>
          )}
          <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 px-4 py-3 text-center">
            <p className="font-bold text-emerald-900">Subject total</p>
            <p className="mt-1 text-emerald-700">Calculated automatically</p>
            <p className="mt-2 font-semibold text-emerald-950">
              All components combined
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-600">
          Each coloured subject block is separate. Blue badges are protected
          automated contributions; manual entry adds to them up to that
          component's configured weight.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-500">
          <Table2 className="size-3.5" />
          Class context
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-slate-500">Class</Label>
            <Select
              value={classId}
              onValueChange={setClassId}
              disabled={classesLoading}
            >
              <SelectTrigger className="h-10 w-40 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-500">Term</Label>
            <Select
              value={schoolSessionTermId}
              onValueChange={setSchoolSessionTermId}
              disabled={sessionsLoading}
            >
              <SelectTrigger className="h-10 w-40 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {terms.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-slate-500">Session</Label>
            <Select
              value={sessionId}
              onValueChange={setSessionId}
              disabled={sessionsLoading}
            >
              <SelectTrigger className="h-10 w-40 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sessions.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {lastSavedAt && (
            <p className="ml-auto text-xs text-slate-500">
              Last saved: {lastSavedAt}
            </p>
          )}
        </div>
      </div>

      {broadsheetData ? (
        <BroadsheetTable
          data={broadsheetData}
          grid={grid}
          computed={computed}
          onScoreChange={updateScore}
        />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="py-8 text-center text-sm text-slate-500">
            {broadsheetLoading
              ? "Loading broadsheet data..."
              : "No broadsheet data available for the selected class, term, and session."}
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-600">
        <strong>Remember:</strong> each green subject total combines only that
        subject's configured assessment components. After{" "}
        <strong>Calculate</strong>, the amber overall result combines all
        subjects and applies the school's current grading scale.
      </div>
    </div>
  )
}
