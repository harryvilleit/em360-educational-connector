import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useTriageLearnerSupportCase } from "@/hooks/learnerSupport"
import { useStudentSupportSettings } from "@/hooks/studentSupportSettings"
import type {
  LearnerSupportCaseDetailI,
  LearnerSupportCaseStatus,
} from "@/api/learnerSupport.api"
import { FormField } from "./components"
import { inputClass, learnerSupportLabel, textareaClass } from "./utils"

export default function TriageDialog({
  item,
  schoolId,
}: {
  item: LearnerSupportCaseDetailI
  schoolId: string
}) {
  const [open, setOpen] = useState(false)
  const mutation = useTriageLearnerSupportCase()
  const { settings } = useStudentSupportSettings(schoolId)
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    mutation.mutate(
      {
        schoolId,
        caseId: item.id,
        status: data.get("status") as LearnerSupportCaseStatus,
        isOnRegister: data.get("isOnRegister") === "on",
        caseOwnerUserId: item.caseOwnerUserId,
        caseOwnerName: String(data.get("caseOwnerName") || "") || undefined,
        decisionReason: String(data.get("decisionReason") || ""),
        statutoryPlanType:
          String(data.get("statutoryPlanType") || "") || undefined,
        nextReviewDate: String(data.get("nextReviewDate") || "") || undefined,
      },
      { onSuccess: () => setOpen(false) }
    )
  }
  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Triage / update status
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Triage and ownership</DialogTitle>
            <DialogDescription>
              Record the defensible decision, register position and next review.
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={submit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Status">
                <select
                  name="status"
                  defaultValue={
                    item.status === "Submitted" ? "UnderTriage" : item.status
                  }
                  className={inputClass}
                >
                  {(
                    [
                      "UnderTriage",
                      "Assessing",
                      "SupportPlanActive",
                      "ReviewDue",
                      "StatutoryAssessment",
                      "StatutoryPlanActive",
                      "Monitoring",
                      "Closed",
                    ] as LearnerSupportCaseStatus[]
                  ).map((value) => (
                    <option key={value} value={value}>
                      {learnerSupportLabel(value, settings)}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Case owner name">
                <input
                  name="caseOwnerName"
                  className={inputClass}
                  defaultValue={item.caseOwnerName}
                />
              </FormField>
              <FormField label="Next review">
                <input
                  name="nextReviewDate"
                  type="date"
                  className={inputClass}
                  defaultValue={item.nextReviewDate?.slice(0, 10)}
                />
              </FormField>
              <FormField
                label={`${settings?.formalPlanLabel ?? "Formal plan"} type`}
              >
                <input
                  name="statutoryPlanType"
                  className={inputClass}
                  placeholder="Enter the local plan type"
                  defaultValue={item.statutoryPlanType}
                />
              </FormField>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                name="isOnRegister"
                type="checkbox"
                defaultChecked={item.isOnRegister}
              />{" "}
              Include learner on{" "}
              {settings?.supportRegisterName ?? "support register"}
            </label>
            <FormField label="Decision reason">
              <textarea
                name="decisionReason"
                required
                className={textareaClass}
                defaultValue={item.triageDecisionReason}
              />
            </FormField>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Saving…" : "Save decision"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
