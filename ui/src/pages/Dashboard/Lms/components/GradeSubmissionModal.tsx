import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { weightedContribution } from "@/lib/lms-assignment-weights"
import { toast } from "sonner"
import type { SubmissionListRow } from "./SubmissionDetailModal"

type GradeSubmissionModalProps = {
  submission: SubmissionListRow | null
  assignmentWeightPercent?: number
  onClose: () => void
  onGraded?: () => void
  onSubmitGrade: (input: {
    assignmentId: string
    submissionId: string
    score: number
    feedback: string
    privateNotes?: string
  }) => Promise<void>
  onRequestResubmission: (assignmentId: string, submissionId: string) => Promise<void>
}

export default function GradeSubmissionModal({
  submission,
  assignmentWeightPercent = 0,
  onClose,
  onGraded,
  onSubmitGrade,
  onRequestResubmission,
}: GradeSubmissionModalProps) {
  const [score, setScore] = useState("")
  const [feedback, setFeedback] = useState("")
  const [annotations, setAnnotations] = useState("")
  const [busy, setBusy] = useState(false)

  const weight = submission?.assignmentWeightPercent ?? assignmentWeightPercent
  const scoreNum = parseFloat(score)
  const validScore = !Number.isNaN(scoreNum) && scoreNum >= 0 && scoreNum <= 100
  const coursePoints =
    validScore && weight > 0 ? weightedContribution(scoreNum, weight) : null

  useEffect(() => {
    if (!submission) return
    setScore(
      submission.status === "graded" && submission.score != null
        ? String(Math.round(submission.score))
        : ""
    )
    setFeedback(submission.feedback ?? "")
    setAnnotations(submission.privateNotes ?? submission.tutorAnnotations ?? "")
  }, [submission])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!submission) return

    if (!validScore) {
      toast.error("Enter a score between 0 and 100")
      return
    }
    if (!feedback.trim()) {
      toast.error("Add feedback for the student")
      return
    }

    setBusy(true)
    try {
      await onSubmitGrade({
        assignmentId: submission.assignmentId,
        submissionId: submission.id,
        score: scoreNum,
        feedback: feedback.trim(),
        privateNotes: annotations.trim() || undefined,
      })
      toast.success(`Grade approved for ${submission.studentName}`)
      onGraded?.()
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to approve grade")
    } finally {
      setBusy(false)
    }
  }

  const handleRequestResubmit = async () => {
    if (!submission) return
    if (!feedback.trim()) {
      toast.error("Add feedback explaining what to fix")
      return
    }
    setBusy(true)
    try {
      await onRequestResubmission(submission.assignmentId, submission.id)
      toast.success(`Resubmission requested for ${submission.studentName}`)
      onGraded?.()
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to reopen submission")
    } finally {
      setBusy(false)
    }
  }

  if (!submission) return null

  const isRegrade = submission.status === "graded"

  return (
    <Dialog open={!!submission} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isRegrade ? "Update grade" : "Grade submission"}</DialogTitle>
          <DialogDescription>
            {submission.studentName} · {submission.assignmentTitle}
            {weight > 0 && (
              <span className="mt-1 block text-xs">
                Assignment worth {weight}% of course grade · students scored 0–100% on
                this task
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="grade-score">Score on assignment (%)</Label>
            <Input
              id="grade-score"
              type="number"
              min={0}
              max={100}
              step={1}
              className="h-9"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="0–100"
              required
            />
            {coursePoints != null && weight > 0 && (
              <p className="text-xs text-muted-foreground">
                Course points earned:{" "}
                <span className="font-semibold tabular-nums text-gray-800">
                  {coursePoints.toFixed(1)} / {weight}
                </span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade-feedback">Feedback to student</Label>
            <Textarea
              id="grade-feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Explain the grade and what they did well or should improve…"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade-annotations">
              Private notes <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="grade-annotations"
              value={annotations}
              onChange={(e) => setAnnotations(e.target.value)}
              placeholder="Internal notes — not shown to student"
              rows={2}
            />
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
            {submission.status !== "graded" && (
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={handleRequestResubmit}
                disabled={busy}
              >
                Request resubmission
              </Button>
            )}
            <div className="flex w-full gap-2 sm:ml-auto sm:w-auto">
              <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {isRegrade ? "Save grade" : "Submit grade"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
