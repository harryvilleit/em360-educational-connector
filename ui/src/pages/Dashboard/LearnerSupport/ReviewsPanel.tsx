import { type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCompleteLearnerSupportReview } from "@/hooks/learnerSupport"
import { useStudentSupportSettings } from "@/hooks/studentSupportSettings"
import type {
  LearnerSupportCaseDetailI,
  LearnerSupportReviewDecision,
} from "@/api/learnerSupport.api"
import { EmptySupport, FormField } from "./components"
import { formatDate, inputClass, learnerSupportLabel, textareaClass, today } from "./utils"

export default function ReviewsPanel({
  item,
  schoolId,
  activePlanId,
}: {
  item: LearnerSupportCaseDetailI
  schoolId: string
  activePlanId?: string
}) {
  const mutation = useCompleteLearnerSupportReview()
  const { settings } = useStudentSupportSettings(schoolId)
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    mutation.mutate(
      {
        schoolId,
        caseId: item.id,
        planId: activePlanId,
        reviewDate: String(data.get("reviewDate")),
        progressSummary: String(data.get("progressSummary")),
        learnerContribution: String(data.get("learnerContribution") || ""),
        parentContribution: String(data.get("parentContribution") || ""),
        staffContribution: String(data.get("staffContribution") || ""),
        decision: data.get("decision") as LearnerSupportReviewDecision,
        decisionReason: String(data.get("decisionReason")),
        nextReviewDate: String(data.get("nextReviewDate") || "") || undefined,
      },
      { onSuccess: () => form.reset() }
    )
  }
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_1.1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Complete a review</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={submit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Review date">
                <input
                  name="reviewDate"
                  required
                  type="date"
                  defaultValue={today()}
                  className={inputClass}
                />
              </FormField>
              <FormField label="Next review">
                <input
                  name="nextReviewDate"
                  type="date"
                  className={inputClass}
                />
              </FormField>
            </div>
            <FormField label="Progress summary">
              <textarea
                name="progressSummary"
                required
                className={textareaClass}
              />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField label="Learner contribution">
                <textarea
                  name="learnerContribution"
                  className={textareaClass}
                />
              </FormField>
              <FormField label="Parent contribution">
                <textarea name="parentContribution" className={textareaClass} />
              </FormField>
              <FormField label="Staff contribution">
                <textarea name="staffContribution" className={textareaClass} />
              </FormField>
            </div>
            <FormField label="Decision">
              <select name="decision" className={inputClass}>
                {(
                  [
                    "ContinueUnchanged",
                    "AmendPlan",
                    "AddOrRemoveProvision",
                    "MoveToMonitoring",
                    "CloseSupport",
                    "RequestStatutoryAssessment",
                    "UpdateStatutoryPlan",
                  ] as LearnerSupportReviewDecision[]
                ).map((v) => (
                  <option key={v} value={v}>
                    {learnerSupportLabel(v, settings)}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Decision reason">
              <textarea
                name="decisionReason"
                required
                className={textareaClass}
              />
            </FormField>
            <div>
              <Button
                type="submit"
                variant="primary"
                disabled={mutation.isPending}
              >
                Complete review
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="space-y-3">
        {!item.reviews.length ? (
          <EmptySupport>No completed reviews.</EmptySupport>
        ) : (
          item.reviews.map((review) => (
            <Card key={review.id}>
              <CardContent>
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">
                      {learnerSupportLabel(review.decision, settings)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(review.reviewDate)} · {review.completedByName}
                    </p>
                  </div>
                </div>
                <p className="mt-3">{review.progressSummary}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {review.decisionReason}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
