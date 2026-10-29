import { useMemo, useState } from "react"
import {
  Camera,
  CheckCheck,
  CheckCircle2,
  Download,
  Expand,
  FileText,
  Loader2,
  Mic,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  UserRound,
  Video,
  XCircle,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type {
  TeacherCourseAssignmentReviewI,
  TeacherCoursePaperScriptUploadI,
} from "@/api/teacherCourse.api"
import type {
  ELearningAssignment,
  ELearningAssignmentAttempt,
  ELearningAssignmentSnapshot,
  ELearningAssignmentStudentSubmission,
} from "@/types/elearning"
import PaperSubmissionsPanel from "./PaperSubmissionsPanel"

const assignmentStatusStyles = {
  draft: "bg-amber-50 text-amber-700",
  approved: "bg-green-50 text-green-700",
  closed: "bg-gray-100 text-gray-700",
  open: "bg-green-50 text-green-700",
  graded: "bg-blue-50 text-blue-700",
}

const studentStatusStyles = {
  not_started: "bg-gray-100 text-gray-600",
  in_progress: "bg-blue-50 text-blue-700",
  submitted: "bg-green-50 text-green-700",
  ended: "bg-red-50 text-red-700",
  reopened: "bg-violet-50 text-violet-700",
}

type ReviewTab = "preview" | "paper_upload" | "submissions"

interface AssignmentViewModalProps {
  assignment: ELearningAssignment | null
  review?: TeacherCourseAssignmentReviewI
  open: boolean
  isLoading?: boolean
  isReopening?: boolean
  isAiGrading?: boolean
  gradingAttemptId?: string
  isTranscribing?: boolean
  transcribingAnswerId?: string
  isFinalizing?: boolean
  finalizingAttemptId?: string
  isBulkFinalizing?: boolean
  isBulkAiGrading?: boolean
  isUploadingPapers?: boolean
  isConfirmingPaper?: boolean
  confirmingPaperSubmissionId?: string
  onClose: () => void
  onReopen?: (attemptId: string) => void | Promise<unknown>
  onAiGrade?: (attemptId: string) => void | Promise<unknown>
  onTranscribe?: (
    attemptId: string,
    answerId: string
  ) => void | Promise<unknown>
  onFinalize?: (
    attemptId: string,
    answers: {
      questionId: string
      awardedPoints: number
      teacherFeedback?: string
    }[]
  ) => void | Promise<unknown>
  onBulkFinalize?: () => void | Promise<unknown>
  onBulkAiGrade?: (attemptIds: string[]) => void | Promise<unknown>
  onUploadPapers?: (scripts: TeacherCoursePaperScriptUploadI[]) => Promise<unknown>
  onConfirmPaper?: (
    paperSubmissionId: string,
    studentId: string
  ) => Promise<unknown>
}

function mapAttempt(
  attempt: TeacherCourseAssignmentReviewI["students"][number]["attempts"][number]
): ELearningAssignmentAttempt {
  return {
    id: attempt.id,
    attemptNumber: attempt.attemptNumber,
    status: attempt.status,
    startedAtUtc: attempt.startedAtUtc,
    endedAtUtc: attempt.endedAtUtc ?? undefined,
    submittedAtUtc: attempt.submittedAtUtc ?? undefined,
    endedReason: attempt.endedReason ?? undefined,
    objectiveScore: attempt.objectiveScore ?? undefined,
    finalScore: attempt.finalScore ?? undefined,
    reopenGranted: attempt.reopenGranted,
    submissionSource: attempt.submissionSource ?? "student_online",
    paperSubmissionId: attempt.paperSubmissionId ?? undefined,
    uploadedByUserId: attempt.uploadedByUserId ?? undefined,
    paperPages: attempt.paperPages ?? [],
    answers: attempt.answers.map((answer) => ({
      ...answer,
      textAnswer: answer.textAnswer ?? undefined,
      voiceAnswerUrl: answer.voiceAnswerUrl ?? undefined,
      voiceTranscript: answer.voiceTranscript ?? undefined,
      transcriptionStatus: answer.transcriptionStatus ?? undefined,
      transcriptionError: answer.transcriptionError ?? undefined,
      transcriptionModel: answer.transcriptionModel ?? undefined,
      transcribedAtUtc: answer.transcribedAtUtc ?? undefined,
      awardedPoints: answer.awardedPoints ?? undefined,
      aiSuggestedPoints: answer.aiSuggestedPoints ?? undefined,
      aiConfidence: answer.aiConfidence ?? undefined,
      aiFeedback: answer.aiFeedback ?? undefined,
      aiModel: answer.aiModel ?? undefined,
      aiMarkedAtUtc: answer.aiMarkedAtUtc ?? undefined,
      teacherFeedback: answer.teacherFeedback ?? undefined,
    })),
    snapshots: attempt.snapshots,
  }
}

function mapStudent(
  student: TeacherCourseAssignmentReviewI["students"][number]
): ELearningAssignmentStudentSubmission {
  const attempts = student.attempts.map(mapAttempt)
  return {
    studentId: student.studentId,
    studentName: student.studentName,
    email: student.email,
    studentIdentifier: student.studentIdentifier ?? "",
    status: student.status,
    attemptCount: student.attemptCount,
    latestAttempt: student.latestAttempt
      ? mapAttempt(student.latestAttempt)
      : undefined,
    attempts,
  }
}

export default function AssignmentViewModal({
  assignment,
  review,
  open,
  isLoading = false,
  isReopening = false,
  isAiGrading = false,
  gradingAttemptId,
  isTranscribing = false,
  transcribingAnswerId,
  isFinalizing = false,
  finalizingAttemptId,
  isBulkFinalizing = false,
  isBulkAiGrading = false,
  isUploadingPapers = false,
  isConfirmingPaper = false,
  confirmingPaperSubmissionId,
  onClose,
  onReopen,
  onAiGrade,
  onTranscribe,
  onFinalize,
  onBulkFinalize,
  onBulkAiGrade,
  onUploadPapers,
  onConfirmPaper,
}: AssignmentViewModalProps) {
  const [tab, setTab] = useState<ReviewTab>("preview")
  const [selectedStudentId, setSelectedStudentId] = useState<string>()

  const students = useMemo(
    () => (review?.students ?? []).map(mapStudent),
    [review?.students]
  )
  const selectedStudent =
    students.find((student) => student.studentId === selectedStudentId) ??
    students.find((student) => student.latestAttempt)

  if (!assignment) return null

  const paperUploadEnabled =
    assignment.status === "approved" &&
    (assignment.submissionMethod === "teacher_paper" ||
      assignment.submissionMethod === "hybrid")

  const submitted = students.filter(
    (student) => student.status === "submitted"
  ).length
  const ended = students.filter((student) => student.status === "ended").length
  const dueDate = new Date(assignment.dueDate)
  const readyForBulkApproval = students.filter((student) => {
    const attempt = student.latestAttempt
    return Boolean(
      attempt &&
        attempt.status === "submitted" &&
        attempt.finalScore == null &&
        (assignment.questions?.length ?? 0) > 0 &&
        assignment.questions?.every(
          (question) =>
            Boolean(question.id) &&
            attempt.answers.some(
              (answer) =>
                answer.questionId === question.id &&
                answer.aiSuggestedPoints != null
            )
        )
    )
  }).length
  const attemptsReadyForAiMarking = students
    .map((student) => student.latestAttempt)
    .filter((attempt): attempt is ELearningAssignmentAttempt =>
      Boolean(
        attempt &&
          attempt.status === "submitted" &&
          attempt.finalScore == null &&
          assignment.questions?.some(
            (question) =>
              Boolean(question.id) &&
              !attempt.answers.some(
                (answer) =>
                  answer.questionId === question.id &&
                  answer.aiSuggestedPoints != null
              )
          )
      )
    )
    .map((attempt) => attempt.id)

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="flex max-h-[94vh] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-6xl">
        <DialogHeader className="border-b border-gray-100 px-6 py-5">
          <DialogTitle>{assignment.title}</DialogTitle>
          <DialogDescription>
            Teacher preview and student submission review
          </DialogDescription>
        </DialogHeader>

        <div className="flex border-b border-gray-100 px-6">
          {([
            ["preview", "Student preview"],
            ...(paperUploadEnabled && onUploadPapers && onConfirmPaper
              ? [["paper_upload", `Paper intake (${review?.paperSubmissions?.length ?? 0})`] as const]
              : []),
            ["submissions", `Students (${submitted}/${students.length})`],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={`border-b-2 px-4 py-3 text-sm font-medium ${
                tab === value
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-gray-50/50">
          {tab === "preview" ? (
            <StudentPreview assignment={assignment} dueDate={dueDate} />
          ) : tab === "paper_upload" && review && onUploadPapers && onConfirmPaper ? (
            <PaperSubmissionsPanel
              review={review}
              isUploading={isUploadingPapers}
              isConfirming={isConfirmingPaper}
              confirmingSubmissionId={confirmingPaperSubmissionId}
              onUpload={onUploadPapers}
              onConfirm={onConfirmPaper}
            />
          ) : isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="size-6 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="grid min-h-[560px] lg:grid-cols-[340px_1fr]">
              <aside className="border-r border-gray-100 bg-white">
                <div className="grid grid-cols-3 gap-2 border-b border-gray-100 p-4 text-center">
                  <Summary value={submitted} label="Submitted" />
                  <Summary value={ended} label="Ended" />
                  <Summary value={students.length} label="Students" />
                </div>
                <div className="max-h-[68vh] overflow-y-auto">
                  {students.length === 0 ? (
                    <p className="px-5 py-12 text-center text-sm text-muted-foreground">
                      No enrolled students found.
                    </p>
                  ) : (
                    students.map((student) => (
                      <button
                        key={student.studentId}
                        type="button"
                        onClick={() => setSelectedStudentId(student.studentId)}
                        className={`flex w-full items-center gap-3 border-b border-gray-50 px-4 py-3 text-left ${
                          selectedStudent?.studentId === student.studentId
                            ? "bg-blue-50"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gray-100">
                          <UserRound className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">
                            {student.studentName}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {student.email || "No email"}
                          </span>
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${studentStatusStyles[student.status]}`}
                        >
                          {student.status.replaceAll("_", " ")}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </aside>

              <main className="min-w-0 p-5">
                {selectedStudent ? (
                  <StudentSubmission
                    key={selectedStudent.studentId}
                    assignment={assignment}
                    student={selectedStudent}
                    isReopening={isReopening}
                    isAiGrading={isAiGrading}
                    gradingAttemptId={gradingAttemptId}
                    isTranscribing={isTranscribing}
                    transcribingAnswerId={transcribingAnswerId}
                    isFinalizing={isFinalizing}
                    finalizingAttemptId={finalizingAttemptId}
                    onReopen={onReopen}
                    onAiGrade={onAiGrade}
                    onTranscribe={onTranscribe}
                    onFinalize={onFinalize}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Select a student to review their assignment.
                  </div>
                )}
              </main>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-white px-6 py-4">
          <div className="flex flex-wrap gap-2">
            {tab === "submissions" && onBulkAiGrade && (
              <Button
                className="gap-2 bg-violet-600 hover:bg-violet-700"
                disabled={
                  attemptsReadyForAiMarking.length === 0 ||
                  isBulkAiGrading ||
                  isAiGrading
                }
                onClick={() => {
                  if (
                    window.confirm(
                      `Generate AI mark suggestions for ${attemptsReadyForAiMarking.length} unmarked student${attemptsReadyForAiMarking.length === 1 ? "" : "s"}? You will review the suggestions before approval.`
                    )
                  ) {
                    void onBulkAiGrade(attemptsReadyForAiMarking)
                  }
                }}
              >
                {isBulkAiGrading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                {isBulkAiGrading
                  ? "AI marking papers…"
                  : `AI mark all unmarked (${attemptsReadyForAiMarking.length})`}
              </Button>
            )}
            {tab === "submissions" && onBulkFinalize && (
              <Button
                className="gap-2 bg-emerald-700 hover:bg-emerald-800"
                disabled={
                  readyForBulkApproval === 0 ||
                  isBulkFinalizing ||
                  isFinalizing
                }
                onClick={() => {
                  if (
                    window.confirm(
                      `Approve the AI suggestions as final grades for ${readyForBulkApproval} student${readyForBulkApproval === 1 ? "" : "s"}? Each result will be written to the gradebook when this assignment has a destination.`
                    )
                  ) {
                    void onBulkFinalize()
                  }
                }}
              >
                {isBulkFinalizing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CheckCheck className="size-4" />
                )}
                {isBulkFinalizing
                  ? "Approving students…"
                  : `Approve all AI-ready (${readyForBulkApproval})`}
              </Button>
            )}
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Summary({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  )
}

function StudentPreview({
  assignment,
  dueDate,
}: {
  assignment: ELearningAssignment
  dueDate: Date
}) {
  return (
    <div className="mx-auto max-w-4xl space-y-5 p-5 sm:p-8">
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${assignmentStatusStyles[assignment.status]}`}
              >
                {assignment.status}
              </span>
              <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700 capitalize">
                {(assignment.answerMode ?? "single_choice").replaceAll(
                  "_",
                  " "
                )}
              </span>
            </div>
            <h2 className="mt-3 text-xl font-semibold">{assignment.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {assignment.description || "No additional instructions."}
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 px-4 py-3 text-right text-xs">
            <p className="font-semibold">
              {assignment.durationMinutes
                ? `${assignment.durationMinutes} minutes`
                : "Untimed"}
            </p>
            <p className="text-muted-foreground">
              Due{" "}
              {Number.isNaN(dueDate.getTime())
                ? assignment.dueDate
                : dueDate.toLocaleString()}
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <SecurityItem icon={ShieldCheck} text="Tab leave ends attempt" />
          <SecurityItem icon={FileText} text="Copy and paste disabled" />
          <SecurityItem
            icon={Video}
            text={
              assignment.allowVideoRecording
                ? "Random snapshots enabled"
                : "Camera snapshots disabled"
            }
          />
        </div>
      </div>

      {(assignment.questions ?? []).map((question, questionIndex) => (
        <div
          key={question.id ?? questionIndex}
          className="rounded-2xl border border-gray-200 bg-white p-5"
        >
          <div className="flex gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              {questionIndex + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="leading-relaxed font-medium">{question.prompt}</p>
              {question.options.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <label
                      key={option.id ?? optionIndex}
                      className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm"
                    >
                      <input
                        disabled
                        type={
                          assignment.answerMode === "multiple_choice"
                            ? "checkbox"
                            : "radio"
                        }
                      />
                      <span className="font-semibold text-gray-500">
                        {String.fromCharCode(65 + optionIndex)}.
                      </span>
                      {option.text}
                    </label>
                  ))}
                </div>
              ) : assignment.answerMode === "visual" ? (
                <div className="mt-4 rounded-xl border border-dashed border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                  <Camera className="mb-2 size-5" />
                  Student takes photos or uploads pages of {assignment.workType?.replaceAll("_", " ") ?? "visual work"}.
                </div>
              ) : assignment.answerMode === "voice" ? (
                <Button disabled variant="outline" className="mt-4 gap-2">
                  <Mic className="size-4" />
                  Record answer
                </Button>
              ) : (
                <Textarea
                  disabled
                  rows={4}
                  className="mt-4"
                  placeholder="Student writes the answer here..."
                />
              )}
              {(question.rubricCriteria?.length ?? 0) > 0 && (
                <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs">
                  <p className="font-semibold">Marking criteria</p>
                  <ul className="mt-2 space-y-1">
                    {question.rubricCriteria?.map((criterion, criterionIndex) => (
                      <li key={criterionIndex}>
                        {criterion.name} — {criterion.points} pts
                        {criterion.description ? `: ${criterion.description}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function SecurityItem({
  icon: Icon,
  text,
}: {
  icon: typeof ShieldCheck
  text: string
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs">
      <Icon className="size-3.5 text-gray-600" />
      {text}
    </div>
  )
}

function StudentSubmission({
  assignment,
  student,
  isReopening,
  isAiGrading,
  gradingAttemptId,
  isTranscribing,
  transcribingAnswerId,
  isFinalizing,
  finalizingAttemptId,
  onReopen,
  onAiGrade,
  onTranscribe,
  onFinalize,
}: {
  assignment: ELearningAssignment
  student: ELearningAssignmentStudentSubmission
  isReopening: boolean
  isAiGrading: boolean
  gradingAttemptId?: string
  isTranscribing: boolean
  transcribingAnswerId?: string
  isFinalizing: boolean
  finalizingAttemptId?: string
  onReopen?: (attemptId: string) => void | Promise<unknown>
  onAiGrade?: (attemptId: string) => void | Promise<unknown>
  onTranscribe?: (
    attemptId: string,
    answerId: string
  ) => void | Promise<unknown>
  onFinalize?: (
    attemptId: string,
    answers: {
      questionId: string
      awardedPoints: number
      teacherFeedback?: string
    }[]
  ) => void | Promise<unknown>
}) {
  const [attemptId, setAttemptId] = useState(
    student.latestAttempt?.id ?? student.attempts.at(-1)?.id
  )
  const [selectedSnapshot, setSelectedSnapshot] =
    useState<ELearningAssignmentSnapshot | null>(null)
  const attempt =
    student.attempts.find((item) => item.id === attemptId) ??
    student.latestAttempt
  const gradingThisAttempt = isAiGrading && gradingAttemptId === attempt?.id
  const finalizingThisAttempt =
    isFinalizing && finalizingAttemptId === attempt?.id
  type FinalMark = { awardedPoints: string; teacherFeedback: string }
  const [finalMarkEdits, setFinalMarkEdits] = useState<
    Record<string, Record<string, FinalMark>>
  >({})
  const suggestedFinalMarks = useMemo<Record<string, FinalMark>>(() => {
    if (!attempt) return {}
    return Object.fromEntries(
      (assignment.questions ?? [])
        .filter((question) => Boolean(question.id))
        .map((question) => {
          const answer = attempt.answers.find(
            (item) => item.questionId === question.id
          )
          return [
            question.id!,
            {
              awardedPoints: String(
                answer?.awardedPoints ?? answer?.aiSuggestedPoints ?? 0
              ),
              teacherFeedback:
                answer?.teacherFeedback ?? answer?.aiFeedback ?? "",
            },
          ]
        })
    )
  }, [assignment.questions, attempt])
  const finalMarks = {
    ...suggestedFinalMarks,
    ...(attempt ? finalMarkEdits[attempt.id] : {}),
  }

  if (!attempt) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-white py-20 text-center">
        <UserRound className="mx-auto mb-3 size-8 text-gray-300" />
        <p className="text-sm font-medium">No attempt yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {student.studentName} has not started this assignment.
        </p>
      </div>
    )
  }

  const updateFinalMark = (questionId: string, update: Partial<FinalMark>) => {
    setFinalMarkEdits((current) => {
      const attemptEdits = current[attempt.id] ?? {}
      const existing = attemptEdits[questionId] ?? finalMarks[questionId] ?? {
        awardedPoints: "0",
        teacherFeedback: "",
      }
      return {
        ...current,
        [attempt.id]: {
          ...attemptEdits,
          [questionId]: { ...existing, ...update },
        },
      }
    })
  }

  const suggestedPoints = attempt.answers.reduce(
    (total, answer) => total + (answer.aiSuggestedPoints ?? 0),
    0
  )
  const availablePoints = (assignment.questions ?? []).reduce(
    (total, question) => total + question.points,
    0
  )
  const hasAiSuggestions = attempt.answers.some(
    (answer) => answer.aiSuggestedPoints != null
  )

  return (
    <div className="space-y-4">
      {student.attempts.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {student.attempts.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setAttemptId(item.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                attempt?.id === item.id
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 ring-1 ring-gray-200"
              }`}
            >
              Attempt {item.attemptNumber}
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-gray-100 bg-white p-4">
        <div>
          <h3 className="font-semibold">{student.studentName}</h3>
          <p className="text-xs text-muted-foreground">
            Attempt {attempt.attemptNumber} · Started{" "}
            {new Date(attempt.startedAtUtc).toLocaleString()}
          </p>
          {attempt.submissionSource === "teacher_paper" && (
            <p className="mt-1 text-xs font-medium text-blue-700">
              Teacher-uploaded paper script · identity confirmed
            </p>
          )}
          {attempt.endedReason && (
            <p className="mt-1 text-xs text-red-600">
              End reason: {attempt.endedReason.replaceAll("_", " ")}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {attempt.objectiveScore != null && (
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
              {attempt.objectiveScore}%
            </span>
          )}
          {attempt.finalScore != null && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
              Final {attempt.finalScore}%
            </span>
          )}
          {hasAiSuggestions && (
            <span className="rounded-full bg-violet-50 px-3 py-1 text-sm font-bold text-violet-700">
              AI suggestion {suggestedPoints}/{availablePoints} pts
            </span>
          )}
          {onAiGrade && attempt.status === "submitted" && (
            <Button
              size="sm"
              className="gap-1.5 bg-violet-600 hover:bg-violet-700"
              disabled={gradingThisAttempt}
              onClick={() => void onAiGrade(attempt.id)}
            >
              {gradingThisAttempt ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Sparkles className="size-3.5" />
              )}
              {gradingThisAttempt
                ? "AI grading…"
                : hasAiSuggestions
                  ? "Run AI grade again"
                  : "AI grade"}
            </Button>
          )}
          {onReopen &&
            (attempt.status === "ended" || attempt.status === "submitted") && (
              <Button
                size="sm"
                variant="outline"
                disabled={isReopening || attempt.reopenGranted}
                className="gap-1.5"
                onClick={() => void onReopen(attempt.id)}
              >
                {isReopening ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="size-3.5" />
                )}
                {attempt.reopenGranted ? "Reopened" : "Reopen"}
              </Button>
            )}
        </div>
      </div>

      {attempt.paperPages.length > 0 && (
        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
          <p className="text-sm font-semibold text-blue-950">Complete paper script</p>
          <p className="mt-0.5 text-xs text-blue-700">
            These shared pages are assessed against every question and rubric below.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {attempt.paperPages.map((page) => (
              <a
                key={page.id}
                href={page.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="overflow-hidden rounded-lg border border-blue-100 bg-white"
              >
                <img
                  src={page.fileUrl}
                  alt={`Paper script page ${page.pageNumber}`}
                  className="aspect-[4/3] w-full object-cover"
                />
                <p className="truncate px-2 py-1.5 text-[10px] text-muted-foreground">
                  Page {page.pageNumber} · {page.originalFileName}
                </p>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {(assignment.questions ?? []).map((question, index) => {
          const answer = attempt.answers.find(
            (item) => item.questionId === question.id
          )
          const selected = new Set(answer?.selectedOptionIds ?? [])
          const transcribingThisAnswer =
            isTranscribing && transcribingAnswerId === answer?.id
          return (
            <div
              key={question.id ?? index}
              className="rounded-xl border border-gray-100 bg-white p-4"
            >
              <p className="text-sm font-semibold">
                {index + 1}. {question.prompt}
              </p>
              {question.options.length > 0 ? (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {question.options.map((option, optionIndex) => {
                    const chosen = option.id ? selected.has(option.id) : false
                    return (
                      <div
                        key={option.id ?? optionIndex}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${
                          option.isCorrect
                            ? "border-green-200 bg-green-50 text-green-800"
                            : chosen
                              ? "border-red-200 bg-red-50 text-red-700"
                              : "border-gray-100"
                        }`}
                      >
                        {option.isCorrect ? (
                          <CheckCircle2 className="size-3.5 shrink-0" />
                        ) : chosen ? (
                          <XCircle className="size-3.5 shrink-0" />
                        ) : (
                          <span className="size-3.5 shrink-0" />
                        )}
                        {String.fromCharCode(65 + optionIndex)}. {option.text}
                        {chosen && (
                          <strong className="ml-auto">Selected</strong>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (answer?.visualPages?.length ?? 0) > 0 ? (
                <div className="mt-3">
                  <p className="mb-2 text-xs font-semibold text-emerald-800">
                    Submitted visual pages
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {answer?.visualPages
                      .slice()
                      .sort((a, b) => a.pageNumber - b.pageNumber)
                      .map((page) => (
                        <a
                          key={page.id}
                          href={page.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="group overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                        >
                          <img
                            src={page.fileUrl}
                            alt={`Submitted page ${page.pageNumber}`}
                            className="aspect-[4/3] w-full object-cover transition group-hover:scale-[1.02]"
                          />
                          <p className="truncate px-2 py-1.5 text-[10px] text-muted-foreground">
                            Page {page.pageNumber} · {page.originalFileName}
                          </p>
                        </a>
                      ))}
                  </div>
                </div>
              ) : answer?.voiceAnswerUrl ? (
                <div className="mt-3 space-y-3">
                  <audio
                    controls
                    src={answer.voiceAnswerUrl}
                    className="w-full"
                  />
                  <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-blue-900">
                        <FileText className="size-3.5" /> Voice transcript
                      </p>
                      {!answer.voiceTranscript && onTranscribe ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1.5 border-blue-200 bg-white text-xs text-blue-700 hover:bg-blue-100"
                          disabled={isTranscribing}
                          onClick={() =>
                            void onTranscribe(attempt.id, answer.id)
                          }
                        >
                          {transcribingThisAnswer ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="size-3.5" />
                          )}
                          {transcribingThisAnswer
                            ? "Transcribing…"
                            : answer.transcriptionStatus === "failed"
                              ? "Retry transcript"
                              : "Generate transcript"}
                        </Button>
                      ) : answer.transcribedAtUtc ? (
                        <span className="text-[10px] text-blue-600">
                          {new Date(answer.transcribedAtUtc).toLocaleString()}
                        </span>
                      ) : null}
                    </div>
                    {answer.voiceTranscript ? (
                      <p className="mt-2 text-sm leading-6 whitespace-pre-wrap text-slate-800">
                        {answer.voiceTranscript}
                      </p>
                    ) : (
                      <p className="mt-2 text-xs text-blue-700">
                        {transcribingThisAnswer ||
                        answer.transcriptionStatus === "processing"
                          ? "Transcript is being prepared…"
                          : answer.transcriptionStatus === "failed"
                            ? "Automatic transcription failed. The recording is still available for manual review."
                            : answer.transcriptionStatus === "not_configured"
                              ? "Automatic transcription is not configured on the API host."
                              : "No transcript has been generated for this recording yet."}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="mt-3 rounded-lg bg-gray-50 p-3 text-sm whitespace-pre-wrap">
                  {answer?.textAnswer || "No answer submitted."}
                </p>
              )}
              {(answer?.aiSuggestedPoints != null || answer?.aiFeedback) && (
                <div className="mt-3 rounded-lg border border-violet-100 bg-violet-50 p-3 text-xs text-violet-900">
                  <p className="font-semibold">
                    AI suggestion
                    {answer.aiSuggestedPoints != null
                      ? `: ${answer.aiSuggestedPoints}/${question.points}`
                      : ""}
                  </p>
                  {answer.aiFeedback && (
                    <p className="mt-1">{answer.aiFeedback}</p>
                  )}
                  {(answer.aiConfidence != null || answer.aiModel) && (
                    <p className="mt-1 text-[11px] text-violet-700">
                      {answer.aiConfidence != null
                        ? `${Math.round(answer.aiConfidence * 100)}% confidence`
                        : ""}
                      {answer.aiConfidence != null && answer.aiModel
                        ? " · "
                        : ""}
                      {answer.aiModel ? `Model: ${answer.aiModel}` : ""}
                    </p>
                  )}
                  <p className="mt-2 font-medium text-violet-700">
                    Teacher review required — this has not changed the final
                    grade.
                  </p>
                </div>
              )}
              {onFinalize && attempt.status === "submitted" && question.id && (
                <div className="mt-3 grid gap-3 rounded-lg border border-emerald-100 bg-emerald-50/50 p-3 sm:grid-cols-[120px_1fr]">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold" htmlFor={`mark-${attempt.id}-${question.id}`}>
                      Final points / {question.points}
                    </label>
                    <input
                      id={`mark-${attempt.id}-${question.id}`}
                      type="number"
                      min={0}
                      max={question.points}
                      step={0.01}
                      className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm"
                      value={finalMarks[question.id]?.awardedPoints ?? "0"}
                      onChange={(event) =>
                        updateFinalMark(question.id!, {
                          awardedPoints: event.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold" htmlFor={`feedback-${attempt.id}-${question.id}`}>
                      Approved feedback for student
                    </label>
                    <Textarea
                      id={`feedback-${attempt.id}-${question.id}`}
                      rows={2}
                      value={finalMarks[question.id]?.teacherFeedback ?? ""}
                      onChange={(event) =>
                        updateFinalMark(question.id!, {
                          teacherFeedback: event.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {onFinalize && attempt.status === "submitted" && (
        <div className="flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-950">
              Approve final result
            </p>
            <p className="text-xs text-emerald-800">
              {assignment.assessmentComponentId
                ? `This will accumulate up to ${assignment.gradebookContributionPoints ?? 0} points in ${assignment.assessmentComponentName ?? "the selected assessment component"}.`
                : "This assignment is not linked to the gradebook."}
            </p>
          </div>
          <Button
            className="shrink-0 gap-2 bg-emerald-700 hover:bg-emerald-800"
            disabled={finalizingThisAttempt}
            onClick={() => {
              const answers = (assignment.questions ?? []).map((question) => ({
                questionId: question.id ?? "",
                awardedPoints: Number(finalMarks[question.id ?? ""]?.awardedPoints ?? 0),
                teacherFeedback:
                  finalMarks[question.id ?? ""]?.teacherFeedback.trim() || undefined,
              }))
              const invalid = answers.some((answer, index) => {
                const maximum = assignment.questions?.[index]?.points ?? 0
                return !answer.questionId || answer.awardedPoints < 0 || answer.awardedPoints > maximum
              })
              if (!invalid) void onFinalize(attempt.id, answers)
            }}
          >
            {finalizingThisAttempt ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            {finalizingThisAttempt ? "Approving…" : "Approve final grade"}
          </Button>
        </div>
      )}

      <div className="rounded-xl border border-gray-100 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Camera className="size-4" /> Proctoring snapshots
            </p>
            <p className="text-xs text-muted-foreground">
              Random activity snapshots, maximum 10 per attempt.
            </p>
          </div>
          <span className="text-xs text-muted-foreground">
            {attempt.snapshots.length}/10
          </span>
        </div>
        {attempt.snapshots.length === 0 ? (
          <p className="rounded-lg bg-gray-50 py-8 text-center text-xs text-muted-foreground">
            No snapshots captured for this attempt.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {attempt.snapshots.slice(0, 10).map((snapshot) => (
              <button
                key={snapshot.id}
                type="button"
                onClick={() => setSelectedSnapshot(snapshot)}
                className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gray-100 text-left"
              >
                <img
                  src={snapshot.fileUrl}
                  alt={`Captured ${new Date(snapshot.capturedAtUtc).toLocaleString()}`}
                  className="aspect-video w-full object-cover"
                />
                <span className="absolute top-2 right-2 flex size-7 items-center justify-center rounded-full bg-black/65 text-white opacity-0 transition group-hover:opacity-100">
                  <Expand className="size-3.5" />
                </span>
                <p className="truncate px-2 py-1.5 text-[10px] text-muted-foreground">
                  {new Date(snapshot.capturedAtUtc).toLocaleString()}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={Boolean(selectedSnapshot)}
        onOpenChange={(value) => !value && setSelectedSnapshot(null)}
      >
        <DialogContent className="w-[96vw] max-w-[96vw] overflow-hidden p-0">
          <DialogHeader className="border-b border-gray-100 px-5 py-4">
            <DialogTitle>Proctoring snapshot</DialogTitle>
            <DialogDescription>
              {selectedSnapshot
                ? new Date(selectedSnapshot.capturedAtUtc).toLocaleString()
                : ""}
            </DialogDescription>
          </DialogHeader>
          {selectedSnapshot && (
            <div className="bg-slate-950 p-3 sm:p-5">
              <img
                src={selectedSnapshot.fileUrl}
                alt={`Captured ${new Date(selectedSnapshot.capturedAtUtc).toLocaleString()}`}
                className="mx-auto max-h-[72vh] w-auto max-w-full rounded-lg object-contain"
              />
            </div>
          )}
          <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-4">
            <Button variant="outline" onClick={() => setSelectedSnapshot(null)}>
              Close
            </Button>
            {selectedSnapshot && (
              <Button asChild className="gap-2">
                <a
                  href={selectedSnapshot.fileUrl}
                  download={`cbt-snapshot-${selectedSnapshot.id}.jpg`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Download className="size-4" /> Download snapshot
                </a>
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
