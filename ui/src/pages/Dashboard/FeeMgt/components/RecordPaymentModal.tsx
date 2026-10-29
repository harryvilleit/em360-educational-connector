import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle2 } from "lucide-react"
import { useSchoolId } from "@/contexts/SchoolContext"
import { useGetStudentById } from "@/hooks/studentPortal"
import {
  useCreateSchoolTransaction,
  useAllocateTransaction,
  useGetSchoolTransactionTypes,
} from "@/hooks/feeManagement"
import {
  TransactionCategory,
  TransactionMode,
} from "@/api/feeManagement.api/types"
import GuardianChildSelect from "./GuardianChildSelect"
import SessionTermClassSelect from "./SessionTermClassSelect"
import TransactionTypeSelect from "./TransactionTypeSelect"
import { getTransactionModeLabel, isTransactionTypeActive } from "../utils"
import { useSchoolMoney } from "@/hooks/useSchoolMoney"

interface RecordPaymentModalInitialValues {
  studentId?: string
  sessionId?: string
  termId?: string
}

interface RecordPaymentModalProps {
  open: boolean
  onClose: () => void
  initialValues?: RecordPaymentModalInitialValues
}

const MODES = [TransactionMode.Cash, TransactionMode.Transfer]

export default function RecordPaymentModal({
  open,
  onClose,
  initialValues,
}: RecordPaymentModalProps) {
  const schoolId = useSchoolId()
  const { currencyCode, formatMoney } = useSchoolMoney()

  // `guardianId === null` means "not yet touched by the user" — the auto-
  // resolved guardian (below) fills in until the user explicitly picks one,
  // at which point their choice wins even if it's an empty string (cleared).
  const [guardianId, setGuardianId] = useState<string | null>(null)
  const [studentId, setStudentId] = useState("")
  const [sessionId, setSessionId] = useState("")
  const [termId, setTermId] = useState("")
  const [amount, setAmount] = useState("")
  const [mode, setMode] = useState<TransactionMode>(TransactionMode.Cash)
  // null = "not yet touched by the user" — defaults to the first active
  // transaction type once the list loads, same pattern as guardianId above.
  const [schoolTransactionTypeId, setSchoolTransactionTypeId] = useState<
    string | null
  >(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  // Reset the form when the dialog transitions to open — done during render
  // (React's documented pattern for adjusting state from a prop change)
  // rather than in an effect, so it doesn't cause an extra commit.
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setStudentId(initialValues?.studentId ?? "")
      setSessionId(initialValues?.sessionId ?? "")
      setTermId(initialValues?.termId ?? "")
      setGuardianId(null)
      setAmount("")
      setMode(TransactionMode.Cash)
      setSchoolTransactionTypeId(null)
      setErrors({})
      setSubmitted(false)
    }
  }

  // Payment Reminder only hands us a studentId, not a guardianId — resolve
  // the guardian from the student record so the picker pre-fills correctly,
  // without fighting a guardian the user explicitly picked/cleared.
  const { student: resolvedStudent } = useGetStudentById({
    studentId: initialValues?.studentId ?? "",
    schoolId,
  })
  const autoGuardianId = resolvedStudent?.guardians?.[0]?.id ?? ""
  const effectiveGuardianId = guardianId ?? autoGuardianId

  const { transactionTypes } = useGetSchoolTransactionTypes({ schoolId })
  const firstActiveTypeId =
    transactionTypes.find((t) => isTransactionTypeActive(t.status))?.id ?? ""
  const effectiveTypeId = schoolTransactionTypeId ?? firstActiveTypeId

  const { createSchoolTransactionAsync, isPending: isCreating } =
    useCreateSchoolTransaction()
  const { allocateTransactionAsync, isPending: isAllocating } =
    useAllocateTransaction()
  const isPending = isCreating || isAllocating

  const validate = () => {
    const next: Record<string, string> = {}
    if (!effectiveGuardianId) next.guardian = "Select a guardian."
    if (!studentId) next.student = "Select a student."
    if (!sessionId) next.session = "Select a session."
    if (!termId) next.term = "Select a term."
    if (!effectiveTypeId) next.type = "Select a transaction type."
    if (!amount || parseFloat(amount) <= 0)
      next.amount = "Enter a valid amount."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    try {
      const created = await createSchoolTransactionAsync({
        schoolId,
        guardianId: effectiveGuardianId,
        sessionId,
        termId,
        transactionCategory: TransactionCategory.Income,
        schoolTransactionTypeId: effectiveTypeId,
        transactionMode: mode,
        transactionSource: 1,
        amount: parseFloat(amount),
        description: "Fee payment",
      })
      await allocateTransactionAsync({
        transactionId: created.value.id,
        allocations: [{ studentId, amount: parseFloat(amount) }],
      })
      setSubmitted(true)
    } catch {
      // the underlying mutations already surface a toast on failure
    }
  }

  const handleClose = () => onClose()

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:max-w-lg">
        {submitted ? (
          <div className="flex flex-col items-center gap-5 py-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
              <CheckCircle2 className="size-8 text-green-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900">Wallet Funded</h3>
              <p className="text-sm text-muted-foreground">
                {formatMoney(Number(amount) || 0)} has been added to the
                student's wallet.
              </p>
            </div>
            <Button
              className="w-full rounded-xl bg-blue-600 py-5 text-white hover:bg-blue-700"
              onClick={handleClose}
            >
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-gray-900">
                Fund Wallet
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Credit a student's wallet with a payment.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-2 space-y-4">
              <GuardianChildSelect
                schoolId={schoolId}
                guardianId={effectiveGuardianId}
                onGuardianChange={setGuardianId}
                studentId={studentId}
                onStudentChange={(id) => setStudentId(id)}
                guardianError={errors.guardian}
                studentError={errors.student}
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

              <TransactionTypeSelect
                schoolId={schoolId}
                value={effectiveTypeId}
                onChange={setSchoolTransactionTypeId}
                error={errors.type}
              />

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Amount Paid ({currencyCode})
                </Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 50000"
                  className={`w-full rounded-md ${errors.amount ? "border-red-400" : "border-gray-200"}`}
                />
                {errors.amount && (
                  <p className="text-xs text-red-500">{errors.amount}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">
                  Payment Mode
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
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-xl py-5"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isPending}
                className="flex-1 rounded-xl bg-blue-600 py-5 text-white hover:bg-blue-700"
                onClick={handleSubmit}
              >
                {isPending ? "Funding..." : "Fund Wallet"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
