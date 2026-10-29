// WordPress version: eligible students are paged (50 at a time).
import { useEffect, useState } from "react"
import { useParams } from "react-router"
import { toast } from "sonner"
import { PageHeader } from "@/components/general/PageHeader"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetAllClasses, useGetClassArms } from "@/hooks/examAndRecords"
import { useGetAllSchoolSessions } from "@/hooks/userMgt"
import {
  useGetStudentsForPromotion,
  usePromoteStudents,
} from "@/hooks/studentPortal"
import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { useCurrentAcademicStore } from "@/store/currentAcademic.store"
import { PromoteConfirmModal } from "@/pages/Dashboard/ExamsAndRecords/components/PromoteConfirmModal"
import { SourcePromotionStep } from "@/pages/Dashboard/ExamsAndRecords/components/SourcePromotionStep"
import { StudentSelectionStep } from "@/pages/Dashboard/ExamsAndRecords/components/StudentSelectionStep"
import { DestinationPromotionStep } from "@/pages/Dashboard/ExamsAndRecords/components/DestinationPromotionStep"
import { PromotionStudentTable } from "@/pages/Dashboard/ExamsAndRecords/components/PromotionStudentTable"
import { PromotionActionBar } from "@/pages/Dashboard/ExamsAndRecords/components/PromotionActionBar"

export default function PromoteStudentsPage() {
  const schoolId = useSchoolId()
  const { productId } = useParams<{ productId: string }>()

  const { classes } = useGetAllClasses({ schoolId, pageSize: 200 })
  const { sessions, isLoading: sessionsLoading } = useGetAllSchoolSessions({
    schoolId,
    pageSize: 100,
  })
  const currentSessionId = useCurrentAcademicStore((s) => s.currentSessionId)

  const defaultSession =
    sessions.find((s) => s.Id === currentSessionId) ??
    sessions.find((s) => s.IsCurrent || s.Status === "Active")
  const defaultTerm = defaultSession?.Terms.find((t) => t.IsCurrent)

  const [sourceSessionId, setSourceSessionId] = useState("")
  const [sourceTermId, setSourceTermId] = useState("")
  const [sourceClassId, setSourceClassId] = useState("")
  const [sourceArmId, setSourceArmId] = useState("")
  const [studentSearch, setStudentSearch] = useState("")
  const [targetSessionId, setTargetSessionId] = useState("")
  const [targetTermId, setTargetTermId] = useState("")
  const [targetClassId, setTargetClassId] = useState("")
  const [targetArmId, setTargetArmId] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    if (sourceSessionId || !defaultSession) return
    setSourceSessionId(defaultSession.Id)
    setSourceTermId(defaultTerm?.Id ?? "")
  }, [sourceSessionId, defaultSession, defaultTerm])

  const { classArms: sourceArms } = useGetClassArms(sourceClassId)
  const { classArms: targetArms } = useGetClassArms(targetClassId)

  const sourceClass = classes.find((c) => c.Id === sourceClassId)
  const targetClass = classes.find((c) => c.Id === targetClassId)
  const sourceArm = sourceArms.find((a) => a.Id === sourceArmId)
  const targetArm = targetArms.find((a) => a.Id === targetArmId)
  const sourceSession = sessions.find((s) => s.Id === sourceSessionId)
  const sourceTerm = sourceSession?.Terms.find((t) => t.Id === sourceTermId)
  const targetSession = sessions.find((s) => s.Id === targetSessionId)
  const targetTerm = targetSession?.Terms.find((t) => t.Id === targetTermId)

  const needsTargetArm = targetArms.length > 0 && !targetArmId

  const debouncedSearch = useDebouncedValue(studentSearch, 300)
  const [studentPage, setStudentPage] = useState(1)
  useEffect(
    () => setStudentPage(1),
    [sourceSessionId, sourceTermId, sourceClassId, sourceArmId, debouncedSearch],
  )

  const {
    students: eligibleStudents,
    pagination: studentPagination,
    isLoading: studentsLoading,
  } = useGetStudentsForPromotion({
      schoolId,
      sessionId: sourceSessionId || undefined,
      termId: sourceTermId || undefined,
      classId: sourceClassId,
      armId: sourceArmId || undefined,
      search: debouncedSearch || undefined,
      pageNumber: studentPage,
      pageSize: 50,
    })

  function handleSourceSessionChange(value: string) {
    setSourceSessionId(value)
    setSourceTermId("")
    setSelectedIds(new Set())
    setStudentSearch("")
  }

  function handleSourceTermChange(value: string) {
    setSourceTermId(value)
    setSelectedIds(new Set())
    setStudentSearch("")
  }

  function handleSourceClassChange(value: string) {
    setSourceClassId(value)
    setSourceArmId("")
    setSelectedIds(new Set())
    setStudentSearch("")
  }

  function handleSourceArmChange(value: string) {
    setSourceArmId(value)
    setSelectedIds(new Set())
  }

  function handleTargetSessionChange(value: string) {
    setTargetSessionId(value)
    setTargetTermId("")
  }

  function handleTargetClassChange(value: string) {
    setTargetClassId(value)
    setTargetArmId("")
  }

  function toggleStudent(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAllVisible() {
    const allVisibleSelected =
      eligibleStudents.length > 0 &&
      eligibleStudents.every((s) => selectedIds.has(s.studentId))
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allVisibleSelected) {
        eligibleStudents.forEach((s) => next.delete(s.studentId))
      } else {
        eligibleStudents.forEach((s) => next.add(s.studentId))
      }
      return next
    })
  }

  const { promoteStudents, isPending } = usePromoteStudents({
    onSuccess: () => {
      setSelectedIds(new Set())
      setConfirmOpen(false)
    },
  })

  const sameAsSource =
    !!targetSessionId &&
    !!targetTermId &&
    !!targetClassId &&
    targetSessionId === sourceSessionId &&
    targetTermId === sourceTermId &&
    targetClassId === sourceClassId &&
    targetArmId === sourceArmId

  const canPromote =
    !!sourceSessionId &&
    !!sourceTermId &&
    !!sourceClassId &&
    selectedIds.size > 0 &&
    !!targetClassId &&
    !needsTargetArm &&
    !!targetSessionId &&
    !!targetTermId &&
    !sameAsSource

  function handlePromoteClick() {
    if (!sourceSessionId || !sourceTermId) {
      toast.error("Select a source session and term")
      return
    }
    if (!sourceClassId) {
      toast.error("Select a source class")
      return
    }
    if (selectedIds.size === 0) {
      toast.error("Select at least one student to promote")
      return
    }
    if (!targetSessionId || !targetTermId) {
      toast.error("Select a destination session and term")
      return
    }
    if (!targetClassId) {
      toast.error("Select a destination class")
      return
    }
    if (needsTargetArm) {
      toast.error("Select a destination arm")
      return
    }
    if (sameAsSource) {
      toast.error(
        "Please select a different session, term, or class. The destination cannot be the same as the student's current enrollment."
      )
      return
    }
    setConfirmOpen(true)
  }

  async function handleConfirmPromote() {
    if (!targetSessionId || !targetTermId) return
    if (!sourceSessionId || !sourceTermId) return
    await promoteStudents({
      studentIds: Array.from(selectedIds),
      schoolId,
      sourceSessionId,
      sourceTermId,
      sourceClassId,
      targetSchoolClassId: targetClassId,
      targetSchoolArmId: targetArmId || undefined,
      targetSchoolSessionId: targetSessionId,
      targetSchoolSessionTermId: targetTermId,
      invoiceDueDate: targetTerm?.EndDate,
    })
  }

  const columns = PromotionStudentTable({
    eligibleStudents,
    selectedIds,
    onToggleStudent: toggleStudent,
    onToggleAllVisible: toggleAllVisible,
  })

  if (!sessionsLoading && sessions.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Promote Students"
          description="Move a student, or all students in a class, into a new class."
        />
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-800">
          No academic session is configured for this school yet. Set up a
          session and term before promoting students.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Promote Students"
        description="Move a student, or all students in a class, into a new class."
      />

      <div className="grid grid-cols-[auto_1fr] gap-x-4">
        <SourcePromotionStep
          sessions={sessions}
          classes={classes}
          sourceSessionId={sourceSessionId}
          sourceTermId={sourceTermId}
          sourceClassId={sourceClassId}
          sourceArmId={sourceArmId}
          sourceArms={sourceArms}
          sourceSession={sourceSession}
          onSessionChange={handleSourceSessionChange}
          onTermChange={handleSourceTermChange}
          onClassChange={handleSourceClassChange}
          onArmChange={handleSourceArmChange}
        />

        <StudentSelectionStep
          pageNumber={studentPage}
          totalPages={studentPagination.totalPages}
          onPageChange={setStudentPage}
          selectedIds={selectedIds}
          eligibleStudents={eligibleStudents}
          studentsLoading={studentsLoading}
          sourceClassId={sourceClassId}
          studentSearch={studentSearch}
          columns={columns}
          onStudentSearchChange={setStudentSearch}
        />

        <DestinationPromotionStep
          sessions={sessions}
          classes={classes}
          targetSessionId={targetSessionId}
          targetTermId={targetTermId}
          targetClassId={targetClassId}
          targetArmId={targetArmId}
          targetArms={targetArms}
          targetSession={targetSession}
          onSessionChange={handleTargetSessionChange}
          onTermChange={setTargetTermId}
          onClassChange={handleTargetClassChange}
          onArmChange={setTargetArmId}
        />
      </div>

      <PromotionActionBar
        selectedIdsSize={selectedIds.size}
        sourceClassName={sourceClass?.ClsName}
        sourceArmName={sourceArm?.ArmName}
        targetClassName={targetClass?.ClsName}
        targetArmName={targetArm?.ArmName}
        productId={productId}
        isPending={isPending}
        canPromote={canPromote}
        onPromote={handlePromoteClick}
      />

      {confirmOpen && (
        <PromoteConfirmModal
          open={confirmOpen}
          studentCount={selectedIds.size}
          fromClass={`${sourceClass?.ClsName ?? ""}${sourceArm ? ` ${sourceArm.ArmName}` : ""}`}
          fromMeta={`${sourceSession?.SessionName ?? ""} · ${sourceTerm?.TermName ?? ""}`}
          toClass={`${targetClass?.ClsName ?? ""}${targetArm ? ` ${targetArm.ArmName}` : ""}`}
          toMeta={`${targetSession?.SessionName ?? ""} · ${targetTerm?.TermName ?? ""}`}
          isPending={isPending}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={handleConfirmPromote}
        />
      )}
    </div>
  )
}
