import { useEffect, useState } from "react"
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
  useCreateSchoolPaymentMethods,
  useUpdateSchoolPaymentMethod,
} from "@/hooks/feeManagement"
import type { SchoolPaymentMethodI } from "@/api/feeManagement.api/types"
import { useSchoolMoney } from "@/hooks/useSchoolMoney"

interface FormState {
  name: string
  accountNumber: string
  currencyCode: string
  details: string
}

interface FormErrors {
  name?: string
  accountNumber?: string
  currencyCode?: string
  details?: string
}

const empty = (currencyCode: string): FormState => ({
  name: "",
  accountNumber: "",
  currencyCode,
  details: "",
})

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
  editing: SchoolPaymentMethodI | null
  schoolId: string
}

export default function PaymentMethodFormModal({
  open,
  onClose,
  editing,
  schoolId,
}: Props) {
  const { currencyCode } = useSchoolMoney()
  const { createSchoolPaymentMethodsAsync, isPending: isCreating } =
    useCreateSchoolPaymentMethods()
  const { updateSchoolPaymentMethodAsync, isPending: isUpdating } =
    useUpdateSchoolPaymentMethod()

  const [form, setForm] = useState<FormState>(() => empty(currencyCode))
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    if (!open) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(
      editing
        ? {
            name: editing.name,
            accountNumber: editing.accountNumber,
            currencyCode: editing.currencyCode,
            details: editing.details,
          }
        : empty(currencyCode)
    )
    setErrors({})
  }, [open, editing, currencyCode])

  const set = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  const validate = (): boolean => {
    const next: FormErrors = {}
    if (!form.name.trim()) next.name = "Method name is required."
    if (!form.accountNumber.trim())
      next.accountNumber = "Account number is required."
    if (!form.currencyCode.trim())
      next.currencyCode = "Currency code is required."
    if (!form.details.trim()) next.details = "Payment details are required."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    if (editing) {
      await updateSchoolPaymentMethodAsync({
        id: editing.id,
        accountNumber: form.accountNumber,
        name: form.name,
        details: form.details,
        currencyCode: form.currencyCode,
        status: editing.status,
      })
    } else {
      await createSchoolPaymentMethodsAsync({
        schoolId,
        items: [
          {
            accountNumber: form.accountNumber,
            name: form.name,
            details: form.details,
            currencyCode: form.currencyCode,
          },
        ],
      })
    }
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full rounded-2xl p-4 sm:max-w-md sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900">
            {editing ? "Edit Payment Method" : "Add Payment Method"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Method Name <span className="text-red-500">*</span>
            </Label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. GTBank Transfer, Cash, POS"
              className={`rounded-md ${errors.name ? "border-red-400" : "border-gray-200"}`}
            />
            <FieldError message={errors.name} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Account Number <span className="text-red-500">*</span>
              </Label>
              <Input
                value={form.accountNumber}
                onChange={(e) => set("accountNumber", e.target.value)}
                placeholder="0123456789"
                className={`rounded-md ${errors.accountNumber ? "border-red-400" : "border-gray-200"}`}
              />
              <FieldError message={errors.accountNumber} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">
                Currency Code <span className="text-red-500">*</span>
              </Label>
              <Input
                value={form.currencyCode}
                onChange={(e) => set("currencyCode", e.target.value)}
                placeholder={currencyCode}
                className={`rounded-md ${errors.currencyCode ? "border-red-400" : "border-gray-200"}`}
              />
              <FieldError message={errors.currencyCode} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Payment Details <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={form.details}
              onChange={(e) => set("details", e.target.value)}
              placeholder={
                "e.g. Bank: GTBank\nAccount Name: Greenfield Academy\nAccount No: 0123456789"
              }
              rows={4}
              className={`resize-none rounded-md ${errors.details ? "border-red-400" : "border-gray-200"}`}
            />
            <FieldError message={errors.details} />
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
            disabled={isCreating || isUpdating}
          >
            {(isCreating || isUpdating) && (
              <Loader2 className="mr-1.5 size-4 animate-spin" />
            )}
            {editing ? "Save Changes" : "Add Method"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
