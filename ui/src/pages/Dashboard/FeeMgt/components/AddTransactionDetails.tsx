import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { useSchoolId } from "@/contexts/SchoolContext"
import type { SchoolTransactionI } from "@/api/feeManagement.api/types"
import GuardianChildSelect from "./GuardianChildSelect"
import { useSchoolMoney } from "@/hooks/useSchoolMoney"

type Props = {
  open: boolean
  onClose: () => void
  transaction: SchoolTransactionI | null
  onSave: (data: { studentId: string; amount: number }) => void
  isPending?: boolean
}

export default function AllocateTransactionModal({
  open,
  onClose,
  transaction,
  onSave,
  isPending,
}: Props) {
  const schoolId = useSchoolId()
  const { currencyCode, formatMoney } = useSchoolMoney()
  const [guardianId, setGuardianId] = useState(transaction?.guardianId ?? "")
  const [studentId, setStudentId] = useState("")
  const [amount, setAmount] = useState(
    transaction ? String(transaction.netAmount) : ""
  )

  if (!open || !transaction) return null

  const canSave = studentId && parseFloat(amount) > 0

  const handleSave = () => {
    if (!canSave) return
    onSave({ studentId, amount: parseFloat(amount) })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Allocate transaction"
      tabIndex={-1}
      onKeyDown={(event) => event.key === "Escape" && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
    >
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Allocate transaction
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Assign this payment to a student
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          {/* Linked transaction summary */}
          <div className="rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3">
            <p className="text-xs text-muted-foreground">Linked transaction</p>
            <p className="mt-0.5 text-sm font-medium text-gray-800">
              {formatMoney(transaction.netAmount)} &middot;{" "}
              {transaction.description}
            </p>
          </div>

          <GuardianChildSelect
            schoolId={schoolId}
            guardianId={guardianId}
            onGuardianChange={setGuardianId}
            studentId={studentId}
            onStudentChange={(id) => setStudentId(id)}
          />

          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">
              Amount to allocate ({currencyCode})
            </Label>
            <Input
              type="number"
              className="h-9 rounded-xl text-sm"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="rounded-lg"
            onClick={handleSave}
            disabled={!canSave || isPending}
          >
            {isPending ? "Saving..." : "Save allocation"}
          </Button>
        </div>
      </div>
    </div>
  )
}
