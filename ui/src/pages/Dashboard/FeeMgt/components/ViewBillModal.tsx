import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { useGetSchoolBillDetails } from "@/hooks/feeManagement"
import { formatDate } from "@/utils"
import { useSchoolMoney } from "@/hooks/useSchoolMoney"

const statusColor = (status: string) => {
  if (status === "Paid") return "bg-green-50 text-green-700"
  if (status === "Partial") return "bg-amber-50 text-amber-700"
  return "bg-red-50 text-red-600"
}

interface Props {
  billId: string | null
  open: boolean
  onClose: () => void
}

export function ViewBillModal({ billId, open, onClose }: Props) {
  const { formatMoney } = useSchoolMoney()
  const { billDetails, isLoading } = useGetSchoolBillDetails(billId ?? "")

  if (!billId) return null

  const handleDownload = () => {
    // wire up your PDF/print logic here
    window.print()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-2xl p-6">
        {isLoading || !billDetails ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-bold text-gray-900">
                  Bill Details
                </DialogTitle>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusColor(billDetails.paymentStatus)}`}
                >
                  {billDetails.paymentStatus}
                </span>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Bill meta */}
              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                <span className="text-sm text-gray-500">Bill No.</span>
                <span className="rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                  {billDetails.billNumber}
                </span>
              </div>

              {/* Customer */}
              <div className="rounded-xl border border-gray-100 px-4 py-3">
                <p className="mb-1 text-xs text-gray-400">Customer</p>
                <p className="font-medium text-gray-900">
                  {billDetails.customerName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {billDetails.session} · {billDetails.term}
                </p>
              </div>

              {/* Notes */}
              {billDetails.notes && (
                <div className="rounded-xl border border-gray-100 px-4 py-3">
                  <p className="mb-1 text-xs text-gray-400">Notes</p>
                  <p className="text-sm text-gray-700">{billDetails.notes}</p>
                </div>
              )}

              {/* Line items */}
              {billDetails.items?.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-gray-100">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-gray-400">
                          Item
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-400">
                          Qty
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-semibold text-gray-400">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {billDetails.items.map((item, i) => (
                        <tr key={i}>
                          <td className="px-4 py-2.5 text-gray-700">
                            {item.description}
                          </td>
                          <td className="px-4 py-2.5 text-right text-gray-500">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-2.5 text-right font-medium">
                            {(item.total ?? 0).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Totals */}
              <div className="space-y-2 rounded-xl bg-gray-50 px-4 py-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Amount</span>
                  <span className="font-semibold text-gray-900">
                    {formatMoney(billDetails.totalAmount ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount Paid</span>
                  <span className="font-semibold text-green-600">
                    {formatMoney(billDetails.amountPaid ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="text-gray-500">Outstanding</span>
                  <span
                    className={`font-semibold ${billDetails.outstandingAmount > 0 ? "text-red-600" : "text-green-600"}`}
                  >
                    {formatMoney(billDetails.outstandingAmount ?? 0)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between text-sm text-gray-500">
                <span>Due Date</span>
                <span className="font-medium text-gray-700">
                  {formatDate(billDetails.dueDate, "short") || "—"}
                </span>
              </div>
            </div>

            <DialogFooter className="gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="rounded-xl"
              >
                Close
              </Button>
              <Button
                onClick={handleDownload}
                className="gap-2 rounded-xl bg-blue-600 hover:bg-blue-700"
              >
                <Download className="size-4" />
                Download
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
