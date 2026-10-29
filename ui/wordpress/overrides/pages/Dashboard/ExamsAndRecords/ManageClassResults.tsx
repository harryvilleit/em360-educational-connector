// WordPress version: saved remarks, CSV/print exports and server-side paging (the gateway caps pages at 200).
import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import type {
  ClassResult,
  CommentData,
  StudentResultDetail,
} from "@/pages/Dashboard/ExamsAndRecords/components/ManageResult/types"
import { StudentDetailView } from "@/pages/Dashboard/ExamsAndRecords/components/ManageResult/StudentDetailView"
import { ResultCommentDialog } from "@/pages/Dashboard/ExamsAndRecords/components/ManageResult/ResultCommentDialog"
import { ClassDetailView } from "@/pages/Dashboard/ExamsAndRecords/components/ManageResult/ClassDetailView"
import { PublishResultsDialog } from "@/pages/Dashboard/ExamsAndRecords/components/ManageResult/PublishResultsDialog"
import { PublishStudentResultDialog } from "@/pages/Dashboard/ExamsAndRecords/components/ManageResult/PublishStudentResultDialog"
import { OverviewView } from "@/pages/Dashboard/ExamsAndRecords/components/ManageResult/OverviewView"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useCurrentAcademicStore } from "@/store/currentAcademic.store"
import {
  useGetAllClasses,
  useGetClassDashboard,
  useGetClassResultDetails,
  useGetStudentResultDetails,
  usePublishClassResult,
  usePublishStudentResult,
} from "@/hooks/examAndRecords"
import { useGetAllSchoolSessions } from "@/hooks/userMgt"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { Button } from "@/components/ui/button"
import { useResultRemarks } from "../../../../exams/hooks"
import { exportClassResults } from "../../../../exams/reports"
import type {
  ClassDashboardResultItemI,
  ClassResultDetailsHeaderI,
  ClassResultStudentItemI,
  StudentResultDetailsValueI,
} from "@/api/examAndRecords.api/types"

type ViewMode = "overview" | "class-detail" | "student-detail"

function normalizeStatus(raw: string | undefined): ClassResult["status"] {
  const s = (raw ?? "").toLowerCase()
  if (
    s === "draft" ||
    s === "submitted" ||
    s === "approved" ||
    s === "published"
  ) {
    return s
  }
  return "draft"
}

function mapDashboardItem(item: ClassDashboardResultItemI): ClassResult {
  return {
    id: item.id,
    classId: item.schoolClassId,
    className: item.className,
    term: item.termName,
    session: item.sessionName,
    totalStudents: item.totalStudents,
    resultsCollected: item.totalStudents,
    status: normalizeStatus(item.status),
  }
}

function mapHeaderToClassResult(
  header: ClassResultDetailsHeaderI
): ClassResult {
  return {
    id: header.classCummaltiveResultId,
    classId: "",
    className: header.className,
    term: header.termName,
    session: header.sessionName,
    totalStudents: header.totalStudents,
    resultsCollected: header.totalStudents,
    status: normalizeStatus(header.status),
  }
}

function mapClassStudentItem(
  item: ClassResultStudentItemI,
  header: ClassResultDetailsHeaderI | undefined
): StudentResultDetail {
  const totalStudents = header?.totalStudents ?? 0
  return {
    studentId: item.studentCummulativeResultId,
    studentName: item.studentName,
    admissionNumber: item.admissionNumber,
    className: header?.className ?? "",
    sessionName: header?.sessionName ?? "",
    termName: header?.termName ?? "",
    position: item.position,
    totalStudents,
    subjects: [],
    totalScore: item.totalScore,
    averageGrade: item.averageScore,
    remark: item.remark || undefined,
    isPublished: item.isPublished,
    status: item.status,
    datePublished: item.datePublished,
  }
}

function mapStudentDetailResult(
  detail: StudentResultDetailsValueI,
  fallbackTotalStudents: number
): StudentResultDetail {
  const breakdownBySubject = new Map(
    detail.performanceBreakdown.map((b) => [b.subjectName, b])
  )

  return {
    studentId: detail.header.studentCummulativeResultId,
    studentName: detail.header.studentName,
    admissionNumber: detail.header.admissionNumber,
    className: detail.header.className,
    sessionName: detail.header.sessionName,
    termName: detail.header.termName,
    position: detail.header.position,
    totalStudents: fallbackTotalStudents,
    subjects: detail.subjectResults.map((sr) => {
      const breakdown = breakdownBySubject.get(sr.subjectName)
      return {
        name: sr.subjectName,
        assessments: sr.assessments.map((a) => ({
          name: a.assessmentName,
          score: a.score,
        })),
        caScore: breakdown?.caScore ?? 0,
        examScore: breakdown?.examScore ?? 0,
        total: sr.totalScore,
        grade: sr.grade,
      }
    }),
    totalScore: detail.header.totalScore,
    averageGrade: detail.header.averageScore,
    remark: detail.teacherRemark || undefined,
    isPublished: detail.header.isPublished,
    status: detail.header.status,
    datePublished: detail.header.datePublished,
  }
}

export default function ManageClassResultsPage() {
  const schoolId = useSchoolId()
  const currentSessionId = useCurrentAcademicStore((s) => s.currentSessionId)
  const currentTermId = useCurrentAcademicStore((s) => s.currentTermId)

  const [selectedClassId, setSelectedClassId] = useState<string>("")
  const [selectedSessionId, setSelectedSessionId] = useState<string>("")
  const [selectedTermId, setSelectedTermId] = useState<string>("")
  // Results are paged on the server (25 per page).
  const [resultsPage, setResultsPage] = useState(1)
  const [studentsPage, setStudentsPage] = useState(1)
  const [exporting, setExporting] = useState(false)

  async function handleExport(resultId: string, print = false) {
    if (exporting) return
    setExporting(true)
    try {
      await exportClassResults(resultId, print)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to export results")
    } finally {
      setExporting(false)
    }
  }

  const [viewMode, setViewMode] = useState<ViewMode>("overview")
  const [selectedResultId, setSelectedResultId] = useState<string>("")
  const [selectedStudentResultId, setSelectedStudentResultId] =
    useState<string>("")
  const [searchStudent, setSearchStudent] = useState<string>("")
  const debouncedSearchStudent = useDebouncedValue(searchStudent, 300)
  // Remarks are saved to the school's records.
  const {
    comments,
    saveRemark,
    saving: savingRemark,
    error: remarksError,
  } = useResultRemarks(schoolId, selectedStudentResultId)

  const [showCommentDialog, setShowCommentDialog] = useState<boolean>(false)
  const [showPublishDialog, setShowPublishDialog] = useState<boolean>(false)
  const [commentText, setCommentText] = useState<string>("")
  const [studentToPublish, setStudentToPublish] =
    useState<StudentResultDetail | null>(null)

  const { sessions } = useGetAllSchoolSessions({ schoolId, pageSize: 200 })
  const { classes } = useGetAllClasses({ schoolId, pageSize: 200 })

  useEffect(() => setResultsPage(1), [selectedClassId, selectedSessionId, selectedTermId])
  useEffect(() => setStudentsPage(1), [selectedResultId, debouncedSearchStudent])

  const classOptions = useMemo(
    () => classes.map((c) => ({ value: c.Id, label: c.ClsName })),
    [classes]
  )
  const sessionOptions = useMemo(
    () => sessions.map((s) => ({ value: s.Id, label: s.SessionName })),
    [sessions]
  )
  const termOptions = useMemo(() => {
    const session = sessions.find((s) => s.Id === selectedSessionId)
    return (session?.Terms ?? []).map((t) => ({
      value: t.Id,
      label: t.TermName,
    }))
  }, [sessions, selectedSessionId])

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

  const handleSessionChange = (sessionId: string) => {
    setSelectedSessionId(sessionId)
    const session = sessions.find((s) => s.Id === sessionId)
    const term = session?.Terms.find((t) => t.IsCurrent) ?? session?.Terms[0]
    setSelectedTermId(term?.Id ?? "")
  }

  const {
    results: dashboardResults,
    pagination: dashboardPagination,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
  } = useGetClassDashboard({
    schoolId,
    classId: selectedClassId || undefined,
    sessionId: selectedSessionId || undefined,
    termId: selectedTermId || undefined,
    pageSize: 25,
    pageNumber: resultsPage,
  })

  const classResults = useMemo(
    () => dashboardResults.map(mapDashboardItem),
    [dashboardResults]
  )

  const {
    pagination: studentsPagination,
    isError: isClassDetailError,
    header: classHeader,
    students: classStudents,
    isLoading: isClassDetailLoading,
  } = useGetClassResultDetails({
    classCummaltiveResultId: selectedResultId,
    search: debouncedSearchStudent,
    pageSize: 25,
    pageNumber: studentsPage,
  })

  const currentResult = useMemo(
    () => (classHeader ? mapHeaderToClassResult(classHeader) : undefined),
    [classHeader]
  )
  const filteredStudents = useMemo(
    () =>
      classStudents.map((s) => mapClassStudentItem(s, classHeader)),
    [classStudents, classHeader]
  )

  const { result: studentDetailResult, isLoading: isStudentDetailLoading } =
    useGetStudentResultDetails(selectedStudentResultId)

  const student = useMemo(
    () =>
      studentDetailResult
        ? mapStudentDetailResult(
            studentDetailResult,
            classHeader?.totalStudents ?? 0
          )
        : undefined,
    [studentDetailResult, classHeader]
  )

  const { publishClassResultAsync, isPending: isPublishing } =
    usePublishClassResult({
      onSuccess: () => {
        setShowPublishDialog(false)
        setViewMode("overview")
      },
    })

  const { publishStudentResultAsync, isPending: isPublishingStudent } =
    usePublishStudentResult({
      onSuccess: () => setStudentToPublish(null),
    })

  const publishingStudentResultId = isPublishingStudent
    ? (studentToPublish?.studentId ?? null)
    : null

  const handleViewClassResults = (resultId: string) => {
    setSelectedResultId(resultId)
    setSearchStudent("")
    setViewMode("class-detail")
  }

  const handleViewStudentResult = (resultId: string) => {
    setSelectedStudentResultId(resultId)
    setViewMode("student-detail")
  }

  const handleOpenAddRemark = (resultId: string) => {
    setSelectedStudentResultId(resultId)
    setShowCommentDialog(true)
  }

  const handleAddComment = async () => {
    if (!commentText.trim() || savingRemark) return
    try {
      await saveRemark(commentText)
      setCommentText("")
      setShowCommentDialog(false)
      toast.success("Remark saved")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save remark")
    }
  }

  const handlePublishResults = async () => {
    if (!selectedResultId) return
    try {
      await publishClassResultAsync(selectedResultId)
    } catch {}
  }

  const handlePublishStudentClick = (targetStudent: StudentResultDetail) => {
    setStudentToPublish(targetStudent)
  }

  const handleConfirmPublishStudent = async () => {
    if (!studentToPublish) return
    try {
      await publishStudentResultAsync(studentToPublish.studentId)
    } catch {}
  }

  const handleBackToOverview = () => {
    setViewMode("overview")
    setSelectedResultId("")
    setSearchStudent("")
  }

  const handleBackToClassDetail = () => {
    setViewMode("class-detail")
    setSelectedStudentResultId("")
  }

  if (viewMode === "student-detail" && selectedStudentResultId) {
    if (isStudentDetailLoading) {
      return (
        <div className="flex h-64 items-center justify-center gap-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading student result...</span>
        </div>
      )
    }
    if (!student) return <div>Student not found</div>

    return (
      <>
        {remarksError && (
          <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-red-800">
            Unable to load remarks: {remarksError.message}
          </p>
        )}
        <StudentDetailView
          student={student}
          comments={comments}
          onBack={handleBackToClassDetail}
          onAddRemark={() => setShowCommentDialog(true)}
          onPublishStudent={() => handlePublishStudentClick(student)}
          isPublishing={publishingStudentResultId === student.studentId}
        />
        <ResultCommentDialog
          open={showCommentDialog}
          onOpenChange={setShowCommentDialog}
          commentText={commentText}
          onCommentChange={setCommentText}
          onSubmit={handleAddComment}
          isPending={savingRemark}
        />
        <PublishStudentResultDialog
          open={!!studentToPublish}
          onOpenChange={(open) => !open && setStudentToPublish(null)}
          studentName={studentToPublish?.studentName}
          isLoading={isPublishingStudent}
          onPublish={handleConfirmPublishStudent}
        />
      </>
    )
  }

  if (viewMode === "class-detail" && selectedResultId) {
    if (isClassDetailLoading) {
      return (
        <div className="flex h-64 items-center justify-center gap-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading class results...</span>
        </div>
      )
    }

    return (
      <>
        {isClassDetailError && <p role="alert">Unable to load class results. Please try again.</p>}
        <ClassDetailView
          exporting={exporting}
          onExport={() => {
            void handleExport(selectedResultId)
          }}
          currentResult={currentResult}
          filteredStudents={filteredStudents}
          searchStudent={searchStudent}
          onSearchChange={setSearchStudent}
          onBack={handleBackToOverview}
          onViewStudent={handleViewStudentResult}
          onAddRemark={handleOpenAddRemark}
          onPublishClick={() => setShowPublishDialog(true)}
          onPublishStudent={handlePublishStudentClick}
          publishingStudentResultId={publishingStudentResultId}
        />
        <ResultPages page={studentsPage} total={studentsPagination?.totalPages ?? 1} onChange={setStudentsPage} />
        <ResultCommentDialog
          open={showCommentDialog}
          onOpenChange={setShowCommentDialog}
          commentText={commentText}
          onCommentChange={setCommentText}
          onSubmit={handleAddComment}
          isPending={savingRemark}
        />
        <PublishResultsDialog
          open={showPublishDialog}
          onOpenChange={setShowPublishDialog}
          currentResult={currentResult}
          isLoading={isPublishing}
          onPublish={handlePublishResults}
        />
        <PublishStudentResultDialog
          open={!!studentToPublish}
          onOpenChange={(open) => !open && setStudentToPublish(null)}
          studentName={studentToPublish?.studentName}
          isLoading={isPublishingStudent}
          onPublish={handleConfirmPublishStudent}
        />
      </>
    )
  }

  if (isDashboardLoading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Loading class results dashboard...</span>
      </div>
    )
  }

  return (
    <>
      {isDashboardError && <p role="alert">Unable to load results. Please try again.</p>}
      <OverviewView
      onExport={(resultId, print) => {
        void handleExport(resultId, print)
      }}
      exporting={exporting}
      classResults={classResults}
      classOptions={classOptions}
      sessionOptions={sessionOptions}
      termOptions={termOptions}
      selectedClass={selectedClassId}
      selectedSession={selectedSessionId}
      selectedTerm={selectedTermId}
      onClassChange={setSelectedClassId}
      onSessionChange={handleSessionChange}
      onTermChange={setSelectedTermId}
      onViewClassResults={handleViewClassResults}
    />
      <ResultPages page={resultsPage} total={dashboardPagination?.totalPages ?? 1} onChange={setResultsPage} />
    </>
  )
}

function ResultPages({ page, total, onChange }: { page: number; total: number; onChange: (page: number) => void }) {
  if (total <= 1) return null
  return (
    <nav aria-label="Result pages" className="mt-4 flex items-center justify-end gap-3">
      <Button variant="outline" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </Button>
      <span>
        Page {page} of {total}
      </span>
      <Button variant="outline" disabled={page >= total} onClick={() => onChange(page + 1)}>
        Next
      </Button>
    </nav>
  )
}
