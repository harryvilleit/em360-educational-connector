import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"
import { useSchoolId } from "@/contexts/SchoolContext"
import {
  TransactionCategory,
  TransactionMode,
} from "@/api/feeManagement.api/types"
import type { CreateSchoolTransactionPayloadI } from "@/api/feeManagement.api/types"
import { useGetSchoolTransactionTypes } from "@/hooks/feeManagement"
import GuardianChildSelect from "./GuardianChildSelect"
import SessionTermClassSelect from "./SessionTermClassSelect"
import TransactionTypeSelect from "./TransactionTypeSelect"
import { getTransactionModeLabel, isTransactionTypeActive } from "../utils"
import { useSchoolMoney } from "@/hooks/useSchoolMoney"

interface Props {
  open: boolean
  onClose: () => void
  onSave: (payload: Omit<CreateSchoolTransactionPayloadI, "schoolId">) => void
  isPending?: boolean
}

const CATEGORIES = [TransactionCategory.Income, TransactionCategory.Expense]
const MODES = [TransactionMode.Cash, TransactionMode.Transfer]

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
      <AlertCircle className="size-3 shrink-0" />
      {message}
    </p>
  )
}

const emptyErrors = {
  guardian: "",
  session: "",
  term: "",
  type: "",
  amount: "",
  description: "",
}

export default function AddTransactionModal({
  open,
  onClose,
  onSave,
  isPending,
}: Props) {
  const schoolId = useSchoolId()
  const { currencyCode } = useSchoolMoney()

  const [guardianId, setGuardianId] = useState("")
  const [sessionId, setSessionId] = useState("")
  const [termId, setTermId] = useState("")
  const [mode, setMode] = useState<TransactionMode>(TransactionMode.Cash)
  const [category, setCategory] = useState<TransactionCategory>(
    TransactionCategory.Income
  )
  // null = "not yet touched by the user" — defaults to the first active
  // transaction type once the list loads, same pattern as the guardian
  // auto-resolution below.
  const [schoolTransactionTypeId, setSchoolTransactionTypeId] = useState<
    string | null
  >(null)
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [errors, setErrors] = useState(emptyErrors)

  const { transactionTypes } = useGetSchoolTransactionTypes({ schoolId })
  const firstActiveTypeId =
    transactionTypes.find((t) => isTransactionTypeActive(t.status))?.id ?? ""
  const effectiveTypeId = schoolTransactionTypeId ?? firstActiveTypeId

  const reset = () => {
    setGuardianId("")
    setSessionId("")
    setTermId("")
    setMode(TransactionMode.Cash)
    setCategory(TransactionCategory.Income)
    setSchoolTransactionTypeId(null)
    setAmount("")
    setDescription("")
    setErrors(emptyErrors)
  }

  const validate = () => {
    const next = { ...emptyErrors }
    if (!guardianId) next.guardian = "Select a guardian."
    if (!sessionId) next.session = "Select a session."
    if (!termId) next.term = "Select a term."
    if (!effectiveTypeId) next.type = "Select a transaction type."
    if (!amount || parseFloat(amount) <= 0)
      next.amount = "Enter a valid amount."
    if (!description.trim()) next.description = "Description is required."
    setErrors(next)
    return Object.values(next).every((v) => !v)
  }

  const handleSubmit = () => {
    if (!validate()) return
    onSave({
      guardianId,
      sessionId,
      termId,
      transactionCategory: category,
      schoolTransactionTypeId: effectiveTypeId,
      transactionMode: mode,
      transactionSource: 1,
      amount: parseFloat(amount),
      description,
    })
    reset()
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl p-4 sm:max-w-lg sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900">
            Add Transaction
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <GuardianChildSelect
            schoolId={schoolId}
            guardianId={guardianId}
            onGuardianChange={setGuardianId}
            showStudent={false}
            guardianError={errors.guardian}
          />

          <SessionTermClassSelect
            schoolId={schoolId}
            sessionId={sessionId}
            onSessionChange={setSessionId}
            termId={termId}
            onTermChange={setTermId}
            sessionError={errors.session}
            termError={errors.term}
          />

          {/* Category */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Category <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                    category === c
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {c === TransactionCategory.Income ? "Income" : "Expense"}
                </button>
              ))}
            </div>
          </div>

          <TransactionTypeSelect
            schoolId={schoolId}
            value={effectiveTypeId}
            onChange={setSchoolTransactionTypeId}
            error={errors.type}
          />

          {/* Mode */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Transaction Mode <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              {MODES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                    mode === m
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {getTransactionModeLabel(m)}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Amount ({currencyCode}) <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value)
                setErrors((p) => ({ ...p, amount: "" }))
              }}
              placeholder="0.00"
              className={`w-full rounded-md ${errors.amount ? "border-red-400" : "border-gray-200"}`}
            />
            <FieldError message={errors.amount} />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </Label>
            <Input
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                setErrors((p) => ({ ...p, description: "" }))
              }}
              placeholder="e.g. School fees collection"
              className={`w-full rounded-md ${errors.description ? "border-red-400" : "border-gray-200"}`}
            />
            <FieldError message={errors.description} />
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="w-full rounded-md border-gray-200 sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="w-full rounded-md bg-blue-600 text-white hover:bg-blue-700 sm:w-auto"
          >
            {isPending ? "Saving..." : "Save Transaction"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
