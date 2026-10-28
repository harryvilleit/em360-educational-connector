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
import { useCloseSafeguardingCase, useTriageSafeguardingCase } from "@/hooks/safeguarding"
import type { SafeguardingCaseStatus, SafeguardingRiskLevel } from "@/api/safeguarding.api"
import { FormField } from "./components"
import {
  inputClass,
  labelFromCode,
  textareaClass,
  toLocalDateTimeInput,
} from "./utils"
import type { DialogProps } from "./caseDialogTypes"

export function TriageDialog({ open, onClose, schoolId, item }: DialogProps) {
  const mutation = useTriageSafeguardingCase()
  const [status, setStatus] = useState<SafeguardingCaseStatus>(
    item.status === "Closed" || item.status === "Submitted"
      ? "Open"
      : item.status
  )
  const [risk, setRisk] = useState<SafeguardingRiskLevel>(
    item.riskLevel === "NotAssessed" ? "Medium" : item.riskLevel
  )
  const [assignedName, setAssignedName] = useState(item.assignedToName ?? "")
  const [summary, setSummary] = useState(item.triageSummary ?? "")
  const [immediateAction, setImmediateAction] = useState(
    item.immediateActionTaken ?? ""
  )
  const [nextAction, setNextAction] = useState(
    item.nextActionDueAtUtc
      ? toLocalDateTimeInput(new Date(item.nextActionDueAtUtc))
      : ""
  )
  function submit(e: FormEvent) {
    e.preventDefault()
    mutation.mutate(
      {
        schoolId,
        caseId: item.id,
        status,
        riskLevel: risk,
        assignedToName: assignedName || undefined,
        triageSummary: summary,
        immediateActionTaken: immediateAction || undefined,
        nextActionDueAtUtc: nextAction
          ? new Date(nextAction).toISOString()
          : undefined,
      },
      { onSuccess: onClose }
    )
  }
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Triage safeguarding case</DialogTitle>
          <DialogDescription>
            Assess risk, decide the route and record the professional rationale.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Status">
              <select
                className={inputClass}
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as SafeguardingCaseStatus)
                }
              >
                {[
                  "AwaitingTriage",
                  "Open",
                  "Monitoring",
                  "ReferredExternally",
                ].map((x) => (
                  <option key={x} value={x}>
                    {labelFromCode(x)}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Risk level">
              <select
                className={inputClass}
                value={risk}
                onChange={(e) =>
                  setRisk(e.target.value as SafeguardingRiskLevel)
                }
              >
                {["Low", "Medium", "High", "Critical"].map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Assigned safeguarding lead">
              <input
                className={inputClass}
                value={assignedName}
                onChange={(e) => setAssignedName(e.target.value)}
              />
            </FormField>
            <FormField label="Next action due">
              <input
                className={inputClass}
                type="datetime-local"
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
              />
            </FormField>
          </div>
          <FormField label="Triage summary">
            <textarea
              required
              className={textareaClass}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </FormField>
          <FormField label="Immediate action already taken">
            <textarea
              className={textareaClass}
              value={immediateAction}
              onChange={(e) => setImmediateAction(e.target.value)}
            />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Saving…" : "Save triage"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function CloseCaseDialog({
  open,
  onClose,
  schoolId,
  item,
}: DialogProps) {
  const mutation = useCloseSafeguardingCase()
  const [summary, setSummary] = useState("")
  function submit(e: FormEvent) {
    e.preventDefault()
    mutation.mutate(
      { schoolId, caseId: item.id, closureSummary: summary },
      { onSuccess: onClose }
    )
  }
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Close safeguarding case?</DialogTitle>
          <DialogDescription>
            Every open action must be completed or cancelled first. Active
            safety plans will close.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={submit}>
          <FormField label="Closure rationale">
            <textarea
              required
              className={textareaClass}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Closing…" : "Close case"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
