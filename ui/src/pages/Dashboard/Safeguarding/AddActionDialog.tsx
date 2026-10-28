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
import { useAddSafeguardingAction } from "@/hooks/safeguarding"
import type { SafeguardingActionType } from "@/api/safeguarding.api"
import { FormField } from "./components"
import {
  actionTypes,
  inputClass,
  labelFromCode,
  textareaClass,
} from "./utils"
import type { DialogProps } from "./caseDialogTypes"

export default function AddActionDialog({
  open,
  onClose,
  schoolId,
  item,
}: DialogProps) {
  const mutation = useAddSafeguardingAction()
  const [type, setType] = useState<SafeguardingActionType>("ImmediateSafety")
  const [title, setTitle] = useState("")
  const [details, setDetails] = useState("")
  const [owner, setOwner] = useState("")
  const [due, setDue] = useState("")
  function submit(e: FormEvent) {
    e.preventDefault()
    mutation.mutate(
      {
        schoolId,
        caseId: item.id,
        type,
        title,
        details,
        assignedToName: owner || undefined,
        dueAtUtc: due ? new Date(due).toISOString() : undefined,
      },
      { onSuccess: onClose }
    )
  }
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add safeguarding action</DialogTitle>
          <DialogDescription>
            Create an owned, dated follow-up for this case.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={submit}>
          <FormField label="Action type">
            <select
              className={inputClass}
              value={type}
              onChange={(e) =>
                setType(e.target.value as SafeguardingActionType)
              }
            >
              {actionTypes.map((x) => (
                <option key={x} value={x}>
                  {labelFromCode(x)}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Title">
            <input
              required
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormField>
          <FormField label="Details">
            <textarea
              required
              className={textareaClass}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Owner">
              <input
                className={inputClass}
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
              />
            </FormField>
            <FormField label="Due">
              <input
                className={inputClass}
                type="datetime-local"
                value={due}
                onChange={(e) => setDue(e.target.value)}
              />
            </FormField>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Saving…" : "Add action"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
