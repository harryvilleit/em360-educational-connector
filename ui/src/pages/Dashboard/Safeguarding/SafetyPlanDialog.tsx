import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSaveSafeguardingSafetyPlan } from "@/hooks/safeguarding"
import { FormField } from "./components"
import {
  inputClass,
  textareaClass,
  toLocalDateInput,
} from "./utils"
import type { DialogProps } from "./caseDialogTypes"

export default function SafetyPlanDialog({
  open,
  onClose,
  schoolId,
  item,
}: DialogProps) {
  const mutation = useSaveSafeguardingSafetyPlan()
  const today = toLocalDateInput(new Date())
  const [title, setTitle] = useState("")
  const [risks, setRisks] = useState("")
  const [actions, setActions] = useState("")
  const [adults, setAdults] = useState("")
  const [instructions, setInstructions] = useState("")
  const [startDate, setStartDate] = useState(today)
  const [reviewDate, setReviewDate] = useState(today)
  const [activate, setActivate] = useState(false)
  function submit(e: FormEvent) {
    e.preventDefault()
    mutation.mutate(
      {
        schoolId,
        caseId: item.id,
        title,
        immediateRisks: risks,
        protectiveActions: actions,
        trustedAdults: adults || undefined,
        learnerInstructions: instructions || undefined,
        startDate,
        reviewDate,
        activate,
      },
      { onSuccess: onClose }
    )
  }
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create safety plan</DialogTitle>
          <DialogDescription>
            Saving a new active version supersedes the previous active plan.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={submit}>
          <FormField label="Plan title">
            <input
              required
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormField>
          <FormField label="Immediate risks">
            <textarea
              required
              className={textareaClass}
              value={risks}
              onChange={(e) => setRisks(e.target.value)}
            />
          </FormField>
          <FormField label="Protective actions">
            <textarea
              required
              className={textareaClass}
              value={actions}
              onChange={(e) => setActions(e.target.value)}
            />
          </FormField>
          <FormField label="Trusted adults">
            <textarea
              className={textareaClass}
              value={adults}
              onChange={(e) => setAdults(e.target.value)}
            />
          </FormField>
          <FormField label="Instructions agreed with the learner">
            <textarea
              className={textareaClass}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Start date">
              <input
                required
                type="date"
                className={inputClass}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </FormField>
            <FormField label="Review date">
              <input
                required
                type="date"
                min={startDate}
                className={inputClass}
                value={reviewDate}
                onChange={(e) => setReviewDate(e.target.value)}
              />
            </FormField>
          </div>
          <label className="flex items-center gap-3 rounded-lg border p-3 text-sm">
            <Checkbox
              checked={activate}
              onCheckedChange={(v) => setActivate(v === true)}
            />
            Activate this plan immediately
          </label>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Saving…" : "Save safety plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
