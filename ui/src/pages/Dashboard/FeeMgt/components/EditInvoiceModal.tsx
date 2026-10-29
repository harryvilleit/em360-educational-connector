import { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUpdateInvoiceStatus } from "@/hooks/feeManagement"
import type { StudentInvoiceSummaryI } from "@/api/feeManagement.api/types"
import { useSchoolMoney } from "@/hooks/useSchoolMoney"

function toDateInputValue(iso: string) {
  return iso ? iso.slice(0, 10) : ""
}

interface Props {
  invoice: StudentInvoiceSummaryI | null
  open: boolean
  onClose: () => void
}

export function EditInvoiceModal({ invoice, open, onClose }: Props) {
  const { currencyCode, formatMoney } = useSchoolMoney()
  const [amountPaid, setAmountPaid] = useState(invoice?.amountPaid ?? 0)
  const [dueDate, setDueDate] = useState(
    toDateInputValue(invoice?.dueDate ?? "")
  )

  const { updateInvoiceStatusAsync, isPending } = useUpdateInvoiceStatus({
    onSuccess: onClose,
  })

  if (!open || !invoice) return null

  const outstanding = Math.max(invoice.grandTotal - amountPaid, 0)

  const handleSave = async () => {
    await updateInvoiceStatusAsync({
      invoiceId: invoice.id,
      amountPaid,
      dueDate: dueDate || undefined,
    })
  }

  return (
    <Modal
      title={`Edit Invoice ${invoice.invoiceNumber}`}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-3">
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
        </div>
      }
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">
            Amount Paid ({currencyCode})
          </Label>
          <Input
            type="number"
            className="rounded-xl"
            value={amountPaid}
            min={0}
            max={invoice.grandTotal}
            onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium text-gray-700">Due Date</Label>
          <Input
            type="date"
            className="rounded-xl"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Grand Total</span>
            <span className="font-semibold">
              {formatMoney(invoice.grandTotal)}
            </span>
          </div>
          <div className="mt-1 flex justify-between">
            <span className="text-gray-500">Outstanding</span>
            <span
              className={`font-semibold ${outstanding > 0 ? "text-red-600" : "text-green-600"}`}
            >
              {formatMoney(outstanding)}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  )
}
