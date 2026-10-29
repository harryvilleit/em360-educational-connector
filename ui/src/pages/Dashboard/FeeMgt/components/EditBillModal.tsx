import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useUpdateSchoolBillStatus } from "@/hooks/feeManagement"
import { BillPaymentStatus } from "@/api/feeManagement.api/types"
import type { SchoolBillSummaryI } from "@/api/feeManagement.api/types"
import { useSchoolMoney } from "@/hooks/useSchoolMoney"

const STATUS_OPTIONS: { label: string; value: BillPaymentStatus }[] = [
  { label: "Unpaid", value: BillPaymentStatus.Unpaid },
  { label: "Partial", value: BillPaymentStatus.Partial },
  { label: "Paid", value: BillPaymentStatus.Paid },
  { label: "Overdue", value: BillPaymentStatus.Overdue },
]

function statusLabelToValue(label: string): BillPaymentStatus {
  return (
    STATUS_OPTIONS.find((o) => o.label.toLowerCase() === label.toLowerCase())
      ?.value ?? BillPaymentStatus.Unpaid
  )
}

function toDateInputValue(iso: string) {
  return iso ? iso.slice(0, 10) : ""
}

interface Props {
  bill: SchoolBillSummaryI | null
  open: boolean
  onClose: () => void
}

export function EditBillModal({ bill, open, onClose }: Props) {
  const { currencyCode, formatMoney } = useSchoolMoney()
  const [paymentStatus, setPaymentStatus] = useState<BillPaymentStatus>(
    BillPaymentStatus.Unpaid
  )
  const [amountPaid, setAmountPaid] = useState(0)
  const [dueDate, setDueDate] = useState("")

  useEffect(() => {
    if (bill) {
      // The selected bill is external dialog input; reset the editable draft when it changes.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPaymentStatus(statusLabelToValue(bill.paymentStatus))
      setAmountPaid(bill.amountPaid)
      setDueDate(toDateInputValue(bill.dueDate))
    }
  }, [bill])

  const { updateSchoolBillStatusAsync, isPending } = useUpdateSchoolBillStatus({
    onSuccess: onClose,
  })

  if (!bill) return null

  const outstandingAmount = bill.totalAmount - amountPaid

  const handleSave = async () => {
    await updateSchoolBillStatusAsync({
      billId: bill.id,
      paymentStatus,
      amountPaid,
      dueDate: dueDate || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">
            Edit Bill — {bill.billNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">Status</Label>
            <Select
              value={String(paymentStatus)}
              onValueChange={(val) =>
                setPaymentStatus(Number(val) as BillPaymentStatus)
              }
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem
                    key={s.value}
                    value={String(s.value)}
                    className="rounded-lg"
                  >
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Amount Paid ({currencyCode})
            </Label>
            <Input
              type="number"
              className="rounded-xl"
              value={amountPaid}
              min={0}
              max={bill.totalAmount}
              onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-gray-700">
              Due Date
            </Label>
            <Input
              type="date"
              className="rounded-xl"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Total Amount</span>
              <span className="font-semibold">
                {formatMoney(bill.totalAmount)}
              </span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-gray-500">Outstanding</span>
              <span
                className={`font-semibold ${outstandingAmount > 0 ? "text-red-600" : "text-green-600"}`}
              >
                {formatMoney(outstandingAmount)}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button variant="outline" onClick={onClose} className="rounded-xl">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending}
            className="rounded-xl bg-blue-600 hover:bg-blue-700"
          >
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
