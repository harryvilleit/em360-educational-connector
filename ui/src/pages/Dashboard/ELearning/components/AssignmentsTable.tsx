import { useState } from "react"
import { CheckCircle2, Eye, Pencil, Trash2 } from "lucide-react"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import {
  useTeacherCourseAssignmentAiGrading,
  useTeacherCourseAssignmentBulkFinalization,
  useTeacherCourseAssignmentFinalization,
  useTeacherCourseAssignmentReview,
  useTeacherCoursePaperSubmissions,
  useTeacherCourseVoiceTranscription,
} from "@/hooks/elearning/useTeacherCourseWorkspace"
import type { TeacherCourseRefI } from "@/api/teacherCourse.api"
import type { ELearningAssignment } from "@/types/elearning"
import AssignmentViewModal from "./AssignmentViewModal"

const statusStyles = {
  draft: "bg-amber-50 text-amber-700",
  approved: "bg-green-50 text-green-700",
  closed: "bg-gray-100 text-gray-700",
  open: "bg-green-50 text-green-700",
  graded: "bg-blue-50 text-blue-700",
}

function formatDueDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

interface AssignmentsTableProps {
  assignments: ELearningAssignment[]
  courseRef?: TeacherCourseRefI
  compact?: boolean
  onEdit?: (assignment: ELearningAssignment) => void
  onApprove?: (assignmentId: string) => void | Promise<unknown>
  onDelete?: (assignmentId: string) => void | Promise<unknown>
  onReopen?: (
    assignmentId: string,
    attemptId: string
  ) => void | Promise<unknown>
  isApproving?: boolean
  isDeleting?: boolean
  isReopening?: boolean
  readOnly?: boolean
}

export default function AssignmentsTable({
  assignments,
  courseRef,
  compact,
  onEdit,
  onApprove,
  onDelete,
  onReopen,
  isApproving = false,
  isDeleting = false,
  isReopening = false,
  readOnly = false,
}: AssignmentsTableProps) {
  const [viewAssignment, setViewAssignment] =
    useState<ELearningAssignment | null>(null)
  const reviewQuery = useTeacherCourseAssignmentReview(
    courseRef,
    viewAssignment?.id,
    Boolean(viewAssignment)
  )
  const aiGrading = useTeacherCourseAssignmentAiGrading(courseRef)
  const finalization = useTeacherCourseAssignmentFinalization(courseRef)
  const bulkFinalization =
    useTeacherCourseAssignmentBulkFinalization(courseRef)
  const voiceTranscription = useTeacherCourseVoiceTranscription(courseRef)
  const paperSubmissions = useTeacherCoursePaperSubmissions(courseRef)

  const columns: DataTableColumn<ELearningAssignment>[] = [
    {
      key: "title",
      header: "Assignment",
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.title}</p>
          {!compact && (
            <p className="text-xs text-muted-foreground">
              {row.subject} · {row.className}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "type",
      header: "CBT Type",
      render: (row) => (
        <div className="text-sm">
          <p className="font-medium capitalize">
            {row.assignmentType === "voice"
              ? "Voice answers"
              : row.assignmentType === "visual"
                ? "Handwriting / visual"
                : "Objective"}
          </p>
          <p className="text-xs text-muted-foreground capitalize">
            {(row.answerMode ?? "single_choice").replaceAll("_", " ")}
          </p>
        </div>
      ),
    },
    {
      key: "dueDate",
      header: "Due Date",
      render: (row) => (
        <span className="text-sm">{formatDueDate(row.dueDate)}</span>
      ),
    },
    {
      key: "submissions",
      header: "Submissions",
      render: (row) => (
        <span className="text-sm">
          {row.submissions}/{row.totalStudents}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${statusStyles[row.status]}`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex flex-wrap justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={() => setViewAssignment(row)}
          >
            <Eye className="size-3.5" /> View
          </Button>
          {(row.status === "draft" || row.status === "approved") && onEdit && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              onClick={() => onEdit(row)}
            >
              <Pencil className="size-3.5" /> Edit
            </Button>
          )}
          {row.status === "draft" && onApprove && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-green-700"
              disabled={isApproving}
              onClick={() => void onApprove(row.id)}
            >
              <CheckCircle2 className="size-3.5" /> Approve
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-red-600"
              disabled={isDeleting}
              onClick={() => {
                if (
                  window.confirm(
                    `Delete “${row.title}”? It will be removed from students but its audit data remains in the database.`
                  )
                ) {
                  void onDelete(row.id)
                }
              }}
            >
              <Trash2 className="size-3.5" /> Delete
            </Button>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={assignments}
        getRowKey={(row) => row.id}
        emptyState={
          <div className="py-12 text-center text-sm text-muted-foreground">
            No assignments created yet
          </div>
        }
      />

      <AssignmentViewModal
        key={viewAssignment?.id ?? "no-assignment"}
        assignment={viewAssignment}
        review={reviewQuery.data?.value}
        open={!!viewAssignment}
        isLoading={reviewQuery.isLoading}
        isReopening={isReopening}
        isAiGrading={aiGrading.isAiGrading}
        gradingAttemptId={aiGrading.gradingAttemptId}
        isTranscribing={voiceTranscription.isTranscribing}
        transcribingAnswerId={voiceTranscription.transcribingAnswerId}
        isFinalizing={finalization.isFinalizing}
        finalizingAttemptId={finalization.finalizingAttemptId}
        isBulkFinalizing={bulkFinalization.isBulkFinalizing}
        isBulkAiGrading={aiGrading.isBulkAiGrading}
        isUploadingPapers={paperSubmissions.isUploadingPapers}
        isConfirmingPaper={paperSubmissions.isConfirmingPaper}
        confirmingPaperSubmissionId={paperSubmissions.confirmingPaperSubmissionId}
        onClose={() => setViewAssignment(null)}
        onReopen={
          viewAssignment && onReopen
            ? (attemptId) => onReopen(viewAssignment.id, attemptId)
            : undefined
        }
        onAiGrade={
          !readOnly && viewAssignment && courseRef
            ? (attemptId) =>
                aiGrading.aiGradeAttemptAsync({
                  assignmentId: viewAssignment.id,
                  attemptId,
                })
            : undefined
        }
        onTranscribe={
          !readOnly && viewAssignment && courseRef
            ? (attemptId, answerId) =>
                voiceTranscription.transcribeVoiceAnswerAsync({
                  assignmentId: viewAssignment.id,
                  attemptId,
                  answerId,
                })
            : undefined
        }
        onFinalize={
          !readOnly && viewAssignment && courseRef
            ? (attemptId, answers) =>
                finalization.finalizeGradeAsync({
                  assignmentId: viewAssignment.id,
                  attemptId,
                  answers,
                })
            : undefined
        }
        onBulkFinalize={
          !readOnly && viewAssignment && courseRef
            ? () =>
                bulkFinalization.bulkFinalizeGradesAsync(viewAssignment.id)
            : undefined
        }
        onBulkAiGrade={
          !readOnly && viewAssignment && courseRef
            ? (attemptIds) =>
                aiGrading.aiGradeAllAsync({
                  assignmentId: viewAssignment.id,
                  attemptIds,
                })
            : undefined
        }
        onUploadPapers={
          !readOnly && viewAssignment && courseRef
            ? (scripts) =>
                paperSubmissions.uploadPaperSubmissionsAsync({
                  assignmentId: viewAssignment.id,
                  scripts,
                })
            : undefined
        }
        onConfirmPaper={
          !readOnly && viewAssignment && courseRef
            ? (paperSubmissionId, studentId) =>
                paperSubmissions.confirmPaperSubmissionAsync({
                  assignmentId: viewAssignment.id,
                  paperSubmissionId,
                  studentId,
                })
            : undefined
        }
      />
    </>
  )
}
