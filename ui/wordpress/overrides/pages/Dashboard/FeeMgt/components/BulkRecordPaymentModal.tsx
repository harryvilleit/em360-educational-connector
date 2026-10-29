// WordPress version: retries never record the same payment twice.
import { useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
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
import { CheckCircle2, XCircle, Loader2, Wallet } from "lucide-react"
import { useSchoolId } from "@/contexts/SchoolContext"
import { getStudentByIdApi } from "@/api/studentPortal.api"
import {
  useCreateSchoolTransaction,
  useAllocateTransaction,
  useGetSchoolTransactionTypes,
} from "@/hooks/feeManagement"
import {
  TransactionCategory,
  TransactionMode,
} from "@/api/feeManagement.api/types"
import type { PaymentReminderBillI } from "@/api/feeManagement.api/types"
import { queryKeys } from "@/utils/queryKeys"
import TransactionTypeSelect from "@/pages/Dashboard/FeeMgt/components/TransactionTypeSelect"
import { getTransactionModeLabel, isTransactionTypeActive } from "@/pages/Dashboard/FeeMgt/utils"
import { useSchoolMoney } from "@/hooks/useSchoolMoney"

interface BulkRecordPaymentModalProps {
  open: boolean
  onClose: () => void
  students: PaymentReminderBillI[]
  sessionId: string
  termId: string
  // Called once the "Done" button is pressed after a completed run, so the
  // caller can clear its selection / let the reminder list re-fetch.
  onDone: () => void
}

type RowStatus = "idle" | "pending" | "success" | "error"

const MODES = [TransactionMode.Cash, TransactionMode.Transfer]

export default function BulkRecordPaymentModal({
  open,
  onClose,
  students,
  sessionId,
  termId,
  onDone,
}: BulkRecordPaymentModalProps) {
  const schoolId = useSchoolId()
  const { formatMoney } = useSchoolMoney()
  const queryClient = useQueryClient()

  const [amounts, setAmounts] = useState<Record<string, string>>({})
  const [mode, setMode] = useState<TransactionMode>(TransactionMode.Cash)
  // null = "not yet touched by the user" — defaults to the first active
  // transaction type once the list loads.
  const [schoolTransactionTypeId, setSchoolTransactionTypeId] = useState<
    string | null
  >(null)
  const [statuses, setStatuses] = useState<Record<string, RowStatus>>({})
  const [errorMessages, setErrorMessages] = useState<Record<string, string>>({})
  const [phase, setPhase] = useState<"form" | "processing" | "done">("form")
  // Payments already recorded for a student; a retry only completes the allocation.
  const recorded = useRef<Record<string, string>>({})

  // Reset the form each time the dialog opens for a new selection — done
  // during render (React's documented pattern for adjusting state from a
  // prop change) rather than in an effect, so it lands in the same commit
  // the dialog opens in.
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setAmounts(
        Object.fromEntries(
          students.map((s) => [
            s.studentId,
            s.outstandingBalance > 0 ? String(s.outstandingBalance) : "",
          ])
        )
      )
      setMode(TransactionMode.Cash)
      setSchoolTransactionTypeId(null)
      setStatuses({})
      setErrorMessages({})
      recorded.current = {}
      setPhase("form")
    }
  }

  const { transactionTypes } = useGetSchoolTransactionTypes({ schoolId })
  const firstActiveTypeId =
    transactionTypes.find((t) => isTransactionTypeActive(t.status))?.id ?? ""
  const effectiveTypeId = schoolTransactionTypeId ?? firstActiveTypeId

  const { createSchoolTransactionAsync } = useCreateSchoolTransaction()
  const { allocateTransactionAsync } = useAllocateTransaction()

  const isProcessing = phase === "processing"

  const payableStudents = students.filter(
    (s) => (parseFloat(amounts[s.studentId]) || 0) > 0
  )
  const total = payableStudents.reduce(
    (sum, s) => sum + (parseFloat(amounts[s.studentId]) || 0),
    0
  )
  const successCount = students.filter(
    (s) => statuses[s.studentId] === "success"
  ).length
  const failedStudents = students.filter(
    (s) => statuses[s.studentId] === "error"
  )

  function setAmount(studentId: string, value: string) {
    setAmounts((p) => ({ ...p, [studentId]: value }))
  }

  async function payStudent(student: PaymentReminderBillI) {
    const amount = parseFloat(amounts[student.studentId]) || 0
    if (amount <= 0) return

    setStatuses((p) => ({ ...p, [student.studentId]: "pending" }))
    try {
      const studentRes = await queryClient.fetchQuery({
        queryKey: [
          queryKeys.studentById,
          { studentId: student.studentId, schoolId },
        ],
        queryFn: () =>
          getStudentByIdApi({ studentId: student.studentId, schoolId }),
      })
      const guardianId = studentRes.value?.guardians?.[0]?.id
      if (!guardianId) {
        throw new Error("No guardian on record for this student")
      }

      const existing = recorded.current[student.studentId]
      const created = existing
        ? { value: { id: existing } }
        : await createSchoolTransactionAsync({
        schoolId,
        guardianId,
        sessionId,
        termId,
        transactionCategory: TransactionCategory.Income,
        schoolTransactionTypeId: effectiveTypeId,
        transactionMode: mode,
        transactionSource: 1,
        amount,
        description: `Fee payment - ${student.studentName}`,
      })
      recorded.current[student.studentId] = created.value.id
      await allocateTransactionAsync({
        transactionId: created.value.id,
        allocations: [{ studentId: student.studentId, amount }],
      })
      setStatuses((p) => ({ ...p, [student.studentId]: "success" }))
    } catch (err) {
      setStatuses((p) => ({ ...p, [student.studentId]: "error" }))
      setErrorMessages((p) => ({
        ...p,
        [student.studentId]: recorded.current[student.studentId]
          ? "Payment recorded; retry allocation or complete it in Book Keeping."
          : err instanceof Error
            ? err.message
            : "Payment failed",
      }))
    }
  }

  // Each student is its own create-transaction + allocate pair (there's no
  // bulk-pay endpoint, and a single SchoolTransaction only carries one
  // guardianId, which can differ per student) — run them one at a time so
  // the row statuses update progressively instead of all flipping at once.
  async function handleSubmit(retryFailedOnly = false) {
    setPhase("processing")
    const targets = payableStudents.filter((s) =>
      retryFailedOnly ? statuses[s.studentId] === "error" : true
    )
    for (const student of targets) {
      await payStudent(student)
    }
    queryClient.invalidateQueries({ queryKey: [queryKeys.paymentReminders] })
    setPhase("done")
  }

  const handleClose = () => {
    if (isProcessing) return
    if (phase === "done") onDone()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:max-w-xl">
        {phase === "done" ? (
          <div className="flex flex-col items-center gap-5 py-4 text-center">
            <div
              className={`flex h-16 w-16 items-center justify-center rounded-full ${
                failedStudents.length === 0 ? "bg-green-50" : "bg-amber-50"
              }`}
            >
              {failedStudents.length === 0 ? (
                <CheckCircle2 className="size-8 text-green-600" />
              ) : (
                <XCircle className="size-8 text-amber-600" />
              )}
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-gray-900">
                {failedStudents.length === 0
                  ? "Payments Recorded"
                  : "Some Payments Failed"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {successCount} of {payableStudents.length} student wallet
                {payableStudents.length === 1 ? "" : "s"} credited successfully.
              </p>
            </div>

            {failedStudents.length > 0 && (
              <div className="w-full space-y-1.5 rounded-xl border border-red-100 bg-red-50 p-3 text-left">
                {failedStudents.map((s) => (
                  <div
                    key={s.studentId}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="font-medium text-red-700">
                      {s.studentName}
                    </span>
                    <span className="text-red-500">
                      {errorMessages[s.studentId] ?? "Failed"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex w-full gap-3">
              {failedStudents.length > 0 && (
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl py-5"
                  onClick={() => handleSubmit(true)}
                >
                  Retry Failed ({failedStudents.length})
                </Button>
              )}
              <Button
                className="flex-1 rounded-xl bg-blue-600 py-5 text-white hover:bg-blue-700"
                onClick={handleClose}
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-gray-900">
                Make Payment
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Credit wallets for {students.length} selected student
                {students.length === 1 ? "" : "s"}. Amounts default to each
                student's outstanding balance — adjust as needed.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-2 space-y-4">
              <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-gray-100 p-2">
                {students.map((s) => {
                  const status = statuses[s.studentId] ?? "idle"
                  return (
                    <div
                      key={s.studentId}
                      className="flex items-center gap-3 rounded-lg px-2 py-1.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-800">
                          {s.studentName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {s.className} · {formatMoney(s.outstandingBalance)}{" "}
                          due
                        </p>
                      </div>
                      <Input
                        type="number"
                        value={amounts[s.studentId] ?? ""}
                        onChange={(e) => setAmount(s.studentId, e.target.value)}
                        disabled={isProcessing}
                        placeholder="0"
                        className="h-9 w-32 rounded-md border-gray-200 text-right"
                      />
                      <div className="w-4 shrink-0">
                        {status === "pending" && (
                          <Loader2 className="size-4 animate-spin text-blue-500" />
                        )}
                        {status === "success" && (
                          <CheckCircle2 className="size-4 text-green-600" />
                        )}
                        {status === "error" && (
                          <XCircle className="size-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  )
                })}
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
                      disabled={isProcessing}
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

              <TransactionTypeSelect
                schoolId={schoolId}
                value={effectiveTypeId}
                onChange={setSchoolTransactionTypeId}
              />

              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm">
                <span className="text-gray-500">
                  {payableStudents.length} student
                  {payableStudents.length === 1 ? "" : "s"} to pay
                </span>
                <span className="font-bold text-gray-900">
                  {formatMoney(total)}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-xl py-5"
                onClick={handleClose}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={
                  isProcessing ||
                  payableStudents.length === 0 ||
                  !effectiveTypeId
                }
                className="flex-1 rounded-xl bg-blue-600 py-5 text-white hover:bg-blue-700"
                onClick={() => handleSubmit(false)}
              >
                <Wallet className="size-4" />
                {isProcessing ? "Processing..." : `Pay ${formatMoney(total)}`}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
