import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertCircle, Loader2 } from "lucide-react"
import {
  useCreateSchoolTransactionType,
  useUpdateSchoolTransactionType,
} from "@/hooks/feeManagement"
import type { SchoolTransactionTypeI } from "@/api/feeManagement.api/types"

interface FormState {
  name: string
  description: string
}

const empty = (): FormState => ({ name: "", description: "" })

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
      <AlertCircle className="size-3 shrink-0" />
      {message}
    </p>
  )
}

interface Props {
  open: boolean
  onClose: () => void
  editing: SchoolTransactionTypeI | null
  schoolId: string
}

export default function TransactionTypeModal({
  open,
  onClose,
  editing,
  schoolId,
}: Props) {
  const { createSchoolTransactionType, isPending: isCreating } =
    useCreateSchoolTransactionType({ onSuccess: onClose })
  const { updateSchoolTransactionType, isPending: isUpdating } =
    useUpdateSchoolTransactionType({ onSuccess: onClose })
  const isPending = isCreating || isUpdating

  const [form, setForm] = useState<FormState>(empty())
  const [errors, setErrors] = useState<FormState>(empty())

  // Reset the form when the dialog transitions to open — done during render
  // (React's documented pattern for adjusting state from a prop change)
  // rather than in an effect, so it doesn't cause an extra commit.
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setForm(
        editing
          ? { name: editing.name, description: editing.description }
          : empty()
      )
      setErrors(empty())
    }
  }

  const handleSave = () => {
    const nextErrors = empty()
    if (!form.name.trim()) nextErrors.name = "Transaction type name is required."
    if (!form.description.trim())
      nextErrors.description = "Description is required."
    setErrors(nextErrors)
    if (nextErrors.name || nextErrors.description) return

    const name = form.name.trim()
    const description = form.description.trim()

    if (editing) {
      updateSchoolTransactionType({ id: editing.id, schoolId, name, description })
    } else {
      createSchoolTransactionType({ schoolId, name, description })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full rounded-2xl p-4 sm:max-w-md sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900">
            {editing ? "Edit Transaction Type" : "Add Transaction Type"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Type Name <span className="text-red-500">*</span>
            </Label>
            <Input
              value={form.name}
              onChange={(e) => {
                setForm((p) => ({ ...p, name: e.target.value }))
                setErrors((p) => ({ ...p, name: "" }))
              }}
              placeholder="e.g. Tuition Fee, Sports Uniform, Excursion"
              className={`rounded-md ${errors.name ? "border-red-400" : "border-gray-200"}`}
            />
            <FieldError message={errors.name} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={form.description}
              onChange={(e) => {
                setForm((p) => ({ ...p, description: e.target.value }))
                setErrors((p) => ({ ...p, description: "" }))
              }}
              placeholder="What this transaction type is used for"
              rows={3}
              className={`resize-none rounded-md ${errors.description ? "border-red-400" : "border-gray-200"}`}
            />
            <FieldError message={errors.description} />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="w-full rounded-md border-gray-200 sm:w-auto"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="w-full rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 sm:w-auto"
            onClick={handleSave}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-1.5 size-4 animate-spin" />}
            {editing ? "Save Changes" : "Add Type"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
