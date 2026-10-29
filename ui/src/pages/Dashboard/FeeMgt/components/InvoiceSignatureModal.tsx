import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useInvoiceSignatureStore } from "@/store/invoiceSignature.store"

interface InvoiceSignatureModalProps {
  open: boolean
  onClose: () => void
}

/** Set once per school — name + title rendered onto every invoice's
 * "Authorised Signature" line from then on (Admin and Parent PDFs alike). */
export default function InvoiceSignatureModal({
  open,
  onClose,
}: InvoiceSignatureModalProps) {
  const schoolId = useSchoolId()
  const signature = useInvoiceSignatureStore((s) => s.getSignature(schoolId))
  const setSignature = useInvoiceSignatureStore((s) => s.setSignature)

  const [name, setName] = useState(signature?.name ?? "")
  const [title, setTitle] = useState(signature?.title ?? "")
  const [error, setError] = useState("")

  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setName(signature?.name ?? "")
      setTitle(signature?.title ?? "")
      setError("")
    }
  }

  function handleSave() {
    if (!name.trim()) {
      setError("Enter a name.")
      return
    }
    setSignature(schoolId, { name: name.trim(), title: title.trim() })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900">
            Invoice Signature
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            This name and title will appear as the authorised signature on
            every invoice generated for this school, for both admin and
            parent downloads.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">Name</Label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Adaeze Okoro"
              className="w-full rounded-md border-gray-200"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Title (optional)
            </Label>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Bursar"
              className="w-full rounded-md border-gray-200"
            />
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-xl py-5"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1 rounded-xl bg-blue-600 py-5 text-white hover:bg-blue-700"
            onClick={handleSave}
          >
            Save Signature
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
