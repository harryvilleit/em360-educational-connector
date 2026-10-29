import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, FileText, Mic, Video } from "lucide-react"
import type { LmsAssignmentType, LmsSubmission } from "@/types/elearning"
import { weightedContribution } from "@/lib/lms-assignment-weights"
import {
  getAssignmentTypeLabel,
  getSubmissionStatusStyle,
} from "@/lib/lms-assignment-display"

export type SubmissionListRow = LmsSubmission & {
  assignmentTitle: string
  courseTitle: string
  assignmentType: LmsAssignmentType
  assignmentWeightPercent?: number
}

type SubmissionDetailModalProps = {
  submission: SubmissionListRow | null
  onClose: () => void
  onGrade?: (submission: SubmissionListRow) => void
}

export default function SubmissionDetailModal({
  submission,
  onClose,
  onGrade,
}: SubmissionDetailModalProps) {
  if (!submission) return null

  const voiceAnswerCount = submission.voiceAnswers
    ? Object.keys(submission.voiceAnswers).length
    : 0

  const weight = submission.assignmentWeightPercent ?? 0
  const courseContribution =
    submission.score != null && weight > 0
      ? weightedContribution(submission.score, weight)
      : null

  return (
    <Dialog open={!!submission} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{submission.studentName}</DialogTitle>
          <DialogDescription>
            {submission.assignmentTitle} · {submission.courseTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium capitalize">
              {getAssignmentTypeLabel(submission.assignmentType)}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${getSubmissionStatusStyle(submission.status)}`}
            >
              {submission.status.replace(/_/g, " ")}
            </span>
            {submission.score != null && weight > 0 && (
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 tabular-nums">
                {courseContribution!.toFixed(1)} / {weight} course pts
              </span>
            )}
            {submission.score != null && (
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 tabular-nums">
                {Math.round(submission.score)}% on assignment
              </span>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Submitted {submission.submittedAt} · {submission.studentEmail}
            {courseContribution != null && weight > 0 && (
              <>
                {" "}
                · earns{" "}
                <span className="font-medium text-gray-700">
                  {courseContribution.toFixed(1)} of {weight} course points
                </span>{" "}
                ({Math.round(submission.score!)}% on this assignment)
              </>
            )}
          </p>

          {submission.writtenAnswer && (
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <p className="mb-1 text-xs font-semibold text-muted-foreground uppercase">
                Written answer
              </p>
              <p className="whitespace-pre-wrap text-gray-700">
                {submission.writtenAnswer}
              </p>
            </div>
          )}

          {submission.pdfUrl && (
            <a
              href={submission.pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 font-medium text-blue-700 hover:bg-blue-50"
            >
              <Download className="size-4" />
              {submission.fileName ?? "Download submitted file"}
            </a>
          )}

          {submission.voiceUrl && voiceAnswerCount === 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
              <Mic className="size-4 text-purple-600" />
              <audio
                controls
                src={submission.voiceUrl}
                aria-label="Submitted voice answer"
                className="w-full"
              />
            </div>
          )}

          {voiceAnswerCount > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">
                Voice answers ({voiceAnswerCount})
              </p>
              {Object.entries(submission.voiceAnswers ?? {}).map(
                ([qId, url], idx) => (
                  <div
                    key={qId}
                    className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
                  >
                    <span className="flex items-center gap-2">
                      <Mic className="size-4 text-purple-600" />
                      Question {idx + 1}
                    </span>
                    <audio
                      controls
                      src={url}
                      aria-label={`Voice answer for question ${idx + 1}`}
                      className="w-full max-w-md"
                    />
                  </div>
                )
              )}
            </div>
          )}

          {submission.cbtAnswers && (
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
              <p className="mb-2 text-xs font-semibold text-muted-foreground uppercase">
                CBT answers
              </p>
              <ul className="space-y-1 text-xs">
                {Object.entries(submission.cbtAnswers).map(([qId, answer]) => (
                  <li key={qId}>
                    <span className="font-medium">{qId}:</span> {answer}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {submission.videoUrl && (
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2">
              <Video className="size-4 text-blue-600" />
              <span>Video submission attached</span>
            </div>
          )}

          {submission.feedback && (
            <div className="rounded-lg border border-green-100 bg-green-50/50 p-3">
              <p className="mb-1 text-xs font-semibold text-green-800 uppercase">
                Tutor feedback
              </p>
              <p className="text-green-900">{submission.feedback}</p>
            </div>
          )}

          {(submission.privateNotes || submission.tutorAnnotations) && (
            <div className="rounded-lg border border-gray-100 bg-white p-3">
              <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase">
                <FileText className="size-3.5" />
                Private tutor notes
              </p>
              <p className="text-gray-700">
                {submission.privateNotes ?? submission.tutorAnnotations}
              </p>
            </div>
          )}

          {onGrade && (
            <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button type="button" onClick={() => onGrade(submission)}>
                {submission.status === "graded"
                  ? "Edit grade"
                  : "Grade submission"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
