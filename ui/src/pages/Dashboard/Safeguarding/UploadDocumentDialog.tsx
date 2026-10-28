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
import { useUploadSafeguardingDocument } from "@/hooks/safeguarding"
import type { SafeguardingDocumentCategory } from "@/api/safeguarding.api"
import { FormField } from "./components"
import { inputClass, labelFromCode } from "./utils"
import type { DialogProps } from "./caseDialogTypes"

export default function UploadDocumentDialog({
  open,
  onClose,
  schoolId,
  item,
}: DialogProps) {
  const mutation = useUploadSafeguardingDocument()
  const [category, setCategory] =
    useState<SafeguardingDocumentCategory>("ConcernEvidence")
  const [title, setTitle] = useState("")
  const [file, setFile] = useState<File>()
  function submit(e: FormEvent) {
    e.preventDefault()
    if (!file) return
    mutation.mutate(
      { schoolId, caseId: item.id, category, title, file },
      { onSuccess: onClose }
    )
  }
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload confidential document</DialogTitle>
          <DialogDescription>
            PDF, Word, JPG or PNG; maximum 20 MB. The upload is recorded in the
            case audit trail.
          </DialogDescription>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={submit}>
          <FormField label="Document category">
            <select
              className={inputClass}
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as SafeguardingDocumentCategory)
              }
            >
              {[
                "ConcernEvidence",
                "ChronologyEvidence",
                "ReferralCorrespondence",
                "MultiAgencyRecord",
                "SafetyPlanEvidence",
                "Other",
              ].map((x) => (
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
          <FormField label="File">
            <input
              required
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className={inputClass}
              type="file"
              onChange={(e) => setFile(e.target.files?.[0])}
            />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!file || mutation.isPending}
            >
              {mutation.isPending ? "Uploading…" : "Upload document"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
