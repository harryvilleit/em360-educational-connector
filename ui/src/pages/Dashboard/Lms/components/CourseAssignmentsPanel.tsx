import { useMemo, useState } from "react"
import { getErrorMessage } from "@/utils"
import { useNavigate, useParams } from "react-router"
import { ArrowLeft, CheckCircle2, ClipboardList, GraduationCap, Inbox, Pencil, Plus, Send, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { dashboardCardSurface } from "@/components/general/StatCard"
import { DashboardRoutes } from "@/routes"
import {
  getCourseAssignmentWeightTotal,
  isCourseWeightComplete,
  weightedContribution,
} from "@/lib/lms-assignment-weights"
import {
  getAssignmentTypeLabel,
  getSubmissionStatusStyle,
  scoreTone,
} from "@/lib/lms-assignment-display"
import type { LmsAssignment, LmsCourse } from "@/types/elearning"
import SubmissionDetailModal, { type SubmissionListRow } from "./SubmissionDetailModal"
import GradeSubmissionModal from "./GradeSubmissionModal"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  useAssignmentActions,
  useCourseAssignmentPlan,
  useCourseAssignments,
  useCourseGrades,
  useMyCourseGrade,
} from "@/hooks/assignment"
import { isElearningApiId } from "@/lib/elearning-ids"

type CourseAssignmentsPanelProps = {
  course: LmsCourse
  isTutor: boolean
}

type AssignmentTab = "created" | "submitted" | "results"

function toSubmissionRows(assignment: LmsAssignment): SubmissionListRow[] {
  return assignment.submissions
    .map((submission) => ({
      ...submission,
      assignmentTitle: assignment.title,
      courseTitle: assignment.courseTitle,
      assignmentType: assignment.type,
      assignmentWeightPercent: assignment.weightPercent,
    }))
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
}

export default function CourseAssignmentsPanel({
  course,
  isTutor,
}: CourseAssignmentsPanelProps) {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const assignmentQuery = useCourseAssignments(course.id, isElearningApiId(course.id))
  const planQuery = useCourseAssignmentPlan(course.id, isElearningApiId(course.id))
  const gradeQuery = useMyCourseGrade(
    course.id,
    isElearningApiId(course.id) && !isTutor
  )
  const courseGradesQuery = useCourseGrades(
    course.id,
    isElearningApiId(course.id) && isTutor
  )
  const assignmentActions = useAssignmentActions()
  const assignments = assignmentQuery.assignments

  const [tab, setTab] = useState<AssignmentTab>("created")
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionListRow | null>(
    null
  )
  const [gradingSubmission, setGradingSubmission] = useState<SubmissionListRow | null>(
    null
  )

  const courseAssignments = useMemo(
    () => assignments.filter((a) => a.courseId === course.id),
    [assignments, course.id]
  )
  const localWeightTotal = useMemo(
    () => getCourseAssignmentWeightTotal(assignments, course.id),
    [assignments, course.id]
  )
  const weightTotal = planQuery.plan?.allocatedWeightPercent ?? localWeightTotal
  const weightComplete = planQuery.plan?.isComplete
    ?? isCourseWeightComplete(assignments, course.id)
  const planPublished = planQuery.plan?.isPublished
    ?? (courseAssignments.length > 0 && courseAssignments.every((item) => item.status !== "draft"))

  const selectedAssignment = selectedAssignmentId
    ? courseAssignments.find((a) => a.id === selectedAssignmentId)
    : undefined

  const assignmentSubmissions = useMemo(
    () => (selectedAssignment ? toSubmissionRows(selectedAssignment) : []),
    [selectedAssignment]
  )

  const totalSubmissions = useMemo(
    () => courseAssignments.reduce((sum, a) => sum + a.submissions.length, 0),
    [courseAssignments]
  )
  const pendingCount = useMemo(
    () =>
      courseAssignments.reduce(
        (sum, a) => sum + a.submissions.filter(
          (s) => s.status === "submitted" || s.status === "pending_approval"
        ).length,
        0
      ),
    [courseAssignments]
  )

  const openAssignmentSubmissions = (assignmentId: string) => {
    setSelectedAssignmentId(assignmentId)
    setTab("submitted")
  }

  const closeAssignmentSubmissions = () => {
    setSelectedAssignmentId(null)
  }

  const createdColumns: DataTableColumn<LmsAssignment>[] = [
    { key: "title", header: "Title", render: (r) => r.title },
    {
      key: "type",
      header: "Type",
      render: (r) => getAssignmentTypeLabel(r.type),
    },
    {
      key: "weight",
      header: "Weight",
      render: (r) => (
        <span className="tabular-nums font-medium">{r.weightPercent ?? 0}%</span>
      ),
    },
    { key: "due", header: "Due", render: (r) => r.dueDate },
    {
      key: "submissions",
      header: "Submitted",
      render: (r) => (
        <button
          type="button"
          className="text-sm font-medium text-blue-600 hover:underline"
          onClick={(e) => {
            e.stopPropagation()
            openAssignmentSubmissions(r.id)
          }}
        >
          {r.submissions.length}/{r.totalStudents}
        </button>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs capitalize text-blue-700">
          {r.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              openAssignmentSubmissions(r.id)
            }}
          >
            Submissions
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              navigate(
                DashboardRoutes.toLmsEditCourseAssignment(
                  productId ?? "",
                  course.id,
                  r.id
                )
              )
            }}
          >
            <Pencil className="size-3.5" />
            Edit
          </Button>
          {r.submissions.length === 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={async (e) => {
                e.stopPropagation()
                if (!window.confirm(`Delete "${r.title}"? The grading plan will need to total 100% again.`)) return
                try {
                  await assignmentActions.remove.mutateAsync(r.id)
                  toast.success("Assignment deleted")
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Unable to delete assignment")
                }
              }}
            >
              <Trash2 className="size-3.5" />
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ]

  const submittedColumns: DataTableColumn<SubmissionListRow>[] = [
    {
      key: "student",
      header: "Student",
      render: (row) => (
        <button
          type="button"
          className="text-left font-medium text-gray-900 hover:text-blue-600 hover:underline"
          onClick={() => setSelectedSubmission(row)}
        >
          {row.studentName}
        </button>
      ),
    },
    { key: "date", header: "Submitted", render: (r) => r.submittedAt },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${getSubmissionStatusStyle(r.status)}`}
        >
          {r.status.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      key: "score",
      header: `Grade (of ${selectedAssignment?.weightPercent ?? 0}%)`,
      render: (r) => {
        const weight = r.assignmentWeightPercent ?? selectedAssignment?.weightPercent ?? 0
        if (r.score == null || r.status !== "graded") {
          return <span className="text-sm text-muted-foreground">Pending</span>
        }
        const earned = weightedContribution(r.score, weight)
        return (
          <div className="flex flex-col gap-0.5">
            <span
              className={`inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${scoreTone(r.score)}`}
            >
              {earned.toFixed(1)} / {weight}
            </span>
            <span className="text-xs tabular-nums text-muted-foreground">
              {Math.round(r.score)}% on assignment
            </span>
          </div>
        )
      },
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => setSelectedSubmission(row)}>
            View
          </Button>
          {row.assignmentType === "cbt" && row.status === "submitted" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                try {
                  await assignmentActions.autoGrade.mutateAsync({
                    assignmentId: row.assignmentId,
                    submissionId: row.id,
                  })
                  toast.success(`Automated score prepared for ${row.studentName}; review and approve it.`)
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Unable to auto-grade submission")
                }
              }}
            >
              Auto-grade
            </Button>
          )}
          {row.status === "pending_approval" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                try {
                  await assignmentActions.approve.mutateAsync({
                    assignmentId: row.assignmentId,
                    submissionId: row.id,
                  })
                  toast.success(`Grade approved for ${row.studentName}`)
                } catch (error) {
                  toast.error(error instanceof Error ? error.message : "Unable to approve grade")
                }
              }}
            >
              <CheckCircle2 className="size-3.5" />
              Approve
            </Button>
          )}
          {row.status !== "graded" ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setGradingSubmission(row)}
            >
              Grade
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setGradingSubmission(row)}
            >
              Edit grade
            </Button>
          )}
        </div>
      ),
    },
  ]

  const assignmentPickerColumns: DataTableColumn<LmsAssignment>[] = [
    { key: "title", header: "Assignment", render: (r) => r.title },
    {
      key: "weight",
      header: "Weight",
      render: (r) => (
        <span className="tabular-nums font-medium">{r.weightPercent ?? 0}%</span>
      ),
    },
    {
      key: "submissions",
      header: "Submissions",
      render: (r) => {
        const pending = r.submissions.filter((s) => s.status === "submitted").length
        return (
          <span className="text-sm tabular-nums">
            {r.submissions.length}
            {pending > 0 && (
              <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-800">
                {pending} pending
              </span>
            )}
          </span>
        )
      },
    },
  ]

  const resultColumns: DataTableColumn<(typeof courseGradesQuery.results)[number]>[] = [
    {
      key: "learner",
      header: "Learner",
      render: (row) => row.email || row.userId,
    },
    {
      key: "progress",
      header: "Approved",
      render: (row) => `${row.gradedAssignmentCount}/${row.assignmentCount}`,
    },
    {
      key: "score",
      header: "Course score",
      render: (row) => (
        <span className="font-semibold tabular-nums">{row.earnedScorePercent.toFixed(2)} / 100</span>
      ),
    },
    {
      key: "outcome",
      header: "Outcome",
      render: (row) => !row.isComplete ? (
        <span className="text-muted-foreground">In progress</span>
      ) : (
        <span className={row.hasPassed ? "font-medium text-green-700" : "font-medium text-red-700"}>
          {row.hasPassed ? "Passed" : "Not passed"}
        </span>
      ),
    },
  ]

  return (
    <>
      {assignmentQuery.isError && (
        <p className="mb-3 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {getErrorMessage(assignmentQuery.error, "Could not load assignments.")}
        </p>
      )}
      <div className={dashboardCardSurface}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
          <div>
            <h3 className="font-semibold">Course assignments</h3>
            <p className="text-xs text-muted-foreground">
              Course total 100% · pass score {planQuery.plan?.passScorePercent ?? course.passScorePercent ?? 50}%
            </p>
          </div>
          {isTutor && (
            <div className="flex flex-wrap gap-2">
              {!planPublished && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 rounded-md"
                  disabled={!weightComplete || assignmentActions.publishPlan.isPending}
                  onClick={async () => {
                    try {
                      await assignmentActions.publishPlan.mutateAsync(course.id)
                      toast.success("The 100% assignment plan is now visible to learners")
                    } catch (error) {
                      toast.error(error instanceof Error ? error.message : "Unable to publish assignment plan")
                    }
                  }}
                >
                  <Send className="size-3.5" />
                  Publish 100% plan
                </Button>
              )}
              <Button
                size="sm"
                className="h-8 rounded-md"
                onClick={() =>
                  navigate(
                    DashboardRoutes.toLmsCreateCourseAssignment(productId ?? "", course.id)
                  )
                }
              >
                <Plus className="size-3.5" />
                Create assignment
              </Button>
            </div>
          )}
        </div>

        {isTutor && (
          <div
            className={cn(
              "mx-5 mt-4 rounded-lg border px-4 py-3 text-sm",
              weightComplete
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-amber-200 bg-amber-50 text-amber-900"
            )}
          >
            Course grade weights:{" "}
            <span className="font-semibold tabular-nums">{weightTotal}%</span> allocated
            {weightComplete ? (
              <span>
                {planPublished
                  ? " · 100% plan published to learners"
                  : " · complete; publish the plan to make assignments visible"}
              </span>
            ) : (
              <span>
                {" "}
                ·{" "}
                <span className="font-semibold tabular-nums">
                  {100 - weightTotal}%
                </span>{" "}
                remaining to reach 100%
              </span>
            )}
          </div>
        )}

        {!isTutor && gradeQuery.result && (
          <div className="mx-5 mt-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            <span className="font-semibold tabular-nums">
              {gradeQuery.result.earnedScorePercent.toFixed(2)} / 100
            </span>{" "}
            course points · {gradeQuery.result.gradedAssignmentCount}/
            {gradeQuery.result.assignmentCount} assignments approved
            {gradeQuery.result.isComplete && (
              <span className={gradeQuery.result.hasPassed ? "text-green-700" : "text-red-700"}>
                {gradeQuery.result.hasPassed ? " · Passed" : " · Not passed"}
              </span>
            )}
          </div>
        )}

        {isTutor && (
          <div className="flex gap-1 border-b border-gray-100 px-5 pt-3">
            <button
              type="button"
              onClick={() => {
                setTab("created")
                setSelectedAssignmentId(null)
              }}
              className={cn(
                "mb-[-1px] flex items-center gap-1.5 rounded-t-lg border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                tab === "created"
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-muted-foreground hover:text-gray-900"
              )}
            >
              <ClipboardList className="size-3.5" />
              Created
              <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs tabular-nums">
                {courseAssignments.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setTab("submitted")}
              className={cn(
                "mb-[-1px] flex items-center gap-1.5 rounded-t-lg border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                tab === "submitted"
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-muted-foreground hover:text-gray-900"
              )}
            >
              <Inbox className="size-3.5" />
              Submitted
              <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs tabular-nums">
                {totalSubmissions}
              </span>
              {pendingCount > 0 && (
                <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-800">
                  {pendingCount} pending
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("results")
                setSelectedAssignmentId(null)
              }}
              className={cn(
                "mb-[-1px] flex items-center gap-1.5 rounded-t-lg border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                tab === "results"
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-muted-foreground hover:text-gray-900"
              )}
            >
              <GraduationCap className="size-3.5" />
              Course results
            </button>
          </div>
        )}

        {isTutor && tab === "results" ? (
          <DataTable
            columns={resultColumns}
            data={courseGradesQuery.results}
            getRowKey={(row) => row.userId}
            emptyState={
              <div className="py-12 text-center text-sm text-muted-foreground">
                No enrolled learners yet
              </div>
            }
          />
        ) : isTutor && tab === "submitted" && selectedAssignment ? (
          <>
            <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 px-5 py-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-8"
                onClick={closeAssignmentSubmissions}
              >
                <ArrowLeft className="size-3.5" />
                All assignments
              </Button>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{selectedAssignment.title}</p>
                <p className="text-xs text-muted-foreground">
                  {getAssignmentTypeLabel(selectedAssignment.type)} · worth{" "}
                  {selectedAssignment.weightPercent ?? 0}% of course grade ·{" "}
                  {assignmentSubmissions.length} submission
                  {assignmentSubmissions.length === 1 ? "" : "s"}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() =>
                  navigate(
                    DashboardRoutes.toLmsEditCourseAssignment(
                      productId ?? "",
                      course.id,
                      selectedAssignment.id
                    )
                  )
                }
              >
                <Pencil className="size-3.5" />
                Edit assignment
              </Button>
            </div>
            <DataTable
              columns={submittedColumns}
              data={assignmentSubmissions}
              getRowKey={(r) => r.id}
              onRowClick={(row) => setSelectedSubmission(row)}
              rowClassName={() => "cursor-pointer hover:bg-gray-50/80"}
              emptyState={
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No submissions for this assignment yet
                </div>
              }
            />
          </>
        ) : isTutor && tab === "submitted" ? (
          <DataTable
            columns={assignmentPickerColumns}
            data={courseAssignments}
            getRowKey={(r) => r.id}
            onRowClick={(row) => openAssignmentSubmissions(row.id)}
            rowClassName={() => "cursor-pointer hover:bg-gray-50/80"}
            emptyState={
              <div className="py-12 text-center text-sm text-muted-foreground">
                No assignments yet — create one to get started
              </div>
            }
          />
        ) : (
          <DataTable
            columns={createdColumns}
            data={courseAssignments}
            getRowKey={(r) => r.id}
            onRowClick={(row) => openAssignmentSubmissions(row.id)}
            rowClassName={() => "cursor-pointer hover:bg-gray-50/80"}
            emptyState={
              <div className="py-12 text-center text-sm text-muted-foreground">
                No assignments yet — create one to get started
              </div>
            }
          />
        )}
      </div>

      {isTutor && (
        <>
          <SubmissionDetailModal
            submission={selectedSubmission}
            onClose={() => setSelectedSubmission(null)}
            onGrade={(row) => {
              setSelectedSubmission(null)
              setGradingSubmission(row)
            }}
          />
          <GradeSubmissionModal
            submission={gradingSubmission}
            assignmentWeightPercent={selectedAssignment?.weightPercent}
            onClose={() => setGradingSubmission(null)}
            onSubmitGrade={async (input) => {
              await assignmentActions.grade.mutateAsync({ ...input, approve: true })
            }}
            onRequestResubmission={async (assignmentId, submissionId) => {
              await assignmentActions.reopen.mutateAsync({ assignmentId, submissionId })
            }}
          />
        </>
      )}
    </>
  )
}
